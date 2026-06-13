import { Scrollytelling } from "@/components/landing/Scrollytelling";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-white/20">
      <Navbar />

      {/* Main Scrollytelling Experience */}
      <Scrollytelling />

      {/* Cinematic Transition to Footer */}
      <footer className="fixed bottom-12 left-0 w-full z-50 px-12 pointer-events-none">
        <div className="flex justify-between items-center opacity-20">
           <div className="text-[9px] uppercase tracking-[0.4em] font-black text-white">© 2026 FRAUDLENS CORE. ALL RIGHTS RESERVED.</div>
           <div className="flex gap-10 text-[9px] uppercase tracking-[0.4em] font-black text-white pointer-events-auto">
             <a href="#" className="hover:text-white transition-colors">Privacy Architecture</a>
             <a href="#" className="hover:text-white transition-colors">Operational Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
