'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, type SpringOptions } from 'motion/react';
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
  transition = { stiffness: 100, damping: 20 },
  colors = DEFAULT_COLORS,
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  const rectRef = React.useRef<DOMRect | null>(null);
  const rafIdRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
      }
    };
    updateRect();
    const el = containerRef.current;
    const ro = new ResizeObserver(updateRect);
    if (el) ro.observe(el);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  React.useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = rectRef.current;
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
      });
    };
    el.addEventListener('mousemove', handleMouseMove as EventListener, { passive: true });
    return () => {
      el.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [interactive, mouseX, mouseY]);

  const blobBase: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    mixBlendMode: 'hard-light',
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
        '--bubble-first': colors.first,
        '--bubble-second': colors.second,
        '--bubble-third': colors.third,
        '--bubble-fourth': colors.fourth,
        '--bubble-fifth': colors.fifth,
        '--bubble-sixth': colors.sixth,
        ...props.style,
      } as React.CSSProperties}
      {...props}
    >

      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
        <defs>
          <filter id="bubble-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div style={{ position: 'absolute', inset: 0, filter: 'url(#bubble-goo) blur(50px)' }}>
        {/* Blob 1 — bounces vertically */}
        <motion.div
          style={{
            ...blobBase,
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: 'radial-gradient(circle at center, rgba(var(--bubble-first),0.35) 0%, rgba(var(--bubble-first),0) 50%)',
          }}
          animate={{ y: [-50, 50, -50] }}
          transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
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
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
        >
          <div style={{
            ...blobBase,
            position: 'relative',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle at center, rgba(var(--bubble-second),0.35) 0%, rgba(var(--bubble-second),0) 50%)',
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
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          <div style={{
            ...blobBase,
            width: '80%',
            height: '80%',
            top: 'calc(50% + 200px)',
            left: 'calc(50% - 500px)',
            background: 'radial-gradient(circle at center, rgba(var(--bubble-third),0.35) 0%, rgba(var(--bubble-third),0) 50%)',
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
            opacity: 0.7,
            background: 'radial-gradient(circle at center, rgba(var(--bubble-fourth),0.35) 0%, rgba(var(--bubble-fourth),0) 50%)',
          }}
          animate={{ x: [-50, 50, -50] }}
          transition={{ duration: 40, ease: 'easeInOut', repeat: Infinity }}
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
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
        >
          <div style={{
            ...blobBase,
            width: '160%',
            height: '160%',
            top: 'calc(50% - 80%)',
            left: 'calc(50% - 80%)',
            background: 'radial-gradient(circle at center, rgba(var(--bubble-fifth),0.35) 0%, rgba(var(--bubble-fifth),0) 50%)',
          }} />
        </motion.div>

        {/* Blob 6 — interactive cursor follower */}
        {interactive && (
          <motion.div
            style={{
              ...blobBase,
              width: '100%',
              height: '100%',
              opacity: 0.7,
              background: 'radial-gradient(circle at center, rgba(var(--bubble-sixth),0.35) 0%, rgba(var(--bubble-sixth),0) 50%)',
              x: springX,
              y: springY,
            }}
          />
        )}
      </div>

      {children}
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps, type BubbleColors };
