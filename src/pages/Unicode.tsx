import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import EmojiGrid from '../components/EmojiGrid'
import LoadMoreButton from '../components/LoadMoreButton'
import { Emoji, EmojiResponse } from '../types/emoji'

const Unicode = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchEmojis = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50',
        ...(search && { search }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const response = await fetch(`http://localhost:3001/api/emojis?${params}`)
      const data: EmojiResponse = await response.json()

      if (reset || pageNum === 1) {
        setEmojis(data.emojis)
      } else {
        setEmojis(prev => [...prev, ...data.emojis])
      }

      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching emojis:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [search, selectedCategory])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    setPage(1)
    fetchEmojis(1, true)
  }, [fetchEmojis])

  const handleSearch = (query: string) => {
    setSearch(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchEmojis(page + 1)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Code2 className="text-foreground" size={48} />
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Unicode Directory
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find emojis with their Unicode values. Click on any emoji to copy it, or click the Unicode button to copy the code.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SearchBar onSearch={handleSearch} placeholder="Search emojis..." />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <EmojiGrid emojis={emojis} loading={loading} showUnicode={true} />
      </motion.div>

      {!loading && emojis.length > 0 && (
        <LoadMoreButton
          onClick={handleLoadMore}
          loading={loadingMore}
          hasMore={hasMore}
        />
      )}
    </div>
  )
}

export default Unicode