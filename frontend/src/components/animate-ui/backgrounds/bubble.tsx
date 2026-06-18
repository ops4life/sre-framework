'use client';

import * as React from 'react';
import { motion, type SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';

type BubbleColors = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  sixth: string;
};

type BubbleBackgroundProps = React.ComponentProps<'div'> & {
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: BubbleColors;
};

const DEFAULT_COLORS: BubbleColors = {
  first: '202,255,4',
  second: '0,220,255',
  third: '140,100,255',
  fourth: '202,255,4',
  fifth: '59,130,246',
  sixth: '202,255,4',
};

function BubbleBackground({
  ref,
  className,
  children,
  interactive = false,
  transition,
  colors = DEFAULT_COLORS,
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const blobBase: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    transform: 'translateZ(0)',
    willChange: 'transform',
  };

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn(className)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...props.style,
      }}
      {...props}
    >
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(80px)' }}>
        {/* Blob 1 — bounces vertically */}
        <motion.div
          style={{
            ...blobBase,
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: `radial-gradient(circle at center, rgba(${colors.first},0.12) 0%, rgba(${colors.first},0) 70%)`,
          }}
          animate={{ y: [-60, 60, -60] }}
          transition={{ duration: 80, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Blob 2 — orbits */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% - 400px)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 100, ease: 'linear', repeat: Infinity }}
        >
          <div style={{
            ...blobBase,
            position: 'relative',
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle at center, rgba(${colors.second},0.1) 0%, rgba(${colors.second},0) 70%)`,
          }} />
        </motion.div>

        {/* Blob 3 — orbits opposite */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% + 400px)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 120, ease: 'linear', repeat: Infinity }}
        >
          <div style={{
            ...blobBase,
            width: '80%',
            height: '80%',
            top: 'calc(50% + 200px)',
            left: 'calc(50% - 500px)',
            background: `radial-gradient(circle at center, rgba(${colors.third},0.12) 0%, rgba(${colors.third},0) 70%)`,
          }} />
        </motion.div>

        {/* Blob 4 — bounces horizontally */}
        <motion.div
          style={{
            ...blobBase,
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: `radial-gradient(circle at center, rgba(${colors.fourth},0.08) 0%, rgba(${colors.fourth},0) 70%)`,
          }}
          animate={{ x: [-80, 80, -80] }}
          transition={{ duration: 90, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Blob 5 — large, slow orbit */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% - 800px) calc(50% + 200px)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 140, ease: 'linear', repeat: Infinity }}
        >
          <div style={{
            ...blobBase,
            width: '160%',
            height: '160%',
            top: 'calc(50% - 80%)',
            left: 'calc(50% - 80%)',
            background: `radial-gradient(circle at center, rgba(${colors.fifth},0.1) 0%, rgba(${colors.fifth},0) 70%)`,
          }} />
        </motion.div>
      </div>

      {children}
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps, type BubbleColors };
