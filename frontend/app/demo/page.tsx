"use client"

import GooeyNav from "@/components/ui/gooey-nav"
import Link from "next/link"

export default function DemoPage() {
  // Demo navigation items - removing icons since the real GooeyNav doesn't support them
  const basicItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" }
  ]

  const realEstateItems = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/projects" },
    { label: "Developers", href: "/developer" },
    { label: "Search", href: "/property/search" },
    { label: "About", href: "/about" }
  ]

  const extendedItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Services", href: "/services" },
    { label: "Team", href: "/team" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            GooeyNav Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore different configurations of the GooeyNav component with particle animations and gooey effects.
          </p>
        </div>

        <div className="space-y-16">
          {/* Basic Configuration */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Configuration</h2>
            <p className="text-gray-400 mb-8">Simple navigation with default settings</p>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8">
              <GooeyNav items={basicItems} />
            </div>
          </section>

          {/* Real Estate Theme */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Real Estate Theme</h2>
            <p className="text-gray-400 mb-8">Optimized for real estate platforms like NovaDom</p>
            <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 rounded-2xl p-8">
              <GooeyNav 
                items={realEstateItems}
                initialActiveIndex={1}
                animationTime={600}
                particleCount={12}
                particleDistances={[90, 10]}
                colors={[1, 2, 3, 4, 5]}
              />
            </div>
          </section>

          {/* High Energy Configuration */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">High Energy</h2>
            <p className="text-gray-400 mb-8">More particles, faster animations, wider spread</p>
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8">
              <GooeyNav 
                items={basicItems}
                animationTime={400}
                particleCount={25}
                particleDistances={[120, 15]}
                particleR={150}
                timeVariance={400}
                colors={[1, 2, 3, 4, 5, 1, 2, 3]}
              />
            </div>
          </section>

          {/* Extended Navigation */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Extended Navigation</h2>
            <p className="text-gray-400 mb-8">Larger navigation with more items</p>
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8">
              <GooeyNav 
                items={extendedItems}
                initialActiveIndex={2}
                animationTime={800}
                particleCount={15}
                particleDistances={[100, 8]}
                particleR={80}
                timeVariance={250}
                colors={[3, 1, 4, 2, 5]}
              />
            </div>
          </section>

          {/* Subtle Configuration */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Subtle & Elegant</h2>
            <p className="text-gray-400 mb-8">Fewer particles, slower animations, close spread</p>
            <div className="bg-gradient-to-r from-slate-700 via-gray-700 to-slate-700 rounded-2xl p-8">
              <GooeyNav 
                items={basicItems}
                animationTime={1000}
                particleCount={8}
                particleDistances={[60, 5]}
                particleR={60}
                timeVariance={150}
                colors={[1, 1, 2, 2]}
              />
            </div>
          </section>
        </div>

        {/* Color Reference */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Color Reference</h2>
          <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: 'rgba(99, 102, 241, 0.8)' }}></div>
              <span className="text-sm text-gray-400">Color 1</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: 'rgba(236, 72, 153, 0.8)' }}></div>
              <span className="text-sm text-gray-400">Color 2</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: 'rgba(34, 197, 94, 0.8)' }}></div>
              <span className="text-sm text-gray-400">Color 3</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: 'rgba(251, 146, 60, 0.8)' }}></div>
              <span className="text-sm text-gray-400">Color 4</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: 'rgba(139, 92, 246, 0.8)' }}></div>
              <span className="text-sm text-gray-400">Color 5</span>
            </div>
          </div>
        </section>

        <div className="text-center mt-16">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300"
          >
            ← Back to NovaDom
          </Link>
        </div>
      </div>
    </div>
  )
} 