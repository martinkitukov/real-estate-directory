"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, List, Map } from "lucide-react"

interface MapMarker {
  id: string
  title: string
  city: string
  price: string
  status: "Planning" | "Under Construction" | "Completed"
  lat: number
  lng: number
}

const sampleMarkers: MapMarker[] = [
  {
    id: "1",
    title: "Marina Bay Complex",
    city: "Sofia",
    price: "€85,000",
    status: "Under Construction",
    lat: 42.6977,
    lng: 23.3219,
  },
  {
    id: "2",
    title: "Central Park Residence",
    city: "Plovdiv",
    price: "€65,000",
    status: "Planning",
    lat: 42.1354,
    lng: 24.7453,
  },
  {
    id: "3",
    title: "Green Valley Estate",
    city: "Varna",
    price: "€95,000",
    status: "Completed",
    lat: 43.2141,
    lng: 27.9147,
  },
]

export default function MapSection() {
  const [viewMode, setViewMode] = useState<"list" | "map">("map")

  const statusColors = {
    Planning: "bg-yellow-500",
    "Under Construction": "bg-blue-500",
    Completed: "bg-green-500",
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Projects on Map</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover new construction projects across Bulgaria's major cities
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border bg-background p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-md"
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="rounded-md"
            >
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {/* Map Container */}
        {viewMode === "map" && (
          <Card className="overflow-hidden mb-8">
            <CardContent className="p-0">
              <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700">
                {/* Map Placeholder with Markers */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">Bulgaria Property Locations</p>
                  </div>
                </div>

                {/* Sample Map Markers */}
                <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group cursor-pointer">
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Sofia - €85,000
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group cursor-pointer">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Plovdiv - €65,000
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group cursor-pointer">
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Varna - €95,000
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                  <div className="text-sm font-medium mb-2">Project Status</div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      Planning
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Under Construction
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sampleMarkers.map((marker) => (
              <Card key={marker.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{marker.title}</h3>
                    <div className={`w-3 h-3 rounded-full ${statusColors[marker.status]}`}></div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {marker.city}
                  </div>
                  <div className="text-lg font-bold text-primary">{marker.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button size="lg" className="h-12 px-8">
            View All on Map
          </Button>
        </div>
      </div>
    </section>
  )
}
