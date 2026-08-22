'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
}

export function GlassCard({ children, className = '', enableTilt = true }: GlassCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: enableTilt ? rotateY : 0,
        rotateX: enableTilt ? rotateX : 0,
        transformStyle: 'preserve-3d',
      }}
      className={`relative backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl shadow-2xl transition-all duration-200 hover:border-cyan-400/40 hover:shadow-cyan-500/10 focus-within:ring-2 focus-within:ring-cyan-400 ${className}`}
    >
      <div style={{ transform: enableTilt ? 'translateZ(15px)' : 'none' }}>
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;
