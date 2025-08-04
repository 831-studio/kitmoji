import { motion, AnimatePresence } from 'framer-motion'
import EmojiCard from './EmojiCard'
import { Emoji } from '../types/emoji'

interface EmojiGridProps {
  emojis: Emoji[]
  loading?: boolean
  showUnicode?: boolean
}

const EmojiGrid = ({ emojis, loading = false, showUnicode = false }: EmojiGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 animate-pulse shadow-sm aspect-square flex flex-col items-center justify-center">
            <div className="w-8 h-8 bg-muted rounded-full mb-2"></div>
            <div className="h-2 bg-muted rounded w-full mb-1"></div>
            <div className="h-2 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (emojis.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">No emojis found</h3>
        <p className="text-muted-foreground">Try adjusting your search or category filter</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3"
      layout
    >
      <AnimatePresence>
        {emojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <EmojiCard emoji={emoji} showUnicode={showUnicode} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default EmojiGrid