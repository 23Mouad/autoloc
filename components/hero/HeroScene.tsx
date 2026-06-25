"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function GoldenParticles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.02;
      mesh.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial color="#C9A84C" size={0.04} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function MouseTracker({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
      mousePos.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.5;
    };
    canvas.addEventListener("mousemove", handler, { passive: true });
    return () => canvas.removeEventListener("mousemove", handler);
  }, [gl, mousePos]);

  return null;
}

function CarModel() {
  const group = useRef<THREE.Group>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.15;
    group.current.position.y = Math.sin(t * 0.5) * 0.15;
    const targetX = (mousePos.current.y - group.current.rotation.x) * 0.02;
    const targetZ = (mousePos.current.x - group.current.rotation.z) * 0.02;
    group.current.rotation.x += targetX;
    group.current.rotation.z += targetZ;
  });

  return (
    <>
      <MouseTracker mousePos={mousePos} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={group} scale={1.2}>
          {/* Stylized car body */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[3, 0.6, 1.4]} />
            <meshStandardMaterial color="#1a1a20" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Cabin */}
          <mesh position={[0.2, 0.55, 0]} castShadow>
            <boxGeometry args={[1.6, 0.55, 1.2]} />
            <meshStandardMaterial color="#111115" metalness={0.8} roughness={0.3} transparent opacity={0.85} />
          </mesh>
          {/* Wheels */}
          {[[-1, -0.3, 0.7], [-1, -0.3, -0.7], [1, -0.3, 0.7], [1, -0.3, -0.7]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
              <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
          {/* Gold accents — headlights */}
          <mesh position={[1.5, 0, 0.5]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={2} />
          </mesh>
          <mesh position={[1.5, 0, -0.5]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={2} />
          </mesh>
          {/* Taillights */}
          <mesh position={[-1.5, 0.05, 0.5]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#E05252" emissive="#E05252" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[-1.5, 0.05, -0.5]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#E05252" emissive="#E05252" emissiveIntensity={1.5} />
          </mesh>
          {/* Golden ring orbit */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.015, 8, 64]} />
            <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.5} transparent opacity={0.4} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-screen" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={["#0A0A0C", 8, 25]} />
        <ambientLight intensity={0.15} color="#4466aa" />
        <directionalLight position={[5, 3, 2]} intensity={1.2} color="#E8C97A" />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#4466aa" />
        <pointLight position={[0, -2, 0]} intensity={0.3} color="#C9A84C" />
        <Stars radius={50} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
        <GoldenParticles count={300} />
        <CarModel />
      </Canvas>
    </div>
  );
}
