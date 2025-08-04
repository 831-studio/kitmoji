import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Home from './pages/Home'
import Unicode from './pages/Unicode'

function App() {
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
        </Routes>
      </motion.main>
    </div>
  )
}

export default App