"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function Reveal({ children, width = "100%", delay = 0, direction = "up" }: RevealProps) {
  const getVariants = () => {
    switch (direction) {
      case "up": return { hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { opacity: 0, y: -75 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 75 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -75 }, visible: { opacity: 1, x: 0 } };
      case "none": return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <div style={{ width, overflow: "hidden" }}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
