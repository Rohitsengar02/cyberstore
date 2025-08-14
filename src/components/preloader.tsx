
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

const preloaderVariants = {
    initial: {
        y: 0,
    },
    exit: {
        y: "-100vh",
        transition: { duration: 1.2, delay: 0.3, ease: [0.83, 0, 0.17, 1] }
    }
};

const contentContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        }
    }
};

const logoVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 1, ease: "easeOut" }
    }
};

const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const highlightVariants = {
    enter: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.5, ease: "easeIn" }
    }
}

const highlights = [
    "Best Quality Products",
    "Fast & Free Delivery",
    "Secure Payment Options",
];

const Preloader = () => {
  const storeName = "NoirCart";
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setHighlightIndex(prev => (prev + 1));
    }, 1000); // Duration per item: 0.7s animation + 0.3s delay = 1s

    return () => clearInterval(interval);
  }, []);


  return (
    <motion.div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        variants={preloaderVariants}
        initial="initial"
        exit="exit"
    >
        <motion.div
            variants={contentContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4"
        >
            <motion.div variants={logoVariants}>
                <ShoppingBag className="h-20 w-20 text-primary" strokeWidth={1.5}/>
            </motion.div>
            <motion.h1 
                variants={textVariants} 
                className="text-4xl font-bold text-foreground"
            >
                {storeName}
            </motion.h1>

             <div className="h-8 mt-2 overflow-hidden">
                <AnimatePresence mode="wait">
                    {highlightIndex < highlights.length && (
                         <motion.p
                            key={highlightIndex}
                            className="text-lg text-muted-foreground"
                            variants={highlightVariants}
                            initial="exit"
                            animate="enter"
                            exit="exit"
                         >
                            {highlights[highlightIndex]}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
            
        </motion.div>
    </motion.div>
  );
};

export default Preloader;
