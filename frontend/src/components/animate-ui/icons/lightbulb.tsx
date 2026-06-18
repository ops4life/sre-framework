'use client';

import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type LightbulbProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    bulb: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 1.15, 0.95, 1.08, 1],
        opacity: [1, 1, 1, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    base1: {
      initial: { opacity: 0.6 },
      animate: {
        opacity: [0.6, 1, 0.6],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    base2: {
      initial: { opacity: 0.6 },
      animate: {
        opacity: [0.6, 1, 0.6],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.08 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LightbulbProps) {
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
      <motion.path
        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
        variants={variants.bulb}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: '12px 8px' }}
      />
      <motion.path
        d="M9 18h6"
        variants={variants.base1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 22h4"
        variants={variants.base2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Lightbulb(props: LightbulbProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Lightbulb,
  Lightbulb as LightbulbIcon,
  type LightbulbProps,
  type LightbulbProps as LightbulbIconProps,
};
