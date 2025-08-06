import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Grid3x3, List } from 'lucide-react'
import { Emoji, EmojiResponse } from '../types/emoji'
import LoadMoreButton from '../components/LoadMoreButton'
import { generateEmojiSlug } from '../utils/emojiUtils'

function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>()
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryDisplayName, setCategoryDisplayName] = useState('')
  const [totalEmojis, setTotalEmojis] = useState(0)

  useEffect(() => {
    if (!categoryName) return

    const fetchCategoryEmojis = async () => {
      try {
        setLoading(true)
        setPage(1)
        setEmojis([])
        
        // Convert URL slug back to category name
        const searchCategory = categoryName.replace(/-/g, ' ')
        
        const response = await fetch(`/api/emojis?category=${encodeURIComponent(searchCategory)}&page=1&limit=48`)
        const data: EmojiResponse = await response.json()
        
        if (data.emojis && data.emojis.length > 0) {
          setEmojis(data.emojis)
          setTotalEmojis(data.total)
          setHasMore(data.page < data.totalPages)
          
          // Set display name from first emoji's category
          const displayName = data.emojis[0].category
          setCategoryDisplayName(displayName)
          
          // Update page title and meta
          document.title = `${displayName} Emojis - ${data.total} ${displayName.toLowerCase()} emojis | Kitmoji`
          updateMetaTags(displayName, data.total)
        } else {
          setHasMore(false)
          setCategoryDisplayName(searchCategory)
        }
      } catch (error) {
        console.error('Error fetching category emojis:', error)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryEmojis()
  }, [categoryName])

  const updateMetaTags = (categoryName: string, total: number) => {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', `Browse ${total} ${categoryName.toLowerCase()} emojis. Copy and paste ${categoryName.toLowerCase()} emojis for free. Complete collection of ${categoryName.toLowerCase()} emoji symbols.`)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', `${categoryName} Emojis - ${total} emoji collection`)
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', `Discover ${total} ${categoryName.toLowerCase()} emojis. Copy and paste any emoji instantly. Free emoji collection.`)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore || !categoryName) return

    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const searchCategory = categoryName.replace(/-/g, ' ')
      
      const response = await fetch(`/api/emojis?category=${encodeURIComponent(searchCategory)}&page=${nextPage}&limit=48`)
      const data: EmojiResponse = await response.json()
      
      if (data.emojis && data.emojis.length > 0) {
        setEmojis(prev => [...prev, ...data.emojis])
        setPage(nextPage)
        setHasMore(nextPage < data.totalPages)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more emojis:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (emojis.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find any emojis in the "{categoryDisplayName}" category.</p>
        <Link 
          to="/" 
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse All Categories
        </Link>
      </motion.div>
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
        <span className="text-gray-900">Categories</span>
        <span>/</span>
        <span className="text-gray-900">{categoryDisplayName}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {categoryDisplayName} Emojis
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {totalEmojis} {categoryDisplayName.toLowerCase()} emojis to copy and paste
        </p>
        
        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Emoji Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mb-8">
          {emojis.map((emoji) => {
            const emojiSlug = generateEmojiSlug(emoji.name)
            return (
              <Link
                key={emoji.id}
                to={`/emoji/${emojiSlug}`}
                className="aspect-square flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 group"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {emoji.emoji}
                </div>
                <div className="text-xs text-gray-600 text-center leading-tight line-clamp-2">
                  {emoji.name}
                </div>
              </Link>
            )
          })}
        </div>
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
                  {emoji.keywords && (
                    <div className="text-sm text-gray-500 mt-1">
                      {emoji.keywords.split(',').slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {emoji.unicode}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <LoadMoreButton 
          onClick={loadMore} 
          loading={loadingMore}
          text={`Load More ${categoryDisplayName} Emojis`}
        />
      )}

      {/* Category Description */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          About {categoryDisplayName} Emojis
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Discover our complete collection of {totalEmojis} {categoryDisplayName.toLowerCase()} emojis. 
          Each emoji can be easily copied and pasted into your messages, social media posts, 
          documents, and more. All emojis are Unicode-compatible and work across all modern 
          platforms and devices.
        </p>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${categoryDisplayName} Emojis`,
          "description": `Browse ${totalEmojis} ${categoryDisplayName.toLowerCase()} emojis. Copy and paste ${categoryDisplayName.toLowerCase()} emojis for free.`,
          "url": window.location.href,
          "numberOfItems": totalEmojis,
          "about": {
            "@type": "Thing",
            "name": categoryDisplayName,
            "description": `Collection of ${categoryDisplayName.toLowerCase()} emoji symbols`
          },
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalEmojis,
            "itemListElement": emojis.slice(0, 10).map((emoji, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": emoji.name,
                "identifier": emoji.unicode,
                "description": `${emoji.name} emoji`
              }
            }))
          }
        })}
      </script>
    </motion.div>
  )
}

export default CategoryPage