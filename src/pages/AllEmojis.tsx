import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Grid3x3, List, Filter } from 'lucide-react'
import { Emoji, EmojiResponse } from '../types/emoji'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import EmojiGrid from '../components/EmojiGrid'
import LoadMoreButton from '../components/LoadMoreButton'
import { generateEmojiSlug } from '../utils/emojiUtils'

function AllEmojis() {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalEmojis, setTotalEmojis] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Update page title and meta tags
    document.title = 'All Emojis - Complete Collection | Kitmoji'
    updateMetaTags()
    
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchEmojis(1, true)
  }, [searchTerm, selectedCategory])

  const updateMetaTags = () => {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Browse our complete collection of emojis. Copy and paste any emoji instantly. Free emoji library with search and categories.')
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', 'All Emojis - Complete Emoji Collection')
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', 'Discover thousands of emojis in one place. Copy and paste emojis for free. Complete Unicode emoji library.')
    }
  }

  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)
      
      // Fetch initial emojis
      await fetchEmojis(1, true)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setLoading(false)
    }
  }

  const fetchEmojis = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true)
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '60'
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/emojis?${params}`)
      const data: EmojiResponse = await response.json()

      if (reset) {
        setEmojis(data.emojis)
      } else {
        setEmojis(prev => [...prev, ...data.emojis])
      }

      setTotalEmojis(data.total)
      setPage(pageNum)
      setHasMore(pageNum < data.totalPages)
    } catch (error) {
      console.error('Error fetching emojis:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    await fetchEmojis(page + 1, false)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900">All Emojis</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          All Emojis Collection
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Browse our complete library of {totalEmojis.toLocaleString()} emojis. Copy and paste any emoji instantly.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search all emojis..." 
            />
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t pt-4"
          >
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryFilter}
            />
          </motion.div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {searchTerm || selectedCategory !== 'all' ? (
            <>Showing {emojis.length} of {totalEmojis} emojis</>
          ) : (
            <>Showing {emojis.length} emojis</>
          )}
          {searchTerm && <span className="font-medium"> for "{searchTerm}"</span>}
          {selectedCategory !== 'all' && <span className="font-medium"> in {selectedCategory}</span>}
        </p>
      </div>

      {/* Emoji Display */}
      {viewMode === 'grid' ? (
        <EmojiGrid emojis={emojis} />
      ) : (
        <div className="space-y-2 mb-8">
          {emojis.map((emoji) => {
            const emojiSlug = generateEmojiSlug(emoji.name)
            return (
              <Link
                key={emoji.id}
                to={`/emoji/${emojiSlug}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 group"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">
                  {emoji.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {emoji.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {emoji.category}
                    {emoji.keywords && ` • ${emoji.keywords.split(',').slice(0, 3).join(', ')}`}
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {emoji.unicode}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mb-12">
          <LoadMoreButton 
            onClick={loadMore} 
            loading={loadingMore}
            text="Load More Emojis"
          />
        </div>
      )}

      {/* SEO Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Complete Emoji Collection
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">
            Welcome to our comprehensive emoji library featuring {totalEmojis.toLocaleString()} Unicode emojis. 
            Our collection includes all the latest emoji releases and classic favorites, organized by categories 
            for easy browsing.
          </p>
          <p className="mb-4">
            Every emoji in our database can be copied with a single click and pasted anywhere - in messages, 
            social media posts, documents, emails, and more. All emojis are Unicode-compatible and work 
            across all modern platforms including iOS, Android, Windows, macOS, and web browsers.
          </p>
          <p>
            Use our powerful search and filtering tools to find exactly the emoji you need. Browse by category 
            or search by name and keywords to discover the perfect emoji for any situation.
          </p>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => {
            const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
            return (
              <Link
                key={category}
                to={`/category/${categorySlug}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border-2 border-transparent transition-all group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <span className="text-purple-600 font-semibold text-sm">
                    {category.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-700 group-hover:text-purple-700 font-medium">
                  {category}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "All Emojis - Complete Collection",
          "description": "Browse our complete collection of emojis. Copy and paste any emoji instantly. Free emoji library with search and categories.",
          "url": window.location.href,
          "numberOfItems": totalEmojis,
          "about": {
            "@type": "Thing",
            "name": "Emoji Collection",
            "description": "Complete Unicode emoji library"
          },
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalEmojis,
            "itemListElement": categories.map((category, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": `${category} Emojis`,
                "description": `Collection of ${category.toLowerCase()} emoji symbols`,
                "url": `${window.location.origin}/category/${category.toLowerCase().replace(/\s+/g, '-')}`
              }
            }))
          }
        })}
      </script>
    </motion.div>
  )
}

export default AllEmojis