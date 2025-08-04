import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Code2, Download, Copy, Check } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import EmojiGrid from '../components/EmojiGrid'
import LoadMoreButton from '../components/LoadMoreButton'
import { Emoji, EmojiResponse } from '../types/emoji'

const Developer = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [copyFormat, setCopyFormat] = useState<'json' | 'csv' | 'array'>('json')
  const [copied, setCopied] = useState(false)

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

  const generateExportData = () => {
    switch (copyFormat) {
      case 'json':
        return JSON.stringify(emojis.map(e => ({
          emoji: e.emoji,
          name: e.name,
          unicode: e.unicode,
          category: e.category,
          keywords: e.keywords.split(';').map(k => k.trim())
        })), null, 2)
      case 'csv':
        const headers = 'emoji,name,unicode,category,keywords'
        const rows = emojis.map(e => 
          `"${e.emoji}","${e.name}","${e.unicode}","${e.category}","${e.keywords}"`
        ).join('\n')
        return `${headers}\n${rows}`
      case 'array':
        return `const emojis = ${JSON.stringify(emojis.map(e => e.emoji), null, 2)}`
      default:
        return ''
    }
  }

  const copyData = async () => {
    try {
      const data = generateExportData()
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = () => {
    const data = generateExportData()
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kitmoji-export.${copyFormat === 'array' ? 'js' : copyFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Code2 className="text-yellow-300" size={48} />
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Developer Tools
          </h2>
        </div>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Access emojis with their Unicode values, export data in multiple formats, and integrate easily into your projects.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Export Data</h3>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex space-x-2">
            {(['json', 'csv', 'array'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setCopyFormat(format)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  copyFormat === format
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={downloadData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
        </div>
        <p className="text-white/70 text-sm">
          Current selection: {emojis.length} emojis
          {search && ` matching "${search}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SearchBar onSearch={handleSearch} placeholder="Search emojis for development..." />
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

export default Developer