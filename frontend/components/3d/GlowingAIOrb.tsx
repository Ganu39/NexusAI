'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ isProcessing }: { isProcessing: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += delta * 0.2;
      sphereRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color={isProcessing ? '#22d3ee' : '#8b5cf6'}
          attach="material"
          distort={isProcessing ? 0.6 : 0.3}
          speed={isProcessing ? 4 : 1.5}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export function GlowingAIOrbCanvas({ isProcessing = false }: { isProcessing?: boolean }) {
  return (
    <div className="w-full h-full min-h-[140px] aria-hidden='true'">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} color="#22d3ee" intensity={2} />
        <AnimatedOrb isProcessing={isProcessing} />
      </Canvas>
    </div>
  );
}

export default GlowingAIOrbCanvas;
