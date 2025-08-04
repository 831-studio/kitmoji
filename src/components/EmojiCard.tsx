import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { Emoji } from '../types/emoji'

interface EmojiCardProps {
  emoji: Emoji
  showUnicode?: boolean
}

const EmojiCard = ({ emoji, showUnicode = false }: EmojiCardProps) => {
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

  const copyEmoji = () => copyToClipboard(emoji.emoji)
  const copyUnicode = () => copyToClipboard(emoji.unicode)

  return (
    <motion.div
      className="bg-card rounded-lg p-4 card-hover cursor-pointer group relative border border-border shadow-sm hover:shadow-md transition-all duration-300 h-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={copyEmoji}
      layout
    >
      <div className="text-center flex flex-col h-full">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {emoji.emoji}
        </div>
        <h3 className="text-muted-foreground text-sm mb-1 capitalize line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {emoji.name}
        </h3>
        {showUnicode && (
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyUnicode()
              }}
              className="w-full px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-lg flex items-center justify-center space-x-2 transition-colors border border-border"
            >
              <code className="font-mono">{emoji.unicode}</code>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>
      
      <motion.div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        {copied ? (
          <Check className="text-green-500" size={20} />
        ) : (
          <Copy className="text-muted-foreground" size={20} />
        )}
      </motion.div>
      
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
        >
          Copied!
        </motion.div>
      )}
    </motion.div>
  )
}

export default EmojiCard