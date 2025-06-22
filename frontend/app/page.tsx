"use client"

import { useState } from "react"
import HeaderWithGooey from "@/components/header-with-gooey"
import HeroSection from "@/components/hero-section"
import PropertySearch from "@/components/property-search"
import PropertyCard from "@/components/property-card"
import { Button } from "@/components/ui/button"

import MapSection from "@/components/map-section"
import DeveloperSpotlight from "@/components/developer-spotlight"
import { StickyMobileSearch, MobileBottomNav } from "@/components/mobile-enhancements"
import { FilterChips, SocialProofNotifications, RecentlyViewed } from "@/components/interactive-features"

// Sample property data
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

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handlePropertySave = (id: string) => {
    console.log("Property saved:", id)
  }

  const handlePropertyView = (id: string) => {
    console.log("View property details:", id)
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        <HeaderWithGooey theme={theme} onThemeToggle={handleThemeToggle} />

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
                <Button variant="outline" onClick={() => setIsAuthModalOpen(true)}>
                  Sign In to Save Properties
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    onSave={handlePropertySave}
                    onViewDetails={handlePropertyView}
                    onContactDeveloper={(id) => console.log("Contact developer for:", id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <DeveloperSpotlight />

          <RecentlyViewed />
        </main>

        <StickyMobileSearch />
        <MobileBottomNav />
        <SocialProofNotifications />
      </div>
    </div>
  )
}
