"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Building, CheckCircle } from "lucide-react"
import Image from "next/image"

interface Developer {
  id: string
  name: string
  logo: string
  activeProjects: number
  completedProjects: number
  rating: number
  verified: boolean
  specialties: string[]
  location: string
}

const featuredDevelopers: Developer[] = [
  {
    id: "1",
    name: "Premium Developments Ltd",
    logo: "/placeholder.svg?height=60&width=60",
    activeProjects: 8,
    completedProjects: 25,
    rating: 4.8,
    verified: true,
    specialties: ["Luxury Apartments", "Mixed-Use"],
    location: "Sofia",
  },
  {
    id: "2",
    name: "Urban Living Group",
    logo: "/placeholder.svg?height=60&width=60",
    activeProjects: 12,
    completedProjects: 18,
    rating: 4.6,
    verified: true,
    specialties: ["Residential", "Commercial"],
    location: "Plovdiv",
  },
  {
    id: "3",
    name: "EcoHomes Bulgaria",
    logo: "/placeholder.svg?height=60&width=60",
    activeProjects: 6,
    completedProjects: 15,
    rating: 4.9,
    verified: true,
    specialties: ["Eco-Friendly", "Smart Homes"],
    location: "Varna",
  },
  {
    id: "4",
    name: "Coastal Properties",
    logo: "/placeholder.svg?height=60&width=60",
    activeProjects: 4,
    completedProjects: 22,
    rating: 4.7,
    verified: true,
    specialties: ["Seaside", "Vacation Homes"],
    location: "Burgas",
  },
  {
    id: "5",
    name: "Mountain View Developments",
    logo: "/placeholder.svg?height=60&width=60",
    activeProjects: 3,
    completedProjects: 12,
    rating: 4.5,
    verified: true,
    specialties: ["Mountain Resorts", "Chalets"],
    location: "Bansko",
  },
]

export default function DeveloperSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= featuredDevelopers.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, featuredDevelopers.length - itemsPerView) : prev - 1))
  }

  const visibleDevelopers = featuredDevelopers.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Developers</h2>
            <p className="text-lg text-muted-foreground">Trusted partners building Bulgaria's future</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevSlide} className="h-10 w-10 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextSlide} className="h-10 w-10 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
          {visibleDevelopers.map((developer) => (
            <Card key={developer.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={developer.logo || "/placeholder.svg"}
                        alt={developer.name}
                        width={60}
                        height={60}
                        className="rounded-lg border"
                      />
                      {developer.verified && (
                        <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{developer.name}</h3>
                      <p className="text-sm text-muted-foreground">{developer.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Projects</span>
                    <span className="font-semibold">{developer.activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold">{developer.completedProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{developer.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-muted-foreground">Specialties</div>
                  <div className="flex flex-wrap gap-1">
                    {developer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4 mb-8">
          {featuredDevelopers.slice(0, 3).map((developer) => (
            <Card key={developer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Image
                      src={developer.logo || "/placeholder.svg"}
                      alt={developer.name}
                      width={50}
                      height={50}
                      className="rounded-lg border"
                    />
                    {developer.verified && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{developer.name}</h3>
                    <p className="text-sm text-muted-foreground">{developer.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{developer.rating}</span>
                      <span className="text-sm text-muted-foreground">• {developer.activeProjects} active</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  View Projects
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="h-12 px-8">
            View All Developers
          </Button>
        </div>
      </div>
    </section>
  )
}
