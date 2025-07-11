"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "register"
  defaultUserType?: "buyer" | "developer"
}

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: "buyer" | "developer"
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  defaultMode = "login", 
  defaultUserType = "buyer" 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultUserType)
  const [authMode, setAuthMode] = useState<"login" | "register">(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isLoginSuccess, setIsLoginSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { login, registerBuyer, isLoading, error, clearError, isAuthenticated, user } = useAuthStore()

  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>({
    mode: "onChange"
  })

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultUserType)
      setAuthMode(defaultMode)
      setShowPassword(false)
      setIsLoginSuccess(false)
      setIsRedirecting(false)
      clearError()
      setLocalError(null)
      loginForm.reset()
      registerForm.reset()
    }
  }, [isOpen, defaultMode, defaultUserType, clearError, loginForm, registerForm])

  // Handle successful authentication with proper feedback
  useEffect(() => {
    if (isAuthenticated && isLoginSuccess && !localError) {
      setIsRedirecting(true)
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        if (currentUser?.user_type === 'developer' || currentUser?.user_type === 'unverified_developer') {
          window.location.href = '/developer/dashboard'
        }
        onClose()
      }, 1500) // Give user time to see success message
    }
  }, [isAuthenticated, isLoginSuccess, localError, onClose])

  // Only clear errors when explicitly switching between auth modes, not tabs
  useEffect(() => {
    clearError()
    setLocalError(null)
  }, [authMode, clearError])

  // Clear only local errors when switching tabs (preserve auth errors)
  useEffect(() => {
    setLocalError(null)
  }, [activeTab])

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setLocalError(null) // Clear any previous local errors
      setIsLoginSuccess(false)
      
      const success = await login(data.email, data.password)
      if (success) {
        // Get the current user from auth store
        const currentUser = useAuthStore.getState().user
        
        if (currentUser) {
          const isUserDeveloper = currentUser.user_type === 'developer' || currentUser.user_type === 'unverified_developer'
          const isUserBuyer = currentUser.user_type === 'buyer'
          
          // Validate user type matches selected tab
          if (activeTab === 'buyer' && !isUserBuyer) {
            // Developer logged into buyer section
            setLocalError("This appears to be a developer account. Please use the 'Developer' tab to login.")
            // Auto-switch to developer tab and prevent modal from closing
            setActiveTab('developer')
            // Log out the user since they're in wrong section
            useAuthStore.getState().logout()
            return
          } else if (activeTab === 'developer' && !isUserDeveloper) {
            // Buyer logged into developer section  
            setLocalError("This appears to be a buyer account. Please use the 'Buyer' tab to login.")
            // Auto-switch to buyer tab and prevent modal from closing
            setActiveTab('buyer')
            // Log out the user since they're in wrong section
            useAuthStore.getState().logout()
            return
          }
          
          // User type matches selected tab - mark success for proper handling
          setIsLoginSuccess(true)
        } else {
          // If no user data, just close modal (fallback)
          onClose()
        }
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const onRegisterSubmit = async (data: RegisterForm) => {
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      registerForm.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match"
      })
      return
    }

    // Parse full name into first_name and last_name
    const nameParts = data.name.trim().split(" ")
    const first_name = nameParts[0] || ""
    const last_name = nameParts.slice(1).join(" ") || ""

    if (!first_name) {
      registerForm.setError("name", {
        type: "manual",
        message: "Please enter your full name"
      })
      return
    }

    try {
      const success = await registerBuyer({
        email: data.email,
        password: data.password,
        first_name,
        last_name
      })

      if (success) {
        setIsLoginSuccess(true)
        console.log("Registration successful!")
      }
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log("Social login with:", provider)
    // TODO: Implement social login
  }

  const handleDeveloperRegistration = () => {
    onClose()
    // TODO: Navigate to developer registration page
    window.location.href = "/developer-registration"
  }

  // Get display error - persist until user takes action
  const displayError = localError || error

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{authMode === "login" ? "Sign In" : "Create Account"}</DialogTitle>
        </DialogHeader>

        {/* Success Message */}
        {isLoginSuccess && (
          <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 rounded-md flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {isRedirecting ? "Login successful! Redirecting..." : "Login successful!"}
          </div>
        )}

        {/* Error Display - Only show if not in success state */}
        {displayError && !isLoginSuccess && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-md">
            <div className="flex justify-between items-start">
              <span>{displayError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalError(null)
                  clearError()
                }}
                className="h-auto p-1 text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Disable all form interactions during success/redirect state */}
        <div className={isLoginSuccess ? "opacity-50 pointer-events-none" : ""}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buyer">Buyer</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
            </TabsList>

            <TabsContent value="buyer" className="space-y-4 mt-6">
              {authMode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...loginForm.register("email", { required: "Email is required" })}
                      placeholder="Enter your email"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...loginForm.register("password", { required: "Password is required" })}
                        placeholder="Enter your password"
                        disabled={isLoading || isLoginSuccess}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isLoginSuccess}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" {...loginForm.register("rememberMe")} disabled={isLoading || isLoginSuccess} />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" className="px-0 text-sm" disabled={isLoading || isLoginSuccess}>
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isLoginSuccess}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : isLoginSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Success!
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...registerForm.register("name", { required: "Full name is required" })}
                      placeholder="Enter your full name"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerForm.register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      placeholder="Enter your email"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...registerForm.register("password", { 
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters"
                        }
                      })}
                      placeholder="Create a password"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerForm.register("confirmPassword", { required: "Please confirm your password" })}
                      placeholder="Confirm your password"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isLoginSuccess}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : isLoginSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Success!
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="developer" className="space-y-4 mt-6">
              {authMode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dev-email">Email</Label>
                    <Input
                      id="dev-email"
                      type="email"
                      {...loginForm.register("email", { required: "Email is required" })}
                      placeholder="Enter your business email"
                      disabled={isLoading || isLoginSuccess}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dev-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="dev-password"
                        type={showPassword ? "text" : "password"}
                        {...loginForm.register("password", { required: "Password is required" })}
                        placeholder="Enter your password"
                        disabled={isLoading || isLoginSuccess}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isLoginSuccess}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dev-remember" {...loginForm.register("rememberMe")} disabled={isLoading || isLoginSuccess} />
                      <Label htmlFor="dev-remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" className="px-0 text-sm" disabled={isLoading || isLoginSuccess}>
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isLoginSuccess}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : isLoginSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Success!
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Developer registration requires verification.
                      <Button 
                        variant="link" 
                        className="px-1 text-sm h-auto" 
                        onClick={handleDeveloperRegistration}
                        disabled={isLoading || isLoginSuccess}
                      >
                        Use our full registration form
                      </Button>
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDeveloperRegistration}
                    disabled={isLoading || isLoginSuccess}
                  >
                    Go to Developer Registration
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("google")} 
                className="w-full"
                disabled={isLoading || isLoginSuccess}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("facebook")} 
                className="w-full"
                disabled={isLoading || isLoginSuccess}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          {/* Toggle between login/register */}
          <div className="text-center text-sm">
            {authMode === "login" ? (
              <span>
                {"Don't have an account? "}
                <Button 
                  variant="link" 
                  className="px-0 text-sm h-auto" 
                  onClick={() => setAuthMode("register")}
                  disabled={isLoading || isLoginSuccess}
                >
                  Sign up
                </Button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="px-0 text-sm h-auto" 
                  onClick={() => setAuthMode("login")}
                  disabled={isLoading || isLoginSuccess}
                >
                  Sign in
                </Button>
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
