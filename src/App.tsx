import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import Home from './pages/Home'
import Unicode from './pages/Unicode'
import EmojiDetail from './pages/EmojiDetail'
import CategoryPage from './pages/CategoryPage'
import AllEmojis from './pages/AllEmojis'
import PopularEmojis from './pages/PopularEmojis'
import NewEmojis from './pages/NewEmojis'
import { useCanonicalUrl } from './hooks/useCanonicalUrl'

function App() {
  // Set up canonical URLs for all pages
  useCanonicalUrl();

  return (
    <div className="min-h-screen">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pt-12 pb-8 max-w-7xl"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unicode" element={<Unicode />} />
          <Route path="/emoji/:emojiName" element={<EmojiDetail />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/all-emojis" element={<AllEmojis />} />
          <Route path="/popular-emojis" element={<PopularEmojis />} />
          <Route path="/new-emojis" element={<NewEmojis />} />
        </Routes>
      </motion.main>
      <Analytics />
    </div>
  )
}

export default App