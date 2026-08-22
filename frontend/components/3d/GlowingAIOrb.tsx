'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ isProcessing }: { isProcessing: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += delta * 0.3;
      sphereRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.8}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.1}>
        <MeshDistortMaterial
          color={isProcessing ? '#22d3ee' : '#8b5cf6'}
          attach="material"
          distort={isProcessing ? 0.55 : 0.35}
          speed={isProcessing ? 4 : 2}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>
    </Float>
  );
}

export function GlowingAIOrbCanvas({ isProcessing = false }: { isProcessing?: boolean }) {
  return (
    <div className="w-full h-full min-h-[120px] min-w-[120px] relative flex items-center justify-center">
      {/* Fallback CSS 3D Glow Rings while WebGL mounts */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-20 h-20 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
      </div>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#22d3ee" intensity={2.5} />
        <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={2} />
        <AnimatedOrb isProcessing={isProcessing} />
      </Canvas>
    </div>
  );
}

export default GlowingAIOrbCanvas;
