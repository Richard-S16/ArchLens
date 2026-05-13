export const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
