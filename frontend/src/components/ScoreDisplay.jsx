import { motion } from 'framer-motion'

const RATING_COLORS = {
  SSS: { bg: 'from-yellow-400 to-yellow-600', text: '#FFD700' },
  SS: { bg: 'from-pink-400 to-pink-600', text: '#FF69B4' },
  S: { bg: 'from-orange-400 to-orange-600', text: '#FF8C00' },
  A: { bg: 'from-purple-400 to-purple-600', text: '#9370DB' },
  B: { bg: 'from-blue-400 to-blue-600', text: '#4169E1' }
}

const calculateTeamScore = (players) => {
  if (!players || players.length === 0) return { score: 0, grade: 'B', ratingBreakdown: {} }
  
  // 计算总分
  const totalScore = players.reduce((sum, p) => sum + (p.raw_rating || 1), 0)
  const maxScore = players.length * 5 // 最高5分/人
  const percentage = (totalScore / maxScore) * 100
  
  // 根据百分比确定评级
  let grade = 'B'
  if (percentage >= 90) grade = 'SSS'
  else if (percentage >= 75) grade = 'SS'
  else if (percentage >= 60) grade = 'S'
  else if (percentage >= 40) grade = 'A'
  
  // 评级分布
  const breakdown = {}
  players.forEach(p => {
    breakdown[p.rating] = (breakdown[p.rating] || 0) + 1
  })
  
  return { score: totalScore, grade, ratingBreakdown: breakdown }
}

export default function ScoreDisplay({ players, compact = false }) {
  const { score, grade, ratingBreakdown } = calculateTeamScore(players)
  const gradeStyle = RATING_COLORS[grade] || RATING_COLORS.B
  
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold" style={{ color: gradeStyle.text }}>
          {grade}
        </div>
        <div className="text-text-cream/60">
          <span className="text-xl font-bold text-text-cream">{score}</span>
          <span className="text-sm">分</span>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div 
      className="glass rounded-xl p-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <div className="mb-4">
        <div className="text-sm text-text-cream/60 mb-1">阵容综合评分</div>
        <motion.div 
          className={`text-5xl font-bold bg-gradient-to-r ${gradeStyle.bg} bg-clip-text text-transparent`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {grade}
        </motion.div>
        <div className="text-3xl font-bold text-text-cream mt-2">
          {score} <span className="text-lg text-text-cream/60">分</span>
        </div>
      </div>
      
      {/* Rating breakdown */}
      <div className="flex justify-center gap-3 mt-4">
        {Object.entries(ratingBreakdown).map(([rating, count]) => {
          const style = RATING_COLORS[rating] || RATING_COLORS.B
          return (
            <div 
              key={rating}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${style.bg} flex items-center justify-center text-white text-sm font-bold`}
              >
                {rating}
              </div>
              <div className="text-xs text-text-cream/60 mt-1">x{count}</div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
