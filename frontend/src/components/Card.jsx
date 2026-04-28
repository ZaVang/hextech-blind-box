import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const RATING_COLORS = {
  SSS: { bg: 'from-yellow-400/20 to-yellow-600/20', border: '#FFD700', text: '#FFD700' },
  SS: { bg: 'from-pink-400/20 to-pink-600/20', border: '#FF69B4', text: '#FF69B4' },
  S: { bg: 'from-orange-400/20 to-orange-600/20', border: '#FF8C00', text: '#FF8C00' },
  A: { bg: 'from-purple-400/20 to-purple-600/20', border: '#9370DB', text: '#9370DB' },
  B: { bg: 'from-blue-400/20 to-blue-600/20', border: '#4169E1', text: '#4169E1' }
}

const POSITION_COLORS = {
  '上单': 'bg-emerald-600',
  '打野': 'bg-amber-600',
  '中单': 'bg-violet-600',
  '下路': 'bg-rose-600',
  '辅助': 'bg-cyan-600'
}

export default function Card({ player, index = 0, isSubstitute = false, onClick, isFlipped, disabled = false }) {
  const [flipped, setFlipped] = useState(false)
  const ratingStyle = RATING_COLORS[player.rating] || RATING_COLORS.B

  // 监听 isFlipped prop 变化
  useEffect(() => {
    if (isFlipped !== undefined) {
      setFlipped(isFlipped)
    }
  }, [isFlipped])

  const handleClick = () => {
    if (disabled) return
    setFlipped(!flipped)
    if (onClick) onClick(player)
  }

  return (
    <motion.div
      className="card-container w-[160px] h-[220px] cursor-pointer"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }}
      onClick={handleClick}
      whileHover={!flipped && !disabled ? { scale: 1.05 } : {}}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="card-inner w-full h-full"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out'
        }}
      >
        {/* Card Back */}
        <div 
          className="card-back absolute w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-surface border border-gold/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 shimmer-gold opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-6xl mb-2 opacity-80">⚔️</div>
            <div className="text-gold font-title text-lg font-semibold tracking-wider">
              HEXTECH
            </div>
            {isSubstitute && (
              <div className="mt-2 px-2 py-1 bg-surface border border-gold rounded text-xs text-gold">
                替补
              </div>
            )}
          </div>
          
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold opacity-60" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold opacity-60" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold opacity-60" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold opacity-60" />
        </div>

        {/* Card Front */}
        <div 
          className="card-front absolute w-full h-full p-3 flex flex-col rounded-xl bg-surface border-2"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: ratingStyle.border,
            boxShadow: `0 0 20px ${ratingStyle.border}40, inset 0 0 30px ${ratingStyle.border}20`
          }}
        >
          {/* Header with rating */}
          <div className="flex justify-between items-start mb-2">
            <div 
              className="px-2 py-0.5 rounded text-sm font-bold"
              style={{ 
                backgroundColor: `${ratingStyle.border}30`,
                color: ratingStyle.text,
                textShadow: `0 0 10px ${ratingStyle.text}`
              }}
            >
              {player.rating}
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-medium text-white ${POSITION_COLORS[player.position] || 'bg-gray-600'}`}>
              {player.position}
            </div>
          </div>

          {/* Player info */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: ratingStyle.text }}
            >
              {player.name}
            </div>
            <div className="text-sm text-text-cream/80 mb-1">
              {player.team}
            </div>
            <div className="text-xs text-text-cream/60 italic">
              {player.era}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 justify-center mt-auto">
            {(player.tags || []).slice(0, 3).map((tag, i) => (
              <span 
                key={i}
                className="px-1.5 py-0.5 text-[10px] rounded bg-gold/20 text-gold border border-gold/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
