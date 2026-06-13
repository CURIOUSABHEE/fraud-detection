import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Overview", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/dashboard/history" },
    { name: "AI Engine", path: "/dashboard/ai" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-6 flex items-center justify-between ${
        scrolled ? "bg-black/40 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
      }`}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform duration-500">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white uppercase group-hover:opacity-80 transition-opacity">
          FraudLens <span className="text-white/40 font-light">AI</span>
        </span>
      </Link>

      <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-full p-1 backdrop-blur-md">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`px-6 py-2 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                isActive 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-6">
        {!user ? (
          <>
            <Link 
              to="/login" 
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-3 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-black rounded-full hover:bg-white/90 transition-all flex items-center gap-2 group"
            >
              Open Dashboard
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </>
        ) : (
          <Link 
            to={user.isAdmin ? "/admin" : "/dashboard"}
            className="px-6 py-3 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-black rounded-full hover:bg-white/90 transition-all flex items-center gap-2 group"
          >
            Dashboard
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </nav>
  );
};
