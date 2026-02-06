import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uHoverState; // 0 to 1 based on movement intensity

varying vec2 vUv;

// Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Noise function
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Cubic Hermite Curve
    f = f*f*(3.0-2.0*f);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion)
#define OCTAVES 4
float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Domain Warping for fluid ink effect
float domainWarp(vec2 p) {
    vec2 q = vec2(0.);
    q.x = fbm(p + vec2(0.0, 0.0));
    q.y = fbm(p + vec2(5.2, 1.3));

    vec2 r = vec2(0.);
    r.x = fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.15*uTime);
    r.y = fbm(p + 4.0*q + vec2(8.3, 2.8) + 0.126*uTime);

    return fbm(p + 4.0*r);
}

void main() {
    // Normalize coordinates
    vec2 st = vUv;
    st.x *= uResolution.x / uResolution.y;

    // Mouse Ripple / Distortion
    // We disturb the coordinate system based on mouse position
    vec2 mouse = uMouse;
    mouse.x *= uResolution.x / uResolution.y;
    
    float dist = distance(st, mouse);
    float ripple = smoothstep(0.5, 0.0, dist);
    
    // Add ripple to the coordinate for the warp
    vec2 warpedSt = st + vec2(ripple * 0.05 * sin(uTime * 2.0));

    // Calculate Ink
    // Scale up st for detail
    float ink = domainWarp(warpedSt * 3.0);
    
    // Contrast and shaping
    ink = smoothstep(0.1, 0.9, ink);

    // Color Palette
    vec3 colorBg = vec3(0.02, 0.02, 0.02); // Almost Black
    vec3 colorInk = vec3(0.12, 0.12, 0.14); // Dark Grey Ink
    
    // Mix based on noise value
    vec3 finalColor = mix(colorBg, colorInk, ink);
    
    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5) * 1.5);
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const InkMesh = () => {
    const meshRef = useRef();
    const { viewport, mouse, size } = useThree();

    // Uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uHoverState: { value: 0 }
        }),
        []
    );

    // Update loop
    useFrame((state) => {
        const { clock } = state;
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();

            // Interpolate mouse position for smoothness
            // Convert normalized device coords (-1 to 1) to UV space (0 to 1) roughly for shader
            // Actually standardizing on screen ratio in shader, so passing raw 0-1 might be better
            // But Three.js mouse is -1 to 1.
            const targetX = (state.mouse.x + 1) / 2;
            const targetY = (state.mouse.y + 1) / 2;

            // Simple lerp for smoothness could go here, but uniforms update every frame is ok
            meshRef.current.material.uniforms.uMouse.value.set(targetX, targetY);

            // Update resolution if window resized
            meshRef.current.material.uniforms.uResolution.value.set(size.width, size.height);
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={false}
            />
        </mesh>
    );
};

const InkCanvas = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <InkMesh />
            </Canvas>
        </div>
    );
};

export default InkCanvas;
