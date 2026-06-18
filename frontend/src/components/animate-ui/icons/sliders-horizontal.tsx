'use client';

import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type SlidersHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    handle1: {
      initial: { cx: 6 },
      animate: {
        cx: [6, 14, 6],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    handle2: {
      initial: { cx: 18 },
      animate: {
        cx: [18, 10, 18],
        transition: { duration: 0.7, ease: 'easeInOut', delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SlidersHorizontalProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="2" y1="16" x2="22" y2="16" />
      <motion.circle
        cy={8}
        r={2}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        variants={variants.handle1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cy={16}
        r={2}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        variants={variants.handle2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SlidersHorizontal(props: SlidersHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SlidersHorizontal,
  SlidersHorizontal as SlidersHorizontalIcon,
  type SlidersHorizontalProps,
  type SlidersHorizontalProps as SlidersHorizontalIconProps,
};
