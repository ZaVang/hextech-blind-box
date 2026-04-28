import { motion } from 'framer-motion'
import { useState } from 'react'

const RATING_COLORS = {
  SSS: { bg: 'from-yellow-400 to-yellow-600', text: '#FFD700', border: '#FFD700' },
  SS: { bg: 'from-pink-400 to-pink-600', text: '#FF69B4', border: '#FF69B4' },
  S: { bg: 'from-orange-400 to-orange-600', text: '#FF8C00', border: '#FF8C00' },
  A: { bg: 'from-purple-400 to-purple-600', text: '#9370DB', border: '#9370DB' },
  B: { bg: 'from-blue-400 to-blue-600', text: '#4169E1', border: '#4169E1' }
}

const calculateTeamScore = (players) => {
  if (!players || players.length === 0) return { score: 0, grade: 'B' }
  const totalScore = players.reduce((sum, p) => sum + (p.raw_rating || 1), 0)
  const maxScore = players.length * 5
  const percentage = (totalScore / maxScore) * 100
  
  let grade = 'B'
  if (percentage >= 90) grade = 'SSS'
  else if (percentage >= 75) grade = 'SS'
  else if (percentage >= 60) grade = 'S'
  else if (percentage >= 40) grade = 'A'
  
  return { score: totalScore, grade }
}

export default function MultiDrawResult({ draws, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  
  if (!draws || draws.length === 0) return null
  
  // 计算每个阵容的分数（使用后端返回的分数）
  const scoredDraws = draws.map((draw, idx) => {
    // 优先使用后端计算的分数
    const scoreData = draw.score || {}
    const score = scoreData.total_score || calculateTeamScore(draw.players).score
    const grade = scoreData.grade || calculateTeamScore(draw.players).grade
    return { ...draw, score, grade }
  })
  
  // 找出最高分
  const maxScore = Math.max(...scoredDraws.map(d => d.score))
  const bestIndices = scoredDraws.filter(d => d.score === maxScore).map(d => d.index)
  
  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(draws[selectedIndex])
    } else {
      // 如果没有选择，默认选择最高分的第一个
      const bestDraw = scoredDraws.find(d => d.score === maxScore)
      if (bestDraw) {
        onSelect(draws[bestDraw.index])
      }
    }
  }
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-title text-2xl text-gold">🌟 十连抽结果</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface border border-border-dark text-text-cream hover:bg-border-dark transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Draws grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scoredDraws.map((draw, idx) => {
            const gradeStyle = RATING_COLORS[draw.grade] || RATING_COLORS.B
            const isBest = bestIndices.includes(draw.index)
            const isSelected = selectedIndex === draw.index
            const players = draw.players || []
            
            return (
              <motion.div
                key={draw.index}
                className={`
                  relative p-4 rounded-xl cursor-pointer
                  bg-surface border-2 transition-all
                  ${isSelected ? 'border-gold scale-105' : 'border-border-dark hover:border-gold/50'}
                  ${isBest && !isSelected ? 'ring-2 ring-yellow-400/50' : ''}
                `}
                onClick={() => setSelectedIndex(draw.index)}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Best badge */}
                {isBest && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500 rounded-full text-xs font-bold text-black">
                    ⭐ 最高分
                  </div>
                )}
                
                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold rounded-full text-xs font-bold text-bg-dark">
                    ✓ 已选择
                  </div>
                )}
                
                {/* Title */}
                <div className="text-center mb-3">
                  <div className={`text-xl font-bold ${isSelected ? 'text-gold' : ''}`}>
                    阵容 {draw.index + 1}
                  </div>
                </div>
                
                {/* Players summary */}
                <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                  {players.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-text-cream/60 w-8">{p.position}</span>
                      <span className="text-text-cream truncate flex-1">{p.name}</span>
                      <span 
                        className="font-bold"
                        style={{ color: RATING_COLORS[p.rating]?.text }}
                      >
                        {p.rating}
                      </span>
                    </div>
                  ))}
                  {players.length > 5 && (
                    <div className="text-xs text-text-cream/40 text-center">
                      +{players.length - 5} 替补
                    </div>
                  )}
                </div>
                
                {/* Score */}
                <div 
                  className={`
                    text-center py-2 rounded-lg
                    bg-gradient-to-r ${gradeStyle.bg}
                  `}
                >
                  <div className="text-sm text-white/80">综合评分</div>
                  <div className="text-lg font-bold text-white">
                    {draw.score} <span className="text-sm">{draw.grade}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-border-dark text-text-cream hover:bg-surface transition-colors"
          >
            返回
          </button>
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl btn-gold text-lg"
          >
            {selectedIndex !== null ? '确认保留此阵容' : '自动选择最高分阵容'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
