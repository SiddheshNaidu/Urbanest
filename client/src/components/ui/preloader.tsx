"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const words = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "হ্যালো"]

const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 },
  }
}

const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 },
  },
}

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  const [isExiting, setIsExiting] = useState(false)
  const [showSentence, setShowSentence] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    if (index === words.length - 1) {
      return
    }

    const timeout = setTimeout(
      () => {
        setIndex(index + 1)
      },
      index === 0 ? 1000 : 150,
    )
    
    return () => clearTimeout(timeout)
  }, [index])

  useEffect(() => {
    const totalDuration = 1000 + (words.length - 1) * 150;
    const intervalTime = 20;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const newProgress = 100 * (1 - Math.pow(1 - currentStep / steps, 3));
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setProgress(100);
        
        setTimeout(() => {
          setShowSentence(true);
          
          setTimeout(() => {
             setIsExiting(true);
             setTimeout(() => {
               onComplete?.();
             }, 1000);
          }, 3000);
        }, 300);
      }
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, [onComplete]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
    },
  }

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-app-dark z-[99999]"
    >
      {dimension.width > 0 && (
        <>
          <AnimatePresence mode="wait">
            {!showSentence ? (
              <motion.p
                key="words"
                variants={opacity}
                initial="initial"
                animate="enter"
                exit="exit"
                className="flex items-center text-white text-4xl md:text-5xl lg:text-6xl absolute top-1/2 -translate-y-1/2 z-10 font-heading font-medium"
              >
                <span className="block w-2.5 h-2.5 bg-gold rounded-full mr-4"></span>
                {words[index]}
              </motion.p>
            ) : (
              <motion.div
                key="sentence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-10 flex items-center justify-center px-6 text-center w-full"
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl text-white font-heading font-medium tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-2xl">
                  Experience harmony in every space.<br/>
                  <span className="text-gold">Where community meets effortless living.</span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!showSentence && (
              <motion.div 
                exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-16 sm:bottom-24 w-full px-8 md:px-0 md:w-[320px] flex flex-col z-10"
              >
                <div className="w-full flex justify-between items-end mb-3">
                  <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                    Loading
                  </span>
                  <span className="font-heading tracking-widest text-[10px] text-gold/90 font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-gold/40 via-gold to-amber rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                    style={{ width: `${progress}%` }}
                    layout
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <svg className="absolute top-0 w-full h-[calc(100%+300px)] pointer-events-none z-0">
            <motion.path variants={curve} initial="initial" animate={isExiting ? "exit" : "initial"} fill="#0B0B0B" />
          </svg>
        </>
      )}
    </motion.div>
  );
}
