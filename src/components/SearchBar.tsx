import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchBar = ({ onSearch, placeholder = "Search emojis" }: SearchBarProps) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, onSearch])

  const clearSearch = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3 text-base rounded-lg bg-white border border-gray-300 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent focus:outline-none shadow-sm transition-all duration-300"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SearchBar