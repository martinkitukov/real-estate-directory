"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import GooeyNav from "./ui/gooey-nav"
import AuthModal from "./auth-modal"

interface HeaderProps {
  theme?: "light" | "dark"
  onThemeToggle?: () => void
}

export default function HeaderWithGooey({ theme = "light", onThemeToggle }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleAuthClick = () => {
    setShowAuthModal(true)
  }

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      // Check if we're in the browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return;
      }
      
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || ''
      const isMobileDevice = /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkIsMobile()
    
    // Only add event listener if we're in the browser
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIsMobile)
      return () => window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Developers", href: "/developer-registration" }
  ]

  const desktopNavItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Developers", href: "/developer-registration" }
  ]

  const mobileNavItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Developers", href: "/developer-registration" }
  ]

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-gradient-to-r from-blue-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ND</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NovaDom
            </span>
          </div>

          {/* Navigation with GooeyNav - Responsive */}
          <div className="flex items-center justify-center flex-1 px-4 md:px-8">
            {/* Desktop GooeyNav */}
            <div className="hidden md:flex justify-center">
              <GooeyNav 
                items={desktopNavItems}
                initialActiveIndex={0}
                animationTime={600}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
            {/* Mobile GooeyNav */}
            <div className="md:hidden flex justify-center w-full">
              <GooeyNav 
                items={mobileNavItems}
                initialActiveIndex={0}
                animationTime={600}
                particleCount={12}
                particleDistances={[60, 8]}
                particleR={80}
                timeVariance={250}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleAuthClick}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleAuthClick}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gradient-to-b from-blue-900 to-purple-900 border-l border-white/10">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    <span>{item.label}</span>
                  </a>
                ))}
                <div className="border-t border-white/10 pt-4 mt-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10 mb-2"
                    onClick={handleAuthClick}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    onClick={handleAuthClick}
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  )
} 