"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MapPin, Calendar, Building, Wifi, Car, Dumbbell } from "lucide-react"
import Image from "next/image"

interface PropertyCardProps {
  id: string
  title: string
  developer: string
  location: string
  city: string
  projectType: "Apartment Building" | "Housing Complex"
  status: "Planning" | "Under Construction" | "Completed"
  completionDate: string
  amenities: string[]
  imageUrl: string
  price?: string
  pricePerSqm?: string
  energyRating?: string
  act14Status?: boolean
  isSaved?: boolean
  onSave?: (id: string) => void
  onViewDetails?: (id: string) => void
  onContactDeveloper?: (id: string) => void
}

const statusColors = {
  Planning: "bg-yellow-500",
  "Under Construction": "bg-blue-500",
  Completed: "bg-green-500",
}

const amenityIcons = {
  WiFi: Wifi,
  Parking: Car,
  Gym: Dumbbell,
  Pool: Building,
}

export default function PropertyCard({
  id,
  title,
  developer,
  location,
  city,
  projectType,
  status,
  completionDate,
  amenities,
  imageUrl,
  price,
  pricePerSqm,
  energyRating,
  act14Status,
  isSaved = false,
  onSave,
  onViewDetails,
  onContactDeveloper,
}: PropertyCardProps) {
  const [saved, setSaved] = useState(isSaved)

  const handleSave = () => {
    setSaved(!saved)
    onSave?.(id)
  }

  const handleViewDetails = () => {
    onViewDetails?.(id)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          width={400}
          height={240}
          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className={`absolute top-3 left-3 ${statusColors[status]} text-white border-0`}>{status}</Badge>
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white ${
            saved ? "text-red-500" : "text-gray-600"
          }`}
          onClick={handleSave}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground">by {developer}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {location}, {city}
            </span>
          </div>
          {price && (
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{price}</div>
              {pricePerSqm && <div className="text-xs text-muted-foreground">{pricePerSqm}/m²</div>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{projectType}</Badge>
            {act14Status && <Badge className="bg-green-100 text-green-800 border-green-200">Act 14</Badge>}
            {energyRating && <Badge variant="secondary">Energy: {energyRating}</Badge>}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{completionDate}</span>
          </div>
        </div>

        {status === "Under Construction" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Construction Progress</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {amenities.slice(0, 3).map((amenity, index) => {
            const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Building
            return (
              <div key={index} className="flex items-center text-xs text-muted-foreground">
                <IconComponent className="h-3 w-3 mr-1" />
                <span>{amenity}</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={handleViewDetails}>
            Get Project Info
          </Button>
          <Button variant="outline" size="sm" onClick={() => onContactDeveloper?.(id)} className="px-3">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
