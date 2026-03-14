import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "accent" | "destructive" | "success" | "none";
}

export const GlassCard = ({ children, className, hover = true, glow = "none" }: GlassCardProps) => {
  const glowMap = {
    none: "",
    primary: "hover:glow-primary",
    accent: "hover:glow-accent",
    destructive: "hover:shadow-destructive/20 hover:shadow-lg",
    success: "hover:shadow-success/20 hover:shadow-lg",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-card rounded-xl p-6 transition-shadow duration-300",
        glowMap[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
};
