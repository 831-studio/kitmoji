import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Star, Copy, ExternalLink } from 'lucide-react'
import { Emoji } from '../types/emoji'
import { generateEmojiSlug } from '../utils/emojiUtils'

interface PopularEmoji extends Emoji {
  rank: number
  usage_trend: 'up' | 'down' | 'stable'
}

function PopularEmojis() {
  const [popularEmojis, setPopularEmojis] = useState<PopularEmoji[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Most Popular Emojis - Trending Now | Kitmoji'
    updateMetaTags()
    
    fetchPopularEmojis()
  }, [])

  const updateMetaTags = () => {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover the most popular and trending emojis. Copy the most used emojis instantly. See what emojis are trending right now.')
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Most Popular Emojis - Trending Now')
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', 'Find the most popular and trending emojis. Copy and paste the most used emoji symbols.')
    }
  }

  const fetchPopularEmojis = async () => {
    try {
      const response = await fetch('/api/emojis/popular')
      const data = await response.json()
      
      // Add rank and mock trend data for popular emojis
      const popularWithRanks: PopularEmoji[] = data.map((emoji: Emoji, index: number) => ({
        ...emoji,
        rank: index + 1,
        usage_trend: index < 5 ? 'up' : index < 10 ? 'stable' : 'down' as 'up' | 'down' | 'stable'
      }))
      
      setPopularEmojis(popularWithRanks)
    } catch (error) {
      console.error('Error fetching popular emojis:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyEmoji = async (emoji: Emoji) => {
    try {
      await navigator.clipboard.writeText(emoji.emoji)
      setCopiedId(emoji.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = emoji.emoji
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(emoji.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
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
      className="max-w-4xl mx-auto"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Popular Emojis</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Most Popular Emojis
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover the most popular and trending emojis. See what everyone is using right now.
        </p>
      </div>

      {/* Popular Emojis Grid - Same as Home Page */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 mb-12">
        {popularEmojis.map((emoji, index) => {
          const emojiSlug = generateEmojiSlug(emoji.name)
          return (
            <motion.div
              key={emoji.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg p-4 cursor-pointer group relative border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full"
            >
              <Link to={`/emoji/${emojiSlug}`} className="text-center flex flex-col h-full">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {emoji.emoji}
                </div>
                <h3 className="text-gray-600 text-sm mb-1 capitalize line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                  {emoji.name}
                </h3>
              </Link>
              
              {/* Copy button like home page */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  copyEmoji(emoji)
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-purple-50"
                title="Copy emoji"
              >
                {copiedId === emoji.id ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Link indicator like home page */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-purple-500 text-white rounded-full p-1.5 shadow-lg">
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
              
              {copiedId === emoji.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                >
                  Copied!
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>


      {/* SEO Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          About Popular Emojis
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">
            Our popular emoji rankings are based on usage patterns across social media platforms, 
            messaging apps, and digital communication. These emojis represent the most commonly 
            used symbols in modern digital communication.
          </p>
          <p className="mb-4">
            The 😀 grinning face, ❤️ red heart, and 😂 face with tears of joy consistently 
            rank among the top emojis worldwide. These universal symbols transcend language barriers 
            and help express emotions in digital communication.
          </p>
          <p>
            Stay up-to-date with emoji trends and discover which symbols are gaining popularity. 
            Copy any emoji with a single click to use in your messages, social media posts, and digital content.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/all-emojis"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📄</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Browse All Emojis</h3>
          <p className="text-gray-600 text-sm">Explore our complete emoji collection</p>
        </Link>
        
        <Link
          to="/new-emojis"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">✨</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">New Emojis</h3>
          <p className="text-gray-600 text-sm">Check out the latest emoji releases</p>
        </Link>
        
        <Link
          to="/"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Search Emojis</h3>
          <p className="text-gray-600 text-sm">Find specific emojis by name or keyword</p>
        </Link>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Most Popular Emojis - Trending Now",
          "description": "Discover the most popular and trending emojis. Copy the most used emojis instantly.",
          "url": window.location.href,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": popularEmojis.length,
            "itemListElement": popularEmojis.map((emoji, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": emoji.name,
                "identifier": emoji.unicode,
                "description": `#${emoji.rank} most popular emoji - ${emoji.name}`,
                "category": emoji.category
              }
            }))
          }
        })}
      </script>
    </motion.div>
  )
}

export default PopularEmojis