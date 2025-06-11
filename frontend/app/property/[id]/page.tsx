"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Building,
  Car,
  Wifi,
  Dumbbell,
  Shield,
  Zap,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Eye,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"

// Sample property data
const propertyData = {
  id: "1",
  title: "Luxury Residential Complex Marina Bay",
  developer: {
    name: "Premium Developments Ltd",
    logo: "/placeholder.svg?height=60&width=60",
    rating: 4.8,
    projects: 25,
    verified: true,
    phone: "+359 2 123 4567",
    email: "info@premiumdev.bg",
  },
  location: "Lozenets, Sofia",
  projectType: "Housing Complex",
  status: "Under Construction",
  completionDate: "Q2 2025",
  price: "от €85,000",
  pricePerSqm: "€1,200",
  energyRating: "A",
  act14Status: false,
  description:
    "Marina Bay is a premium residential complex located in the heart of Sofia's prestigious Lozenets district. This modern development offers luxury apartments with stunning city views, premium amenities, and excellent connectivity to the city center.",
  images: [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
  ],
  specifications: {
    "Total Units": "120 apartments",
    "Building Height": "12 floors",
    "Apartment Sizes": "45-150 m²",
    "Parking Spaces": "150 underground",
    "Construction Start": "January 2024",
    "Expected Completion": "June 2025",
    "Building Permit": "Valid",
    "Energy Class": "A",
  },
  amenities: [
    { icon: Car, name: "Underground Parking", description: "Secure parking for residents" },
    { icon: Dumbbell, name: "Fitness Center", description: "Modern gym with equipment" },
    { icon: Wifi, name: "High-Speed Internet", description: "Fiber optic connectivity" },
    { icon: Shield, name: "24/7 Security", description: "Professional security service" },
    { icon: Building, name: "Concierge Service", description: "Reception and assistance" },
    { icon: Zap, name: "Smart Home Ready", description: "Pre-installed smart systems" },
  ],
  floorPlans: [
    { type: "1-bedroom", size: "45-55 m²", price: "€85,000-95,000" },
    { type: "2-bedroom", size: "70-85 m²", price: "€110,000-130,000" },
    { type: "3-bedroom", size: "100-120 m²", price: "€150,000-180,000" },
    { type: "Penthouse", size: "140-150 m²", price: "€220,000-250,000" },
  ],
}

const similarProperties = [
  {
    id: "2",
    title: "Central Park Residence",
    developer: "Urban Living Group",
    location: "Center, Plovdiv",
    price: "от €65,000",
    image: "/placeholder.svg?height=200&width=300",
    status: "Planning",
  },
  {
    id: "3",
    title: "Green Valley Estate",
    developer: "EcoHomes Bulgaria",
    location: "Vitosha, Sofia",
    price: "от €95,000",
    image: "/placeholder.svg?height=200&width=300",
    status: "Completed",
  },
  {
    id: "4",
    title: "Seaside Towers",
    developer: "Coastal Properties",
    location: "Sea Garden, Varna",
    price: "от €120,000",
    image: "/placeholder.svg?height=200&width=300",
    status: "Under Construction",
  },
]

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", contactForm)
    // Handle form submission
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground">{propertyData.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="relative h-96 md:h-[500px]">
                  <Image
                    src={propertyData.images[currentImageIndex] || "/placeholder.svg"}
                    alt={propertyData.title}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {propertyData.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 p-4">
                  {propertyData.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-20 cursor-pointer rounded overflow-hidden"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover hover:opacity-80 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{propertyData.title}</CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {propertyData.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {propertyData.completionDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSaved(!isSaved)}
                      className={isSaved ? "text-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-blue-500 text-white">{propertyData.status}</Badge>
                  <Badge variant="outline">{propertyData.projectType}</Badge>
                  <Badge className="bg-green-100 text-green-800">Energy: {propertyData.energyRating}</Badge>
                  <div className="text-2xl font-bold text-primary">{propertyData.price}</div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{propertyData.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="specifications" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="floor-plans">Floor Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(propertyData.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {propertyData.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <amenity.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{amenity.name}</h4>
                            <p className="text-sm text-muted-foreground">{amenity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="floor-plans" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Floor Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {propertyData.floorPlans.map((plan, index) => (
                        <Card key={index} className="border">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">{plan.type}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Size:</span>
                                <span className="font-medium">{plan.size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price Range:</span>
                                <span className="font-medium text-primary">{plan.price}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-lg font-medium">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">{propertyData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Developer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Developer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={propertyData.developer.logo || "/placeholder.svg"}
                    alt={propertyData.developer.name}
                    width={50}
                    height={50}
                    className="rounded-lg border"
                  />
                  <div>
                    <h3 className="font-semibold">{propertyData.developer.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{propertyData.developer.rating}</span>
                      <span className="text-muted-foreground">• {propertyData.developer.projects} projects</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{propertyData.developer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{propertyData.developer.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Developer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="I'm interested in this property..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views this week</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">127</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Inquiries</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last updated</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48">
                  <Image
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-3 left-3 bg-blue-500 text-white">{property.status}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {property.developer}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </div>
                    <div className="text-lg font-bold text-primary">{property.price}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Lightbox */}
        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="relative max-w-4xl max-h-[80vh]">
              <Image
                src={propertyData.images[currentImageIndex] || "/placeholder.svg"}
                alt={propertyData.title}
                width={800}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 