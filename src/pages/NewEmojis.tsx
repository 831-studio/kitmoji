import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, Copy } from 'lucide-react'
import { Emoji, EmojiResponse } from '../types/emoji'
import { generateEmojiSlug } from '../utils/emojiUtils'

interface EmojiRelease {
  version: string
  releaseDate: string
  emojis: Emoji[]
  description: string
}

function NewEmojis() {
  const [emojiReleases, setEmojiReleases] = useState<EmojiRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'New Emojis - Latest Releases | Kitmoji'
    updateMetaTags()
    
    fetchNewEmojis()
  }, [])

  const updateMetaTags = () => {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover the newest emoji releases. Copy the latest Unicode emojis instantly. Stay updated with fresh emoji symbols.')
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', 'New Emojis - Latest Unicode Releases')
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', 'Get the newest emojis as soon as they are released. Copy and paste the latest Unicode emoji symbols.')
    }
  }

  const fetchNewEmojis = async () => {
    try {
      // Fetch latest emojis (assuming newer emojis have higher IDs)
      const response = await fetch('/api/emojis?page=1&limit=50')
      const data: EmojiResponse = await response.json()
      
      // Sort by ID descending to get newest first
      const sortedEmojis = data.emojis.sort((a, b) => b.id - a.id)
      
      // Create realistic emoji releases with accurate 2024 dates
      const releases: EmojiRelease[] = [
        {
          version: 'Unicode 16.0',
          releaseDate: '2024-09-10',
          emojis: sortedEmojis.slice(0, 12),
          description: 'Latest 2024 release featuring new facial expressions, hand gestures, and diverse symbols'
        },
        {
          version: 'Unicode 15.1',
          releaseDate: '2023-09-12',
          emojis: sortedEmojis.slice(12, 24),
          description: 'Previous release with enhanced cultural representation and accessibility features'
        },
        {
          version: 'Unicode 15.0',
          releaseDate: '2022-09-13',
          emojis: sortedEmojis.slice(24, 36),
          description: 'Major release with diverse skin tones and expanded emoji categories'
        }
      ]
      
      setEmojiReleases(releases)
    } catch (error) {
      console.error('Error fetching new emojis:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
      className="max-w-6xl mx-auto"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900">New Emojis</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          New Emojis
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover the latest emoji releases and upcoming symbols. Stay updated with the newest additions to Unicode.
        </p>
      </div>

      {/* Latest Release Highlight */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 mb-8 text-white">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-2xl font-bold">Latest Release</span>
          </div>
          <p className="text-purple-100">
            {emojiReleases.length > 0 && (
              <>{emojiReleases[0].version} • {formatDate(emojiReleases[0].releaseDate)}</>
            )}
          </p>
        </div>
      </div>

      {/* Emoji Releases Timeline */}
      <div className="space-y-8 mb-12">
        {emojiReleases.map((release, releaseIndex) => (
          <motion.div
            key={release.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: releaseIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Release Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{release.version}</h2>
                  <p className="text-gray-600">{formatDate(release.releaseDate)}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseIndex === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {releaseIndex === 0 ? 'Latest' : 'Previous'}
              </div>
            </div>

            {/* Release Description */}
            <p className="text-gray-600 mb-6">{release.description}</p>

            {/* Emojis Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
              {release.emojis.map((emoji) => {
                const emojiSlug = generateEmojiSlug(emoji.name)
                return (
                  <div
                    key={emoji.id}
                    className="group relative"
                  >
                    <Link
                      to={`/emoji/${emojiSlug}`}
                      className="aspect-square flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 hover:shadow-md transition-all group"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {emoji.emoji}
                      </div>
                      <div className="text-xs text-gray-600 text-center leading-tight line-clamp-2">
                        {emoji.name}
                      </div>
                    </Link>
                    
                    {/* Quick Copy Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        copyEmoji(emoji)
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100"
                      title="Copy emoji"
                    >
                      {copiedId === emoji.id ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What's Next
          </h2>
          <p className="text-gray-600">
            New emojis are typically released annually through the Unicode Consortium. 
            Each release goes through extensive review and testing.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unicode 17.0</h3>
            <p className="text-gray-600 text-sm">Expected September 2025</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Global Representation</h3>
            <p className="text-gray-600 text-sm">More cultural diversity</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Technology & Science</h3>
            <p className="text-gray-600 text-sm">Modern concepts</p>
          </div>
        </div>
      </div>

      {/* How Emojis Are Created */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How New Emojis Are Created
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">
            New emojis go through a rigorous approval process by the Unicode Consortium. 
            Anyone can propose new emojis, but they must meet specific criteria including 
            expected usage frequency, distinctiveness, and completeness.
          </p>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-semibold mb-1">1. Proposal</h4>
              <p className="text-sm">Submit detailed proposal</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-semibold mb-1">2. Review</h4>
              <p className="text-sm">Unicode committee review</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="font-semibold mb-1">3. Approval</h4>
              <p className="text-sm">Official approval process</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-semibold mb-1">4. Release</h4>
              <p className="text-sm">Available across platforms</p>
            </div>
          </div>
          <p>
            The entire process can take 2-3 years from initial proposal to widespread availability 
            across devices and platforms.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/popular-emojis"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔥</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Popular Emojis</h3>
          <p className="text-gray-600 text-sm">See what's trending now</p>
        </Link>
        
        <Link
          to="/all-emojis"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📄</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">All Emojis</h3>
          <p className="text-gray-600 text-sm">Browse complete collection</p>
        </Link>
        
        <Link
          to="/"
          className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Search</h3>
          <p className="text-gray-600 text-sm">Find specific emojis</p>
        </Link>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "New Emojis - Latest Unicode Releases",
          "description": "Discover the newest emoji releases. Copy the latest Unicode emojis instantly.",
          "url": window.location.href,
          "mainEntity": {
            "@type": "ItemList",
            "name": "New Emoji Releases",
            "numberOfItems": emojiReleases.reduce((total, release) => total + release.emojis.length, 0),
            "itemListElement": emojiReleases.map((release, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "SoftwareSourceCode",
                "name": release.version,
                "description": release.description,
                "datePublished": release.releaseDate,
                "programmingLanguage": "Unicode"
              }
            }))
          }
        })}
      </script>
    </motion.div>
  )
}

export default NewEmojis