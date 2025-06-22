"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"

interface SearchFilters {
  location: string
  projectType: string
  status: string
  city: string
  priceRange: [number, number]
}

export default function PropertySearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    projectType: "",
    status: "",
    city: "",
    priceRange: [50000, 500000],
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [resultsCount] = useState(127)

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      location: "",
      projectType: "",
      status: "",
      city: "",
      priceRange: [50000, 500000],
    })
  }

  const applyFilters = () => {
    console.log("Applying filters:", filters)
    // Handle filter application
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Properties
          </CardTitle>
          <div className="text-sm text-muted-foreground">{resultsCount} results found</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by location, developer, or project name..."
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select value={filters.projectType} onValueChange={(value) => handleFilterChange("projectType", value)}>
              <SelectTrigger id="projectType">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment Building</SelectItem>
                <SelectItem value="housing">Housing Complex</SelectItem>
                <SelectItem value="villa">Villa Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="construction">Under Construction</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
              <SelectTrigger id="city">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="sofia">Sofia</SelectItem>
                <SelectItem value="plovdiv">Plovdiv</SelectItem>
                <SelectItem value="varna">Varna</SelectItem>
                <SelectItem value="burgas">Burgas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  More Filters
                  {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Expandable Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4 pt-4 border-t">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Price Range (€)</Label>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                    max={1000000}
                    min={10000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>€{filters.priceRange[0].toLocaleString()}</span>
                    <span>€{filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button onClick={applyFilters} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
