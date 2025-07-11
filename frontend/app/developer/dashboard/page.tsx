"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Building,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Bell,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Users,
  Crown,
} from "lucide-react"
import Link from "next/link"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/developer/dashboard", active: true },
  { icon: Building, label: "My Projects", href: "/developer/projects" },
  { icon: BarChart3, label: "Analytics", href: "/developer/analytics" },
  { icon: MessageSquare, label: "Inquiries", href: "/developer/inquiries" },
  { icon: Users, label: "Leads", href: "/developer/leads" },
  { icon: Settings, label: "Settings", href: "/developer/settings" },
]

export default function DeveloperDashboard() {
  const { isAuthenticated, token } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch dashboard data if authenticated
    if (!isAuthenticated || !token) {
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all dashboard data in parallel
        const [projectsRes, statsRes, subscriptionRes] = await Promise.all([
          apiClient.getDeveloperProjects({ page: 1, per_page: 10 }),
          apiClient.getDeveloperStats(),
          apiClient.getDeveloperSubscription()
        ])

        if (projectsRes.data) {
          // Convert backend projects to dashboard format
          const convertedProjects = projectsRes.data.projects.map((project: any) => ({
            id: project.id.toString(),
            name: project.title,
            location: `${project.city}${project.neighborhood ? ', ' + project.neighborhood : ''}`,
            status: project.status === 'under_construction' ? 'Under Construction' : 
                   project.status === 'planning' ? 'Planning' : 'Completed',
            units: 0, // Would need to be added to backend
            views: 100, // Mock for now - would come from analytics
            inquiries: 5, // Mock for now - would come from inquiries table
            leads: 2, // Mock for now - would come from leads table
            completion: project.status === 'completed' ? 100 : 
                       project.status === 'under_construction' ? 65 : 15,
            lastUpdated: new Date(project.updated_at).toLocaleDateString()
          }))
          setProjects(convertedProjects)
        }

        if (statsRes.data) {
          setStats(statsRes.data)
          setNotifications(statsRes.data.recent_activity || [])
          setUnreadNotifications(statsRes.data.recent_activity?.filter((n: any) => n.unread).length || 0)
        }

        if (subscriptionRes.data) {
          setSubscription(subscriptionRes.data)
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Note: Global error handler in API client will handle 401s automatically
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, token])

  const statusColors = {
    Planning: "bg-yellow-500",
    "Under Construction": "bg-blue-500",
    Completed: "bg-green-500",
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AuthGuard requireAuth={true} requiredUserType="developer">
      {loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r min-h-screen">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">N</span>
                  </div>
                  <span className="text-xl font-bold">NovaDom</span>
                </div>

                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        item.active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <header className="bg-white dark:bg-gray-800 border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, Premium Developments Ltd</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative">
                          <Bell className="h-5 w-5" />
                          {unreadNotifications > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{unreadNotifications}</Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="p-3 border-b">
                          <h3 className="font-semibold">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b last:border-b-0 ${
                                notification.unread ? "bg-blue-50 dark:bg-blue-950" : ""
                              }`}
                            >
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Project
                    </Button>
                  </div>
                </div>
              </header>

              {/* Dashboard Content */}
              <main className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Projects</p>
                          <p className="text-2xl font-bold">{stats?.total_projects || 0}</p>
                        </div>
                        <Building className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">{stats?.projects_growth || "+0 this month"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold">{stats?.total_views || 0}</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">{stats?.views_growth || "+0% this week"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Inquiries</p>
                          <p className="text-2xl font-bold">{stats?.total_inquiries || 0}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">{stats?.inquiries_growth || "+0 this week"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Leads</p>
                          <p className="text-2xl font-bold">{stats?.active_leads || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">{stats?.leads_growth || "+0 this week"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Projects Table */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>My Projects</CardTitle>
                          <Input
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Project</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Views</TableHead>
                              <TableHead>Inquiries</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProjects.map((project) => (
                              <TableRow key={project.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{project.name}</div>
                                    <div className="text-sm text-muted-foreground">{project.location}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${statusColors[project.status as keyof typeof statusColors]} text-white`}
                                  >
                                    {project.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{project.views}</TableCell>
                                <TableCell>{project.inquiries}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${project.completion}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm">{project.completion}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar Cards */}
                  <div className="space-y-6">
                    {/* Subscription Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Subscription
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Plan</span>
                            <Badge className="bg-yellow-100 text-yellow-800">{subscription?.plan || "Basic"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Projects</span>
                            <span className="font-medium">{subscription?.projects_used || 0} / {subscription?.projects_limit || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Renewal</span>
                            <span className="font-medium">{subscription?.renewal_date || "N/A"}</span>
                          </div>
                          <Button className="w-full" variant="outline">
                            Upgrade Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm">New inquiry for Marina Bay Complex</p>
                              <p className="text-xs text-muted-foreground">2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm">Project photos updated</p>
                              <p className="text-xs text-muted-foreground">1 day ago</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm">Lead converted to sale</p>
                              <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full justify-start" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Project
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Inquiries
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
} 