import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Home } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.h1 
              className="text-2xl font-bold text-foreground hover:text-muted-foreground transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Kitmoji
            </motion.h1>
          </Link>
          
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                location.pathname === '/'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link
              to="/unicode"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                location.pathname === '/unicode'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Code2 size={18} />
              <span>Unicode</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header