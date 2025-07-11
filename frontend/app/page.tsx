"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import PropertySearch from "@/components/property-search"
import PropertyCard from "@/components/property-card"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth-modal"

import MapSection from "@/components/map-section"
import DeveloperSpotlight from "@/components/developer-spotlight"
import { StickyMobileSearch, MobileBottomNav } from "@/components/mobile-enhancements"
import { FilterChips, SocialProofNotifications, RecentlyViewed } from "@/components/interactive-features"
import { apiClient, convertBackendProject, type ProjectType } from "@/lib/api"

// Sample property data (fallback)
const sampleProperties = [
  {
    id: "1",
    title: "Luxury Residential Complex Marina Bay",
    developer: "Premium Developments Ltd",
    location: "Lozenets",
    city: "Sofia",
    projectType: "Housing Complex" as const,
    status: "Under Construction" as const,
    completionDate: "Q2 2025",
    amenities: ["Gym", "Parking", "WiFi"],
    imageUrl: "/placeholder.svg?height=240&width=400",
    price: "от €85,000",
    pricePerSqm: "€1,200",
    energyRating: "A",
    act14Status: false,
  },
  {
    id: "2",
    title: "Modern Apartment Building Central Park",
    developer: "Urban Living Group",
    location: "Center",
    city: "Plovdiv",
    projectType: "Apartment Building" as const,
    status: "Planning" as const,
    completionDate: "Q4 2025",
    amenities: ["Pool", "Parking", "WiFi"],
    imageUrl: "/placeholder.svg?height=240&width=400",
    price: "от €65,000",
    pricePerSqm: "€950",
    energyRating: "B+",
    act14Status: false,
  },
  {
    id: "3",
    title: "Green Valley Residential Estate",
    developer: "EcoHomes Bulgaria",
    location: "Vitosha",
    city: "Sofia",
    projectType: "Housing Complex" as const,
    status: "Completed" as const,
    completionDate: "Q1 2024",
    amenities: ["Gym", "Pool", "Parking"],
    imageUrl: "/placeholder.svg?height=240&width=400",
    price: "от €95,000",
    pricePerSqm: "€1,350",
    energyRating: "A+",
    act14Status: true,
  },
]

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login")
  const [authModalUserType, setAuthModalUserType] = useState<"buyer" | "developer">("buyer")
  
  // State for real project data
  const [projects, setProjects] = useState<any[]>(sampleProperties)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects from API
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        const response = await apiClient.getProjects({ per_page: 6 })
        const convertedProjects = response.projects.map(convertBackendProject)
        setProjects(convertedProjects)
        setError(null)
      } catch (err) {
        console.error('Failed to load projects:', err)
        setError('Failed to load projects. Using sample data.')
        // Keep using sample data as fallback
        setProjects(sampleProperties)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleAuthModalOpen = (mode: "login" | "register", userType: "buyer" | "developer") => {
    setAuthModalMode(mode)
    setAuthModalUserType(userType)
    setIsAuthModalOpen(true)
  }

  const handlePropertySave = (id: string) => {
    console.log("Property saved:", id)
    // Open auth modal for buyers to login/register
    handleAuthModalOpen("login", "buyer")
  }

  const handlePropertyView = (id: string) => {
    console.log("View property details:", id)
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        <Header 
          theme={theme} 
          onThemeToggle={handleThemeToggle} 
          onAuthModalOpen={handleAuthModalOpen}
        />

        <main>
          <HeroSection />

          <MapSection />

          <section className="py-12 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <PropertySearch />
              <FilterChips />
            </div>
          </section>

          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Featured Projects</h2>
                <Button variant="outline" onClick={() => handleAuthModalOpen("login", "buyer")}>
                  Sign In to Save Properties
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                      <div className="bg-gray-300 h-4 rounded mb-2"></div>
                      <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      onSave={handlePropertySave}
                      onViewDetails={handlePropertyView}
                      onContactDeveloper={(id) => console.log("Contact developer for:", id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <DeveloperSpotlight />

          <RecentlyViewed />
        </main>

        <StickyMobileSearch />
        <MobileBottomNav />
        <SocialProofNotifications />
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode={authModalMode}
          defaultUserType={authModalUserType}
        />
      </div>
    </div>
  )
}
