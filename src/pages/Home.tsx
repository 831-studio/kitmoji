import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import EmojiGrid from '../components/EmojiGrid'
import LoadMoreButton from '../components/LoadMoreButton'
import { Emoji, EmojiResponse } from '../types/emoji'

const Home = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [popularEmojis, setPopularEmojis] = useState<Emoji[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [popularLoading, setPopularLoading] = useState(true)
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
        limit: '60',
        ...(search && { search }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const response = await fetch(`/api/emojis?${params}`)
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
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchPopularEmojis = useCallback(async () => {
    try {
      setPopularLoading(true)
      const response = await fetch('/api/emojis/popular')
      const data = await response.json()
      setPopularEmojis(data.emojis || [])
    } catch (error) {
      console.error('Error fetching popular emojis:', error)
    } finally {
      setPopularLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchPopularEmojis()
  }, [fetchCategories, fetchPopularEmojis])

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
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-semibold text-foreground text-left">Popular Emojis</h3>
        <EmojiGrid emojis={popularEmojis} loading={popularLoading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-semibold text-foreground text-left">All Emojis</h3>
        <EmojiGrid emojis={emojis} loading={loading} />
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

export default Home