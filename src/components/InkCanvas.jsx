import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// SHADERS
// -----------------------------------------------------------------------------

const baseVertex = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const splatShader = `
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

varying vec2 vUv;

void main() {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
}
`;

const advectionShader = `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

varying vec2 vUv;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
}
`;

const divergenceShader = `
uniform sampler2D uVelocity;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;

    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const pressureShader = `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    
    float pressure = (L + R + T + B - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const gradientSubtractShader = `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;

    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const displayShader = `
uniform sampler2D uTexture;
uniform sampler2D uDye;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec3 c = texture2D(uDye, vUv).rgb;
    float density = c.r; // Use red channel for density intensity
    
    // Background color: Deep charcoal / near black
    vec3 bg = vec3(0.02, 0.02, 0.02);

    // Fluid color: slightly lighter, maybe bluish tint for "water/ink"
    // vec3 fluid = vec3(0.12, 0.14, 0.16);
    // Let's make it a bit more elegant/silvery
    vec3 fluid = vec3(0.15, 0.15, 0.17);
    
    // Mix based on density
    float alpha = smoothstep(0.0, 0.2, density);
    vec3 finalColor = mix(bg, fluid, alpha);
    
    // Add subtle vignette
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    finalColor *= 1.0 - smoothstep(0.5, 1.5, dist);

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// -----------------------------------------------------------------------------
// SIMULATION COMPONENT
// -----------------------------------------------------------------------------

const Simulation = () => {
    const { gl, size } = useThree();

    // Simulation settings
    const simRes = 128; // Simulation resolution (lower is faster)
    const dyeRes = 512; // Dye resolution (higher for crisp visuals)

    // Use HalfFloatType for good balance of performance and precision
    // Note: Some older devices might need FloatType for pressure solve stability,
    // but HalfFloat is usually fine for visual fluid.
    const fboOptions = useMemo(() => ({
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
    }), []);

    // FBOs
    const density = useFBO(dyeRes, dyeRes, fboOptions);
    const density2 = useFBO(dyeRes, dyeRes, fboOptions);
    const velocity = useFBO(simRes, simRes, fboOptions);
    const velocity2 = useFBO(simRes, simRes, fboOptions);
    const divergence = useFBO(simRes, simRes, fboOptions);
    const pressure = useFBO(simRes, simRes, fboOptions);
    const pressure2 = useFBO(simRes, simRes, fboOptions);

    // Fullscreen Quad Geometry & Camera for simulation passes
    const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
    const simGeometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
    const simScene = useMemo(() => new THREE.Scene(), []);
    const simMesh = useMemo(() => new THREE.Mesh(simGeometry), [simGeometry]);

    useEffect(() => {
        simScene.add(simMesh);
        return () => simScene.remove(simMesh);
    }, [simScene, simMesh]);

    // Materials
    const materials = useMemo(() => ({
        advection: new THREE.ShaderMaterial({
            uniforms: {
                uVelocity: { value: null },
                uSource: { value: null },
                texelSize: { value: new THREE.Vector2() },
                dt: { value: 0.016 },
                dissipation: { value: 0.98 },
            },
            vertexShader: baseVertex,
            fragmentShader: advectionShader,
            depthTest: false,
            depthWrite: false,
        }),
        splat: new THREE.ShaderMaterial({
            uniforms: {
                uTarget: { value: null },
                aspectRatio: { value: 1 },
                color: { value: new THREE.Vector3() },
                point: { value: new THREE.Vector2() },
                radius: { value: 0.0025 },
            },
            vertexShader: baseVertex,
            fragmentShader: splatShader,
            depthTest: false,
            depthWrite: false,
        }),
        divergence: new THREE.ShaderMaterial({
            uniforms: {
                uVelocity: { value: null },
                texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: baseVertex,
            fragmentShader: divergenceShader,
            depthTest: false,
            depthWrite: false,
        }),
        pressure: new THREE.ShaderMaterial({
            uniforms: {
                uPressure: { value: null },
                uDivergence: { value: null },
                texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: baseVertex,
            fragmentShader: pressureShader,
            depthTest: false,
            depthWrite: false,
        }),
        gradientSubtract: new THREE.ShaderMaterial({
            uniforms: {
                uPressure: { value: null },
                uVelocity: { value: null },
                texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: baseVertex,
            fragmentShader: gradientSubtractShader,
            depthTest: false,
            depthWrite: false,
        }),
        display: new THREE.ShaderMaterial({
            uniforms: {
                uDye: { value: null },
                uResolution: { value: new THREE.Vector2() },
            },
            vertexShader: baseVertex,
            fragmentShader: displayShader,
            depthTest: false,
            depthWrite: false,
        }),
    }), []);

    // Mouse tracking
    const mouse = useRef(new THREE.Vector2(0, 0));
    const lastMouse = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalized coordinates (0 to 1)
            // Flip Y because texture coordinates often start bottom-left but screen is top-left
            mouse.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // State for ping-pong buffers
    // We store 'read' and 'write' references and swap them manually
    const state = useRef({
        density: { read: density, write: density2 },
        velocity: { read: velocity, write: velocity2 },
        pressure: { read: pressure, write: pressure2 },
    });

    useFrame((_, delta) => {
        // Clamp delta time to avoid instability on lag spikes
        const dt = Math.min(delta, 0.05);

        // Helper to render material to target
        const render = (material, target) => {
            simMesh.material = material;
            gl.setRenderTarget(target);
            gl.render(simScene, simCamera);
        };

        // 1. Advection (Velocity)
        materials.advection.uniforms.uVelocity.value = state.current.velocity.read.texture;
        materials.advection.uniforms.uSource.value = state.current.velocity.read.texture;
        materials.advection.uniforms.texelSize.value.set(1.0 / simRes, 1.0 / simRes);
        materials.advection.uniforms.dt.value = dt;
        materials.advection.uniforms.dissipation.value = 0.98; // Velocity dissipation

        render(materials.advection, state.current.velocity.write);

        // Swap velocity
        let temp = state.current.velocity.read;
        state.current.velocity.read = state.current.velocity.write;
        state.current.velocity.write = temp;

        // 2. Advection (Density/Dye)
        materials.advection.uniforms.uVelocity.value = state.current.velocity.read.texture;
        materials.advection.uniforms.uSource.value = state.current.density.read.texture;
        materials.advection.uniforms.texelSize.value.set(1.0 / dyeRes, 1.0 / dyeRes);
        materials.advection.uniforms.dissipation.value = 0.97; // Density dissipation

        render(materials.advection, state.current.density.write);

        // Swap density
        temp = state.current.density.read;
        state.current.density.read = state.current.density.write;
        state.current.density.write = temp;

        // 3. Splat (Mouse Interaction)
        const dx = mouse.current.x - lastMouse.current.x;
        const dy = mouse.current.y - lastMouse.current.y;

        // Only splat if mouse moved
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
            // Add Velocity
            materials.splat.uniforms.uTarget.value = state.current.velocity.read.texture;
            materials.splat.uniforms.aspectRatio.value = size.width / size.height;
            materials.splat.uniforms.point.value.copy(mouse.current);
            // Scale force by movement speed
            materials.splat.uniforms.color.value.set(dx * 50.0, dy * 50.0, 1.0);
            materials.splat.uniforms.radius.value = 0.002;

            render(materials.splat, state.current.velocity.write);

            // Swap velocity
            temp = state.current.velocity.read;
            state.current.velocity.read = state.current.velocity.write;
            state.current.velocity.write = temp;

            // Add Density
            materials.splat.uniforms.uTarget.value = state.current.density.read.texture;
            materials.splat.uniforms.color.value.set(0.5, 0.5, 0.5); // Add brightness

            render(materials.splat, state.current.density.write);

            // Swap density
            temp = state.current.density.read;
            state.current.density.read = state.current.density.write;
            state.current.density.write = temp;
        }

        lastMouse.current.copy(mouse.current);

        // 4. Divergence
        materials.divergence.uniforms.uVelocity.value = state.current.velocity.read.texture;
        materials.divergence.uniforms.texelSize.value.set(1.0 / simRes, 1.0 / simRes);

        render(materials.divergence, divergence);

        // 5. Pressure (Jacobi Iteration)
        materials.pressure.uniforms.uDivergence.value = divergence.texture;
        materials.pressure.uniforms.texelSize.value.set(1.0 / simRes, 1.0 / simRes);

        // Use current pressure as initial guess
        materials.pressure.uniforms.uPressure.value = state.current.pressure.read.texture;

        for (let i = 0; i < 20; i++) {
            materials.pressure.uniforms.uPressure.value = state.current.pressure.read.texture;

            render(materials.pressure, state.current.pressure.write);

            // Swap pressure
            temp = state.current.pressure.read;
            state.current.pressure.read = state.current.pressure.write;
            state.current.pressure.write = temp;
        }

        // 6. Gradient Subtract
        materials.gradientSubtract.uniforms.uPressure.value = state.current.pressure.read.texture;
        materials.gradientSubtract.uniforms.uVelocity.value = state.current.velocity.read.texture;
        materials.gradientSubtract.uniforms.texelSize.value.set(1.0 / simRes, 1.0 / simRes);

        render(materials.gradientSubtract, state.current.velocity.write);

        // Swap velocity
        temp = state.current.velocity.read;
        state.current.velocity.read = state.current.velocity.write;
        state.current.velocity.write = temp;

        // 7. Render to Screen (using the main scene's camera and returned mesh)
        // Reset render target to screen (null) is handled by R3F's main loop if we don't set it?
        // Actually, we must reset it or the next render pass (the returned mesh) won't render to screen.
        gl.setRenderTarget(null);

        // Update display material texture
        materials.display.uniforms.uDye.value = state.current.density.read.texture;
        materials.display.uniforms.uResolution.value.set(size.width, size.height);
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <primitive object={materials.display} attach="material" />
        </mesh>
    );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

const InkCanvas = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 1] }}
                dpr={[1, 1.5]}
                gl={{
                    alpha: false,
                    depth: false,
                    antialias: false,
                    stencil: false,
                    powerPreference: "high-performance"
                }}
            >
                <Simulation />
            </Canvas>
        </div>
    );
};

export default InkCanvas;
