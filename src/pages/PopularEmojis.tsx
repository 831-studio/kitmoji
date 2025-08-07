import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Emoji } from '../types/emoji'
import EmojiGrid from '../components/EmojiGrid'

function PopularEmojis() {
  const [popularEmojis, setPopularEmojis] = useState<Emoji[]>([])
  const [loading, setLoading] = useState(true)

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
      setPopularEmojis(data)
    } catch (error) {
      console.error('Error fetching popular emojis:', error)
    } finally {
      setLoading(false)
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

      {/* Popular Emojis Grid - Using same component as Home Page */}
      <div className="mb-12">
        <EmojiGrid emojis={popularEmojis} loading={loading} />
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
          "url": typeof window !== 'undefined' ? window.location.href : '',
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
                "description": `#${index + 1} most popular emoji - ${emoji.name}`,
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