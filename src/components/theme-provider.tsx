"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    const storedTheme = localStorage.getItem("noir-cart-theme") as Theme | null
    const initialTheme = storedTheme || 'light';
    setThemeState(initialTheme)
    
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(initialTheme)
  }, [])

  const setTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(newTheme)
    localStorage.setItem("noir-cart-theme", newTheme)
    setThemeState(newTheme)
  }

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
