"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export function useWebGLBackground(canvasRef, enabled = true) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_intensity: { value: prefersReducedMotion ? 0.2 : 1 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_intensity;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          float a = hash(i + vec2(0.0, 0.0));
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amp = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amp * noise(p);
            p *= 2.02;
            amp *= 0.52;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = u_resolution.x / max(u_resolution.y, 1.0);
          vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
          float t = u_time * (0.38 + 0.22 * u_intensity);

          // Flow field for horizontal drift + sway.
          vec2 flowUv = uv;
          flowUv.x += sin((uv.y * 6.0) + t * 0.75) * 0.035;
          flowUv.y += sin((uv.x * 4.0) - t * 0.38) * 0.02;

          float n = fbm(flowUv * vec2(3.4, 2.0) + vec2(t * 0.32, -t * 0.18));

          float waveTop = 0.76
            + 0.05 * sin(flowUv.x * 4.8 + t * 0.9)
            + 0.03 * sin(flowUv.x * 11.0 - t * 1.3)
            + (n - 0.5) * 0.05;

          float waveMid = 0.52
            + 0.07 * sin(flowUv.x * 3.6 - t * 0.66)
            + 0.028 * sin(flowUv.x * 9.6 + t * 1.1)
            + (n - 0.5) * 0.045;

          float waveBottom = 0.18
            + 0.06 * sin(flowUv.x * 4.1 + t * 0.72)
            + 0.024 * sin(flowUv.x * 8.8 - t * 0.94)
            + (n - 0.5) * 0.04;

          vec3 base = vec3(0.03, 0.03, 0.05);
          vec3 pink = vec3(0.93, 0.19, 0.64);
          vec3 red = vec3(0.95, 0.28, 0.23);
          vec3 teal = vec3(0.17, 0.79, 0.73);
          vec3 purple = vec3(0.47, 0.2, 0.86);

          // Soft wave bodies
          float topMask = smoothstep(waveTop + 0.16, waveTop - 0.06, uv.y);
          float midMask = smoothstep(waveMid + 0.18, waveMid - 0.08, uv.y);
          float bottomMask = smoothstep(waveBottom + 0.14, waveBottom - 0.06, uv.y);

          // Bright crests to mimic blending liquid edges.
          float crestTop = exp(-pow((uv.y - waveTop) / 0.085, 2.0));
          float crestMid = exp(-pow((uv.y - waveMid) / 0.095, 2.0));
          float crestBottom = exp(-pow((uv.y - waveBottom) / 0.1, 2.0));

          vec3 color = base;
          color = mix(color, teal, topMask * 0.72);
          color = mix(color, red, midMask * 0.86);
          color = mix(color, purple, bottomMask * 0.8);

          color += pink * crestTop * 0.92;
          color += red * crestMid * 0.68;
          color += vec3(0.68, 0.32, 0.93) * crestBottom * 0.58;

          // Extra soft bloom region around center to emulate fluid blending.
          float bloom = exp(-dot(p * vec2(1.0, 1.15), p * vec2(1.0, 1.15)) * 3.8);
          color += vec3(0.22, 0.08, 0.2) * bloom * 0.65;

          float grain = (hash(uv * u_resolution * 0.35 + t * 17.0) - 0.5) * 0.1;
          color += grain * u_intensity;

          float vignette = smoothstep(1.12, 0.18, length(p));
          color *= vignette;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.u_resolution.value.set(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      if (!prefersReducedMotion) {
        uniforms.u_time.value = clock.getElapsedTime();
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
    };
  }, [canvasRef, enabled, prefersReducedMotion]);
}
