import { motion } from 'framer-motion'

const RATING_COLORS = {
  SSS: { bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-500/30' },
  SS: { bg: 'bg-gradient-to-r from-pink-500/20 to-pink-600/10', border: 'border-pink-400', text: 'text-pink-400', badge: 'bg-pink-500/30' },
  S: { bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/10', border: 'border-orange-400', text: 'text-orange-400', badge: 'bg-orange-500/30' },
  A: { bg: 'bg-gradient-to-r from-purple-500/20 to-purple-600/10', border: 'border-purple-400', text: 'text-purple-400', badge: 'bg-purple-500/30' },
  B: { bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/10', border: 'border-blue-400', text: 'text-blue-400', badge: 'bg-blue-500/30' }
}

const POSITION_LABELS = {
  '上单': { color: 'bg-emerald-500', icon: '🛡️' },
  '打野': { color: 'bg-amber-500', icon: '🌲' },
  '中单': { color: 'bg-violet-500', icon: '⭐' },
  '下路': { color: 'bg-rose-500', icon: '🏹' },
  '辅助': { color: 'bg-cyan-500', icon: '💚' }
}

export default function PlayerCard({ player, index, isSubstitute = false }) {
  const style = RATING_COLORS[player.rating] || RATING_COLORS.B
  const pos = POSITION_LABELS[player.position] || { color: 'bg-gray-500', icon: '👤' }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl border-l-4
        ${style.bg} ${style.border}
        backdrop-blur-sm
      `}
    >
      {/* Position Badge */}
      <div className={`${pos.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0`}>
        {pos.icon}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-text-cream/60 text-xs">{player.position}</span>
          {isSubstitute && (
            <span className="px-1.5 py-0.5 bg-gold/20 text-gold text-[10px] rounded">
              替补
            </span>
          )}
        </div>
        <div className={`text-xl font-bold ${style.text} truncate`}>
          {player.name}
        </div>
        <div className="text-text-cream/50 text-sm">
          {player.team} · {player.era}
        </div>
      </div>

      {/* Rating */}
      <div className={`${style.badge} px-3 py-1.5 rounded-lg shrink-0`}>
        <span className={`text-lg font-bold ${style.text}`}>{player.rating}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
        {(player.tags || []).slice(0, 3).map((tag, i) => (
          <span 
            key={i}
            className="px-2 py-0.5 text-[11px] rounded-full bg-surface border border-gold/20 text-gold/80 whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        {(player.tags || []).length > 3 && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-surface border border-white/10 text-white/40">
            +{player.tags.length - 3}
          </span>
        )}
      </div>
    </motion.div>
  )
}
