import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 240;
const FRAME_PATH = "/CardFrames/ezgif-frame-";

export const Scrollytelling = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Balanced smooth progress for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.0001,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

  useEffect(() => {
    const preloadImages = async () => {
      let loadedCount = 0;
      const imagePromises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          const frameNum = (i + 1).toString().padStart(3, "0");
          img.src = `${FRAME_PATH}${frameNum}.jpg`;
          img.onload = () => {
            loadedCount++;
            setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
            resolve(img);
          };
          img.onerror = () => resolve(img); // Handle missing frames gracefully
        });
      });
      
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages);
      setIsLoaded(true);
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const render = () => {
      const index = Math.floor(frameIndex.get()) - 1;
      const safeIndex = Math.max(0, Math.min(index, TOTAL_FRAMES - 1));
      const img = images[safeIndex];

      if (img) {
        // High fidelity rendering
        const windowRatio = window.innerWidth / window.innerHeight;
        const imgRatio = img.width / img.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;

        if (windowRatio > imgRatio) {
          drawWidth = window.innerWidth;
          drawHeight = window.innerWidth / imgRatio;
          offsetX = 0;
          offsetY = (window.innerHeight - drawHeight) / 2;
        } else {
          drawHeight = window.innerHeight;
          drawWidth = window.innerHeight * imgRatio;
          offsetX = (window.innerWidth - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const unsubscribe = frameIndex.on("change", render);
    render();

    const handleResize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      render();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoaded, images, frameIndex]);

  // Storytelling Opacity Mappings
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  const monitorOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const monitorY = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [50, 0, 0, -50]);

  const engineOpacity = useTransform(scrollYProgress, [0.45, 0.5, 0.65, 0.7], [0, 1, 1, 0]);
  const engineY = useTransform(scrollYProgress, [0.45, 0.5, 0.65, 0.7], [50, 0, 0, -50]);

  const decisionOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.9, 0.95], [0, 1, 1, 0]);
  const decisionY = useTransform(scrollYProgress, [0.75, 0.8, 0.9, 0.95], [50, 0, 0, -50]);

  const ctaOpacity = useTransform(scrollYProgress, [0.95, 0.98], [0, 1]);
  const ctaScale = useTransform(scrollYProgress, [0.95, 0.99], [0.9, 1]);

  return (
    <div ref={containerRef} className="relative bg-[#050505]" style={{ height: "800vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <AnimatePresence>
          {!isLoaded && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#050505]"
            >
              <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  className="h-full bg-white"
                />
              </div>
              <span className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Initialising Core</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ 
            filter: "contrast(1.05) brightness(1.02) saturate(1.1)" 
          }}
        />

        {/* Cinematic Glare & Lighting Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,120,255,0.05),transparent_70%)]" />
        </div>

        {/* Content Overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          
          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute text-center max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none text-white drop-shadow-2xl">
              INTELLIGENT <br /> FRAUD ENGINE
            </h1>
            <p className="text-lg md:text-xl text-white/50 font-medium tracking-widest uppercase">
              Secure Payments. Absolute Confidence.
            </p>
          </motion.div>

          <motion.div style={{ opacity: monitorOpacity, y: monitorY }} className="absolute text-center max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Real-time Monitoring
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
              Every transaction across the world analysed <br /> with sub-millisecond latency.
            </p>
          </motion.div>

          <motion.div style={{ opacity: engineOpacity, y: engineY }} className="absolute text-center max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Neural Patterns
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
              Detecting complex financial crimes <br /> invisible to conventional systems.
            </p>
          </motion.div>

          <motion.div style={{ opacity: decisionOpacity, y: decisionY }} className="absolute text-center max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Total Enforcement
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
              Automated blocks on high-risk signatures <br /> before the damage is done.
            </p>
          </motion.div>

          <motion.div style={{ opacity: ctaOpacity, scale: ctaScale }} className="absolute flex flex-col items-center pointer-events-auto">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter">
              BEYOND FRAUD.
            </h2>
            <button 
              onClick={() => window.location.href = "/signup"}
              className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 text-lg uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Protection
            </button>
          </motion.div>

        </div>

        {/* Premium Scroll Indicator */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 3 }}
           className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="h-16 w-[2px] bg-white/10 relative overflow-hidden">
            <motion.div 
               animate={{ y: [0, 64] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent"
            />
          </div>
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/40 font-semibold">Scroll</span>
        </motion.div>
      </div>
    </div>
  );
};
