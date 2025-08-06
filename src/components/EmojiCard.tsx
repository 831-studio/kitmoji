import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Emoji } from '../types/emoji'
import { generateEmojiSlug } from '../utils/emojiUtils'

interface EmojiCardProps {
  emoji: Emoji
  showUnicode?: boolean
  enableDetailLink?: boolean
}

const EmojiCard = ({ emoji, showUnicode = false, enableDetailLink = true }: EmojiCardProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyEmoji = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    copyToClipboard(emoji.emoji)
  }
  const copyUnicode = () => copyToClipboard(emoji.unicode)

  const emojiSlug = generateEmojiSlug(emoji.name)

  const cardContent = (
    <motion.div
      className="bg-white rounded-lg p-4 cursor-pointer group relative border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={enableDetailLink ? undefined : copyEmoji}
      layout
    >
      <div className="text-center flex flex-col h-full">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {emoji.emoji}
        </div>
        <h3 className="text-gray-600 text-sm mb-1 capitalize line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {emoji.name}
        </h3>
        {showUnicode && (
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyUnicode()
              }}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg flex items-center justify-center space-x-2 transition-colors border border-gray-300"
            >
              <code className="font-mono">{emoji.unicode}</code>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>
      
      {/* Quick Copy Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          copyEmoji(e)
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-purple-50"
        title="Copy emoji"
      >
        {copied ? (
          <Check className="text-green-500" size={16} />
        ) : (
          <Copy className="text-gray-600" size={16} />
        )}
      </button>

      {/* Detail Link */}
      {enableDetailLink && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-purple-500 text-white rounded-full p-1.5 shadow-lg">
            <ExternalLink size={12} />
          </div>
        </div>
      )}
      
      {copied && (
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

  if (enableDetailLink) {
    return (
      <Link to={`/emoji/${emojiSlug}`} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export default EmojiCard