import { coachMotion } from '../../lib/coachTheme'

export const kickoffVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...coachMotion.spring,
      staggerChildren: coachMotion.stagger,
    },
  },
}

export const kickoffItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: coachMotion.spring },
}

export const lineupRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...coachMotion.spring, delay: i * coachMotion.rowStagger },
  }),
}

export const bootPress = {
  whileTap: { scale: 0.95 },
  transition: coachMotion.spring,
}

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: coachMotion.spring },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}
