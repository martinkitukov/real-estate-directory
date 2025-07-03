"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Globe, Sun, Moon, LogOut, Settings, Heart } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  theme?: "light" | "dark"
  onThemeToggle?: () => void
  onAuthModalOpen?: (mode: "login" | "register", userType: "buyer" | "developer") => void
}

export default function Header({ theme = "light", onThemeToggle, onAuthModalOpen }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState("EN")

  const { user, isAuthenticated, logout } = useAuthStore()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "New Projects", href: "/projects" },
    { name: "Developers", href: "/developers" },
    { name: "About", href: "/about" },
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const handleAuthAction = (mode: "login" | "register", userType: "buyer" | "developer") => {
    if (onAuthModalOpen) {
      onAuthModalOpen(mode, userType)
    }
    setIsOpen(false)
  }

  // Render authenticated user dropdown
  const renderAuthenticatedDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <User className="h-4 w-4 mr-2" />
          {user?.first_name || user?.company_name || "Account"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-semibold">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.company_name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          {user?.user_type && (
            <div className="text-xs text-blue-600 font-medium capitalize">{user.user_type}</div>
          )}
        </div>
        <DropdownMenuSeparator />
        {user?.user_type === 'developer' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/developer/dashboard">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {user?.user_type === 'buyer' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/saved-properties">
                <Heart className="h-4 w-4 mr-2" />
                Saved Properties
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Render non-authenticated dropdown
  const renderGuestDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <User className="h-4 w-4 mr-2" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">For Buyers</div>
        <DropdownMenuItem onClick={() => handleAuthAction('login', 'buyer')}>
          Login
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAuthAction('register', 'buyer')}>
          Register
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold">For Developers</div>
        <DropdownMenuItem onClick={() => handleAuthAction('login', 'developer')}>
          Developer Login
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/developer-registration">Developer Registration</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-foreground">NovaDom</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("EN")}>🇺🇸 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("БГ")}>🇧🇬 Български</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={onThemeToggle} className="h-8 w-8 p-0">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? renderAuthenticatedDropdown() : renderGuestDropdown()}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm">
                        <div className="font-semibold">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.company_name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                        {user?.user_type && (
                          <div className="text-xs text-blue-600 font-medium capitalize">{user.user_type}</div>
                        )}
                      </div>
                      
                      {user?.user_type === 'developer' && (
                        <Button variant="outline" className="w-full justify-start" asChild onClick={() => setIsOpen(false)}>
                          <Link href="/developer/dashboard">
                            <Settings className="h-4 w-4 mr-2" />
                            Dashboard
                          </Link>
                        </Button>
                      )}
                      
                      {user?.user_type === 'buyer' && (
                        <Button variant="outline" className="w-full justify-start" asChild onClick={() => setIsOpen(false)}>
                          <Link href="/saved-properties">
                            <Heart className="h-4 w-4 mr-2" />
                            Saved Properties
                          </Link>
                        </Button>
                      )}
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-red-600" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-muted-foreground">For Buyers</div>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleAuthAction('login', 'buyer')}>
                        Login
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleAuthAction('register', 'buyer')}>
                        Register
                      </Button>
                      
                      <div className="text-sm font-semibold text-muted-foreground mt-4">For Developers</div>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleAuthAction('login', 'developer')}>
                        Developer Login
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link href="/developer-registration">Developer Registration</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
