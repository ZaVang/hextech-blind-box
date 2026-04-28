import { motion } from 'framer-motion'

export default function DrawButtons({ onSingleDraw, onMultiDraw, isLoading, disabled }) {
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Single draw button */}
      <motion.button
        onClick={onSingleDraw}
        disabled={isLoading || disabled}
        className={`
          relative px-8 py-4 rounded-xl font-body font-semibold text-lg
          btn-gold
          ${(isLoading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={!isLoading && !disabled ? { scale: 1.05 } : {}}
        whileTap={!isLoading && !disabled ? { scale: 0.95 } : {}}
      >
        <span className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          单抽
        </span>
        {isLoading && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-bg-dark/80 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.button>

      {/* Multi draw button */}
      <motion.button
        onClick={onMultiDraw}
        disabled={isLoading || disabled}
        className={`
          relative px-8 py-4 rounded-xl font-body font-semibold text-lg
          bg-gradient-to-r from-purple-600 to-purple-800 
          text-white
          shadow-lg
          transition-all duration-300
          ${(isLoading || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-purple-700'}
        `}
        whileHover={!isLoading && !disabled ? { scale: 1.05 } : {}}
        whileTap={!isLoading && !disabled ? { scale: 0.95 } : {}}
      >
        <span className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          十连抽
        </span>
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-rose-500 rounded-full text-xs font-bold text-white">
          推荐
        </div>
        {isLoading && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-bg-dark/80 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  )
}
