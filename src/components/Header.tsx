import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Home, Star, Sparkles, Grid3x3, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Header = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/all-emojis', label: 'All Emojis', icon: Grid3x3 },
    { path: '/popular-emojis', label: 'Popular', icon: Star },
    { path: '/new-emojis', label: 'New', icon: Sparkles },
    { path: '/unicode', label: 'Unicode', icon: Code2 }
  ]

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.h1 
              className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Kitmoji
            </motion.h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActivePath(path)
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-4 py-4 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    isActivePath(path)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  )
}

export default Header