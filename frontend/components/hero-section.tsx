"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export default function HeroSection() {
  const [searchLocation, setSearchLocation] = useState("")

  const handleSearch = () => {
    console.log("Searching for:", searchLocation)
    // Handle search logic
  }

  return (
    <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Discover New Construction Projects in <span className="text-primary">Bulgaria</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect directly with verified developers. No brokers, no fees.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by city, developer, or project name..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10 border-0 bg-transparent text-lg h-12 focus-visible:ring-0"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12 px-8 rounded-xl">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="h-12 px-8 text-lg rounded-xl">
              Explore New Developments
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-xl border-2">
              List Your Project
            </Button>
          </div>

          {/* Stats */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-200 text-sm font-medium">
              ✓ Over 500 verified projects
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">150+</div>
              <div className="text-gray-600 dark:text-gray-300">Verified Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Happy Buyers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
