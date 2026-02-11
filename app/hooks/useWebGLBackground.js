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

        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        vec3 deepBlue = vec3(0.05, 0.05, 0.09);
        vec3 magenta = vec3(0.62, 0.16, 0.27);
        vec3 violet = vec3(0.38, 0.18, 0.46);
        vec3 teal = vec3(0.22, 0.55, 0.55);
        vec3 lightPink = vec3(0.9, 0.5, 0.6);

        void main() {
          vec2 uv = vUv;
          vec2 p = uv * 2.0 - 1.0;
          float r = length(p);

          float t = u_time * 0.1;
          float waveA = sin(uv.x * 10.0 + t * 2.0) * 0.1;
          float waveB = cos(uv.y * 6.0 - t * 1.5) * 0.08;
          float waveC = sin(uv.x * 4.0 + uv.y * 4.0 + t * 0.5) * 0.06;

          float mixFactor1 = smoothstep(0.1, 0.9, uv.x + waveA + waveC);
          float mixFactor2 = smoothstep(0.1, 0.9, 1.0 - uv.y + waveB);

          vec3 color = mix(deepBlue, magenta, mixFactor1);
          color = mix(color, violet, mixFactor2 * 0.8);

          float swirl = sin(r * 5.0 + t * 3.0) * 0.5 + 0.5;
          color = mix(color, lightPink, swirl * smoothstep(0.5, 0.0, r) * 0.4);
          color = mix(color, teal, smoothstep(0.2, 0.8, uv.y) * 0.35);

          float grain = noise(uv * (u_resolution / 80.0) + t) - 0.5;
          color += grain * 0.18 * u_intensity;

          float vignette = smoothstep(1.2, 0.25, r);
          gl_FragColor = vec4(color, 1.0) * vignette;
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
