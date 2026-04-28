import { motion } from 'framer-motion'
import { useState } from 'react'

const RATING_COLORS = {
  SSS: { bg: 'bg-yellow-500/20', border: 'border-yellow-400', text: 'text-yellow-400' },
  SS: { bg: 'bg-pink-500/20', border: 'border-pink-400', text: 'text-pink-400' },
  S: { bg: 'bg-orange-500/20', border: 'border-orange-400', text: 'text-orange-400' },
  A: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-400' },
  B: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-400' }
}

export default function MultiDrawResult({ draws, onSelect, onClose }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const maxScore = Math.max(...draws.map(d => d.score.total_score))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-dark border border-gold/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-title font-bold text-gold">十连抽结果</h2>
            <p className="text-text-cream/50 text-sm mt-1">点击选择要保留的阵容</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-cream/50 hover:text-text-cream text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Draw results list */}
        <div className="space-y-3">
          {draws.map((draw, index) => {
            const isHighest = draw.score.total_score === maxScore
            const isExpanded = expandedIndex === index
            const players = [
              ...(draw.lineup?.starters || []),
              ...(draw.lineup?.substitutes || [])
            ]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative rounded-xl border transition-all cursor-pointer
                  ${isHighest ? 'border-yellow-400 bg-yellow-500/10' : 'border-white/10 bg-surface/50'}
                  hover:border-gold/50
                `}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                {/* Summary row */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {isHighest && <span className="text-yellow-400">👑</span>}
                    <span className="text-text-cream/60 text-sm">
                      第 {draw.index || index + 1} 抽
                    </span>
                    <div className="flex gap-1">
                      {players.slice(0, 5).map((p, i) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 text-xs rounded ${
                            RATING_COLORS[p.rating]?.bg || 'bg-gray-500/20'
                          } ${RATING_COLORS[p.rating]?.text || 'text-gray-400'}`}
                        >
                          {p.name.slice(0, 4)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Synergies preview */}
                    <div className="text-xs text-gold/70">
                      {(draw.synergies || []).slice(0, 2).map(s => s.tag).join(' · ')}
                      {(draw.synergies || []).length > 2 && '...'}
                    </div>
                    
                    {/* Score */}
                    <div className={`text-lg font-bold ${isHighest ? 'text-yellow-400' : 'text-text-cream'}`}>
                      {draw.score.total_score}/30
                    </div>
                    
                    {/* Rating badge */}
                    <div className={`
                      px-3 py-1 rounded-lg font-bold text-sm
                      ${RATING_COLORS[draw.score.grade]?.bg || 'bg-gray-500/20'}
                      ${RATING_COLORS[draw.score.grade]?.text || 'text-gray-400'}
                    `}>
                      {draw.score.grade}
                    </div>

                    {/* Expand indicator */}
                    <span className="text-text-cream/30">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-white/10 p-4 space-y-2"
                  >
                    {players.map((player, pIndex) => (
                      <div
                        key={pIndex}
                        className="flex items-center justify-between p-2 rounded-lg bg-bg-dark/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-text-cream/50 text-xs w-10">{player.position}</span>
                          <span className={`font-medium ${RATING_COLORS[player.rating]?.text || 'text-gray-400'}`}>
                            {player.name}
                          </span>
                          <span className="text-text-cream/40 text-sm">{player.team}</span>
                          <span className="text-text-cream/30 text-xs">{player.era}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {player.tags?.slice(0, 3).map((tag, t) => (
                            <span key={t} className="px-2 py-0.5 text-[10px] rounded-full bg-gold/10 text-gold/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Synergies */}
                    {draw.synergies?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {draw.synergies.map((s, i) => (
                          <span key={i} className="px-3 py-1 text-sm rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {s.tag} x{s.count}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Select button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(draw)
                      }}
                      className="w-full mt-3 py-2 rounded-lg bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors font-medium"
                    >
                      选择此阵容
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
