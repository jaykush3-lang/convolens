"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const glowX = useSpring(cursorX, { stiffness: 180, damping: 26, mass: 0.8 });
  const glowY = useSpring(cursorY, { stiffness: 180, damping: 26, mass: 0.8 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");

    const syncEnabled = () => setEnabled(media.matches);
    syncEnabled();

    const handleMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    media.addEventListener("change", syncEnabled);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      media.removeEventListener("change", syncEnabled);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [cursorX, cursorY]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-4 w-4 rounded-full border border-white/70 bg-[rgba(255,255,255,0.25)] shadow-[0_0_24px_rgba(255,255,255,0.35)] mix-blend-difference md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          scale: pressed ? 0.7 : 1
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(69,205,191,0.26)_0%,_rgba(246,185,76,0.18)_46%,_rgba(255,255,255,0)_72%)] blur-2xl md:block"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          scale: pressed ? 0.9 : 1.1
        }}
      />
    </>
  );
}
