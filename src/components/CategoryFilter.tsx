import { motion } from 'framer-motion'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const allCategories = ['all', ...categories.filter(category => category.trim() !== '')]

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-3 min-w-max px-4 py-2">
        {allCategories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category === 'all' ? 'All Categories' : category}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter