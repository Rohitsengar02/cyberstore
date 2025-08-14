
"use client"

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import CartSidebar from "./cart-sidebar";
import { AuthProvider } from "@/context/auth-context";
import AuthDialog from "./auth-dialog";
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Preloader from "./preloader";
import Lenis from '@studio-freight/lenis'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 4500); 

    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf);

    return () => {
      clearTimeout(timer)
      lenis.destroy()
    };
  }, []);


  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
           <AnimatePresence mode="wait">
            {isLoading && <Preloader />}
          </AnimatePresence>
          <div className={!isLoading ? 'visible' : 'invisible'}>
            {children}
            <Toaster />
            <CartSidebar />
            <AuthDialog />
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
