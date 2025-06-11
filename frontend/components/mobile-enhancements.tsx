"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Heart, Home, Map } from "lucide-react"

export function StickyMobileSearch() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-800 border-b shadow-sm p-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search projects..." className="pl-10 h-10" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 px-3">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Projects</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <p className="text-muted-foreground">Filter options would go here...</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            activeTab === "home" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            activeTab === "search" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            activeTab === "map" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            activeTab === "saved" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs">Saved</span>
        </button>
      </div>
    </div>
  )
}
