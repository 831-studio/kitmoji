import { motion } from 'framer-motion'
import { ChevronDown, Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  onClick: () => void
  loading?: boolean
  hasMore?: boolean
  text?: string
}

const LoadMoreButton = ({ onClick, loading = false, hasMore = true, text = "Load More" }: LoadMoreButtonProps) => {
  if (!hasMore) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">That's all the emojis! 🎉</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-8">
      <motion.button
        onClick={onClick}
        disabled={loading}
        className="flex items-center space-x-2 px-8 py-4 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-secondary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>{text}</span>
            <ChevronDown size={20} />
          </>
        )}
      </motion.button>
    </div>
  )
}

export default LoadMoreButton