import { motion } from 'framer-motion'

const RATING_STYLES = {
  SSS: { bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600', text: 'text-yellow-300', stars: 3 },
  SS: { bg: 'bg-gradient-to-r from-pink-500 to-pink-600', text: 'text-pink-300', stars: 3 },
  S: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-orange-300', stars: 2 },
  A: { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'text-purple-300', stars: 2 },
  B: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-blue-300', stars: 1 }
}

export default function ScoreDisplay({ players, score }) {
  if (!score) return null

  const style = RATING_STYLES[score.grade] || RATING_STYLES.B

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-surface border border-white/10"
    >
      <div className="flex items-center gap-2">
        <span className="text-text-cream/50 text-sm">阵容评级</span>
        <div className={`${style.bg} px-4 py-1.5 rounded-lg`}>
          <span className="text-white font-bold text-xl">{score.grade}</span>
        </div>
        <span className={style.text}>{'★'.repeat(style.stars)}</span>
      </div>
      
      <div className="w-px h-8 bg-white/20" />
      
      <div className="text-text-cream/70">
        <span className="text-2xl font-bold text-text-cream">{score.total_score}</span>
        <span className="text-sm">/30</span>
      </div>
    </motion.div>
  )
}
