"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Plane is 2x2 centered, so this fills clip space regardless of camera.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uAspect;

  // 2D simplex noise (Ashima / Stefan Gustavson)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uAspect;          // keep noise isotropic across aspect ratios
    p += uMouse * 0.06;      // gentle cursor parallax
    float t = uTime * 0.04;  // slow drift

    float n1 = snoise(p * 1.4 + vec2(t, t * 0.6));
    float n2 = snoise(p * 2.8 - vec2(t * 0.8, t));
    float field = n1 * 0.6 + n2 * 0.4;

    float bandA = smoothstep(0.0, 0.9, field);
    float bandB = smoothstep(0.1, 1.0, n2);

    vec3 bg = vec3(0.039);                      // ~#0a0a0a
    vec3 blueDeep = vec3(0.231, 0.510, 0.965);  // electric blue
    vec3 blueSky = vec3(0.220, 0.741, 0.973);   // bright sky blue

    vec3 col = bg;
    col += blueDeep * bandA * 0.24;             // kept dim for readability
    col += blueSky * bandB * 0.13;

    float vig = smoothstep(1.2, 0.2, length(uv - 0.5));
    col *= mix(0.7, 1.0, vig);
    col *= mix(0.85, 1.0, smoothstep(1.0, 0.4, uv.y));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function AuroraPlane() {
  const { invalidate, gl } = useThree();
  const active = useRef(true);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Stable uniforms object created once; mutated per-frame via the material ref.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uAspect: { value: 1 },
  }));

  // Global pointer tracking (canvas is pointer-events-none, so we listen on window).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Pause the render loop when the canvas is off-screen or the tab is hidden.
  useEffect(() => {
    const el = gl.domElement;
    let inView = true;
    let visible = !document.hidden;
    const update = () => {
      const now = inView && visible;
      active.current = now;
      if (now) invalidate(); // restart the demand loop
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(el);
    const onVisibility = () => {
      visible = !document.hidden;
      update();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [gl, invalidate]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uAspect.value = state.size.width / state.size.height;
    // ease the cursor toward its target
    mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;
    mat.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    // self-sustaining loop under frameloop="demand"; stops when inactive
    if (active.current) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HeroScene({ lowPower }: { lowPower: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop="demand"
      dpr={lowPower ? [1, 1] : [1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
    >
      <AuroraPlane />
    </Canvas>
  );
}
