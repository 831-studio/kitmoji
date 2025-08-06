import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Heart, Share2, Tag, Code } from 'lucide-react'
import { Emoji } from '../types/emoji'
import { generateEmojiSlug } from '../utils/emojiUtils'

function EmojiDetail() {
  const { emojiName } = useParams<{ emojiName: string }>()
  const [emoji, setEmoji] = useState<Emoji | null>(null)
  const [relatedEmojis, setRelatedEmojis] = useState<Emoji[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copyCount, setCopyCount] = useState(0)
  const [unicodeCopied, setUnicodeCopied] = useState(false)

  useEffect(() => {
    if (!emojiName) return

    const fetchEmoji = async () => {
      try {
        // Use the dedicated emoji endpoint for better matching
        const response = await fetch(`/api/emoji/${encodeURIComponent(emojiName)}`)
        
        if (response.ok) {
          const foundEmoji = await response.json()
          setEmoji(foundEmoji)
          
          // Fetch related emojis from same category
          const relatedResponse = await fetch(`/api/emojis?category=${encodeURIComponent(foundEmoji.category)}&limit=12`)
          const relatedData = await relatedResponse.json()
          setRelatedEmojis(relatedData.emojis.filter((e: Emoji) => e.id !== foundEmoji.id).slice(0, 8))
          
          // Update page title and meta
          document.title = `${foundEmoji.emoji} ${foundEmoji.name} - Copy and Paste | Kitmoji`
          updateMetaTags(foundEmoji)
        } else {
          // Fallback to search method
          const searchName = emojiName.replace(/-/g, ' ')
          const searchResponse = await fetch(`/api/emojis?search=${encodeURIComponent(searchName)}&limit=1`)
          const data = await searchResponse.json()
        
          if (data.emojis && data.emojis.length > 0) {
            const foundEmoji = data.emojis[0]
            setEmoji(foundEmoji)
            
            // Fetch related emojis from same category
            const relatedResponse = await fetch(`/api/emojis?category=${encodeURIComponent(foundEmoji.category)}&limit=12`)
            const relatedData = await relatedResponse.json()
            setRelatedEmojis(relatedData.emojis.filter((e: Emoji) => e.id !== foundEmoji.id).slice(0, 8))
            
            // Update page title and meta
            document.title = `${foundEmoji.emoji} ${foundEmoji.name} - Copy and Paste | Kitmoji`
            updateMetaTags(foundEmoji)
          }
        }
      } catch (error) {
        console.error('Error fetching emoji:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmoji()
  }, [emojiName])

  const updateMetaTags = (emoji: Emoji) => {
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', `Copy ${emoji.emoji} ${emoji.name} emoji to clipboard. Unicode: ${emoji.unicode}. Keywords: ${emoji.keywords}. Free to use ${emoji.name} emoji.`)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', `${emoji.emoji} ${emoji.name} - Copy and Paste`)
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', `Copy ${emoji.name} emoji to clipboard. Free ${emoji.category} emoji with Unicode ${emoji.unicode}.`)
    }
  }

  const copyEmoji = async () => {
    if (!emoji) return
    
    try {
      await navigator.clipboard.writeText(emoji.emoji)
      setCopied(true)
      setCopyCount(prev => prev + 1)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = emoji.emoji
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setCopyCount(prev => prev + 1)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareEmoji = async () => {
    if (!emoji) return

    const shareData = {
      title: `${emoji.emoji} ${emoji.name}`,
      text: `Check out this ${emoji.name} emoji: ${emoji.emoji}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    } catch (error) {
      console.log('Share failed:', error)
    }
  }

  const copyUnicode = async () => {
    if (!emoji) return
    
    try {
      await navigator.clipboard.writeText(emoji.unicode)
      setUnicodeCopied(true)
      setTimeout(() => setUnicodeCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = emoji.unicode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setUnicodeCopied(true)
      setTimeout(() => setUnicodeCopied(false), 2000)
    }
  }

  const formatUnicode = (unicode: string) => {
    return unicode.split(' ').map(code => `U+${code.padStart(4, '0').toUpperCase()}`).join(' ')
  }

  const formatKeywords = (keywords: string) => {
    return keywords.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!emoji) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Emoji Not Found</h1>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the emoji you're looking for.</p>
        <Link 
          to="/" 
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse All Emojis
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${emoji.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-purple-600 transition-colors">
          {emoji.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{emoji.name}</span>
      </nav>

      {/* Main Emoji Display */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 select-none">{emoji.emoji}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{emoji.name}</h1>
          <p className="text-lg text-gray-600 capitalize mb-4">{emoji.category.replace('-', ' ')}</p>
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={copyEmoji}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Copy className="w-5 h-5" />
            {copied ? 'Copied!' : 'Copy Emoji'}
          </button>
          
          <button
            onClick={shareEmoji}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-gray-700">
            <Heart className="w-5 h-5" />
            <span className="font-medium">{copyCount} copies</span>
          </div>
        </div>

        {/* Emoji Details */}
        <div className="space-y-8">
          {/* Unicode info - centered below actions */}
          <div className="flex items-center justify-center gap-3">
            <Code className="w-5 h-5 text-gray-500" />
            <div className="text-center">
              <span className="text-sm text-gray-500 mr-2">Unicode:</span>
              <button
                onClick={copyUnicode}
                className={`bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-mono transition-colors cursor-pointer ${
                  unicodeCopied ? 'bg-green-100 text-green-800' : 'text-gray-800'
                }`}
                title="Click to copy Unicode"
              >
                {emoji.unicode}
              </button>
              {unicodeCopied && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="ml-2 text-sm text-green-600 font-medium"
                >
                  Copied!
                </motion.span>
              )}
            </div>
          </div>

          {/* Keywords tags */}
          {formatKeywords(emoji.keywords).length > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Related Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {formatKeywords(emoji.keywords).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Emojis */}
      {relatedEmojis.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            More {emoji.category.replace('-', ' ')} Emojis
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {relatedEmojis.map((relatedEmoji) => {
              const emojiSlug = generateEmojiSlug(relatedEmoji.name)
              return (
                <Link
                  key={relatedEmoji.id}
                  to={`/emoji/${emojiSlug}`}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {relatedEmoji.emoji}
                  </div>
                  <div className="text-xs text-gray-600 text-center leading-tight">
                    {relatedEmoji.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": `${emoji.emoji} ${emoji.name} - Copy and Paste`,
          "description": `Copy ${emoji.name} emoji to clipboard. Unicode: ${emoji.unicode}. Free ${emoji.category} emoji.`,
          "url": window.location.href,
          "mainEntity": {
            "@type": "Thing",
            "name": emoji.name,
            "description": `${emoji.name} emoji from ${emoji.category} category`,
            "identifier": emoji.unicode,
            "category": emoji.category,
            "keywords": emoji.keywords
          }
        })}
      </script>
    </motion.div>
  )
}

export default EmojiDetail