import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      className="flex flex-col h-screen items-center justify-center absolute top-0 bg-white z-40 w-full"
      initial={{ x: 0 }}
      animate={{ x: -2000, opacity: 30 }}
      transition={{
        duration: 0.5,
        type: "tween",
        delay: 2,
      }}
    >
      <img src="/logo-01.png" alt="logo" className="w-32 h-32 animate-bounce" />
    </motion.div>
  );
}
