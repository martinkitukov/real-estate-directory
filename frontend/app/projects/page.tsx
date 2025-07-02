"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  Grid3X3,
  List,
  Map,
  MapPin,
  Calendar,
  Building,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import { formatCurrency } from "@/lib/utils"

const allProjects = [
  {
    id: "1",
    title: "Luxury Residential Complex Marina Bay",
    developer: "Premium Developments Ltd",
    location: "Lozenets",
    city: "Sofia",
    projectType: "Housing Complex",
    status: "Under Construction",
    completionDate: "Q2 2025",
    price: "от €85,000",
    pricePerSqm: "€1,200",
    energyRating: "A",
    act14Status: false,
    amenities: ["Gym", "Parking", "WiFi"],
    image: "/placeholder.svg?height=240&width=400",
    featured: true,
  },
  {
    id: "2",
    title: "Modern Apartment Building Central Park",
    developer: "Urban Living Group",
    location: "Center",
    city: "Plovdiv",
    projectType: "Apartment Building",
    status: "Planning",
    completionDate: "Q4 2025",
    price: "от €65,000",
    pricePerSqm: "€950",
    energyRating: "B+",
    act14Status: false,
    amenities: ["Pool", "Parking", "WiFi"],
    image: "/placeholder.svg?height=240&width=400",
    featured: false,
  },
  {
    id: "3",
    title: "Green Valley Residential Estate",
    developer: "EcoHomes Bulgaria",
    location: "Vitosha",
    city: "Sofia",
    projectType: "Housing Complex",
    status: "Completed",
    completionDate: "Q1 2024",
    price: "от €95,000",
    pricePerSqm: "€1,350",
    energyRating: "A+",
    act14Status: true,
    amenities: ["Gym", "Pool", "Parking"],
    image: "/placeholder.svg?height=240&width=400",
    featured: true,
  },
  {
    id: "4",
    title: "Seaside Towers Varna",
    developer: "Coastal Properties",
    location: "Sea Garden",
    city: "Varna",
    projectType: "Apartment Building",
    status: "Under Construction",
    completionDate: "Q3 2025",
    price: "от €120,000",
    pricePerSqm: "€1,500",
    energyRating: "A",
    act14Status: false,
    amenities: ["Pool", "Spa", "Parking"],
    image: "/placeholder.svg?height=240&width=400",
    featured: false,
  },
  {
    id: "5",
    title: "Mountain View Chalets",
    developer: "Alpine Developments",
    location: "Bansko Center",
    city: "Bansko",
    projectType: "Housing Complex",
    status: "Planning",
    completionDate: "Q1 2026",
    price: "от €75,000",
    pricePerSqm: "€1,100",
    energyRating: "B+",
    act14Status: false,
    amenities: ["Ski Storage", "Parking", "WiFi"],
    image: "/placeholder.svg?height=240&width=400",
    featured: false,
  },
  {
    id: "6",
    title: "Business Park Residence",
    developer: "Commercial Plus",
    location: "Business Park",
    city: "Sofia",
    projectType: "Apartment Building",
    status: "Completed",
    completionDate: "Q4 2023",
    price: "от €110,000",
    pricePerSqm: "€1,400",
    energyRating: "A+",
    act14Status: true,
    amenities: ["Gym", "Coworking", "Parking"],
    image: "/placeholder.svg?height=240&width=400",
    featured: false,
  },
]

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [savedProjects, setSavedProjects] = useState<string[]>([])

  // Filters
  const [filters, setFilters] = useState({
    city: "",
    projectType: "",
    status: "",
    priceRange: [50000, 200000] as [number, number],
    energyRating: "",
    act14Only: false,
  })

  const itemsPerPage = 9

  // Filter and sort projects
  let filteredProjects = allProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = !filters.city || project.city === filters.city
    const matchesType = !filters.projectType || project.projectType === filters.projectType
    const matchesStatus = !filters.status || project.status === filters.status
    const matchesAct14 = !filters.act14Only || project.act14Status

    // Price filtering (simplified - would need actual price data)
    const priceValue = Number.parseInt(project.price.replace(/[^\d]/g, ""))
    const matchesPrice = priceValue >= filters.priceRange[0] && priceValue <= filters.priceRange[1]

    return matchesSearch && matchesCity && matchesType && matchesStatus && matchesAct14 && matchesPrice
  })

  // Sort projects
  if (sortBy === "featured") {
    filteredProjects = filteredProjects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  } else if (sortBy === "price-low") {
    filteredProjects = filteredProjects.sort(
      (a, b) => Number.parseInt(a.price.replace(/[^\d]/g, "")) - Number.parseInt(b.price.replace(/[^\d]/g, "")),
    )
  } else if (sortBy === "price-high") {
    filteredProjects = filteredProjects.sort(
      (a, b) => Number.parseInt(b.price.replace(/[^\d]/g, "")) - Number.parseInt(a.price.replace(/[^\d]/g, "")),
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  const toggleSaveProject = (projectId: string) => {
    setSavedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const statusColors = {
    Planning: "bg-yellow-500",
    "Under Construction": "bg-blue-500",
    Completed: "bg-green-500",
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Projects</h1>
          <p className="text-muted-foreground">
            Discover {allProjects.length} new construction projects across Bulgaria
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects, developers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Sofia">Sofia</SelectItem>
                  <SelectItem value="Plovdiv">Plovdiv</SelectItem>
                  <SelectItem value="Varna">Varna</SelectItem>
                  <SelectItem value="Burgas">Burgas</SelectItem>
                  <SelectItem value="Bansko">Bansko</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.projectType}
                onValueChange={(value) => setFilters({ ...filters, projectType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Apartment Building">Apartment Building</SelectItem>
                  <SelectItem value="Housing Complex">Housing Complex</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price Range (EUR)</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                </span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                max={300000}
                min={30000}
                step={5000}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
            </p>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive Project Map</p>
                  <p className="text-sm text-muted-foreground">All {filteredProjects.length} projects displayed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid/List */}
        {viewMode !== "map" && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {paginatedProjects.map((project) => (
              <Card
                key={project.id}
                className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${viewMode === "grid" ? "hover:-translate-y-1" : ""}`}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="relative">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        width={400}
                        height={240}
                        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        className={`absolute top-3 left-3 ${statusColors[project.status as keyof typeof statusColors]} text-white border-0`}
                      >
                        {project.status}
                      </Badge>
                      {project.featured && (
                        <Badge className="absolute top-3 right-12 bg-orange-500 text-white border-0">Featured</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white ${
                          savedProjects.includes(project.id) ? "text-red-500" : "text-gray-600"
                        }`}
                        onClick={() => toggleSaveProject(project.id)}
                      >
                        <Heart className={`h-4 w-4 ${savedProjects.includes(project.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">by {project.developer}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {project.location}, {project.city}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{project.price}</div>
                          <div className="text-xs text-muted-foreground">{project.pricePerSqm}/m²</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{project.projectType}</Badge>
                          {project.act14Status && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Act 14</Badge>
                          )}
                          <Badge variant="secondary">Energy: {project.energyRating}</Badge>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{project.completionDate}</span>
                        </div>
                      </div>
                      <Link href={`/property/${project.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-48 h-32 flex-shrink-0">
                        <Image
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          className="object-cover rounded"
                        />
                        <Badge
                          className={`absolute top-2 left-2 ${statusColors[project.status as keyof typeof statusColors]} text-white border-0 text-xs`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">by {project.developer}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{project.price}</div>
                            <div className="text-sm text-muted-foreground">{project.pricePerSqm}/m²</div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {project.location}, {project.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{project.projectType}</Badge>
                          {project.act14Status && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Act 14</Badge>
                          )}
                          <Badge variant="secondary">Energy: {project.energyRating}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground ml-auto">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{project.completionDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Link href={`/property/${project.id}`} className="flex-1">
                            <Button className="w-full">View Details</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaveProject(project.id)}
                            className={savedProjects.includes(project.id) ? "text-red-500" : ""}
                          >
                            <Heart className={`h-4 w-4 ${savedProjects.includes(project.id) ? "fill-current" : ""}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {viewMode !== "map" && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more projects.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setFilters({
                    city: "",
                    projectType: "",
                    status: "",
                    priceRange: [50000, 200000],
                    energyRating: "",
                    act14Only: false,
                  })
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 