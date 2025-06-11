"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Search, Eye, TrendingUp } from "lucide-react"

interface SearchSuggestion {
  id: string
  text: string
  type: "city" | "developer" | "project"
}

const recentSearches = ["Sofia apartments", "Plovdiv new construction", "Premium Developments"]
const suggestions: SearchSuggestion[] = [
  { id: "1", text: "Sofia", type: "city" },
  { id: "2", text: "Plovdiv", type: "city" },
  { id: "3", text: "Varna", type: "city" },
  { id: "4", text: "Premium Developments", type: "developer" },
  { id: "5", text: "Urban Living Group", type: "developer" },
]

export function SearchAutocomplete() {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter((suggestion) => suggestion.text.toLowerCase().includes(query.toLowerCase()))
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [query])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by city, developer, or project name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length === 0 && setShowSuggestions(true)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {query.length === 0 && (
              <div className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => {
                        setQuery(search)
                        setShowSuggestions(false)
                      }}
                    >
                      <Search className="h-4 w-4 text-muted-foreground mr-3" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredSuggestions.length > 0 && (
              <div className="p-4">
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => {
                        setQuery(suggestion.text)
                        setShowSuggestions(false)
                      }}
                    >
                      <Search className="h-4 w-4 text-muted-foreground mr-3" />
                      <span>{suggestion.text}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestion.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function FilterChips() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Sofia", "Under Construction"])

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-3 py-1">
          {filter}
          <button onClick={() => removeFilter(filter)} className="ml-1 hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])} className="h-6 px-2 text-xs">
        Clear all
      </Button>
    </div>
  )
}

export function SocialProofNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "5 people viewed Marina Bay Complex today", visible: true },
    { id: 2, text: "New project added in Sofia", visible: false },
    { id: 3, text: "3 people saved Green Valley Estate", visible: false },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const updated = prev.map((notif) => ({ ...notif, visible: false }))
        const nextIndex = Math.floor(Math.random() * updated.length)
        updated[nextIndex].visible = true
        return updated
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const visibleNotification = notifications.find((n) => n.visible)

  if (!visibleNotification) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border animate-in slide-in-from-bottom-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm">{visibleNotification.text}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function RecentlyViewed() {
  const recentProjects = [
    { id: "1", title: "Marina Bay Complex", image: "/placeholder.svg?height=60&width=80", price: "€85,000" },
    { id: "2", title: "Central Park Residence", image: "/placeholder.svg?height=60&width=80", price: "€65,000" },
    { id: "3", title: "Green Valley Estate", image: "/placeholder.svg?height=60&width=80", price: "€95,000" },
  ]

  return (
    <section className="py-8 border-t">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold mb-4">Recently Viewed</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentProjects.map((project) => (
            <Card key={project.id} className="flex-shrink-0 w-64 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-20 h-15 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{project.title}</h4>
                    <p className="text-primary font-semibold mt-1">{project.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
