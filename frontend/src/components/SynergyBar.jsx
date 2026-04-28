import { motion } from 'framer-motion'

// 简化的羁绊计算逻辑
const calculateSynergies = (players) => {
  const synergies = []
  
  // 统计时代
  const eraCount = {}
  players.forEach(p => {
    if (p.era) {
      eraCount[p.era] = (eraCount[p.era] || 0) + 1
    }
  })
  
  Object.entries(eraCount).forEach(([era, count]) => {
    if (count >= 2) {
      synergies.push({
        name: `${era}传奇`,
        count,
        required: 2,
        color: 'from-amber-500 to-amber-700'
      })
    }
  })
  
  // 统计战队
  const teamCount = {}
  players.forEach(p => {
    if (p.team) {
      teamCount[p.team] = (teamCount[p.team] || 0) + 1
    }
  })
  
  Object.entries(teamCount).forEach(([team, count]) => {
    if (count >= 2) {
      synergies.push({
        name: `${team}`,
        count,
        required: 2,
        color: 'from-blue-500 to-blue-700'
      })
    }
  })
  
  // 全位置羁绊
  const positions = players.slice(0, 5).map(p => p.position)
  const uniquePositions = new Set(positions)
  if (uniquePositions.size === 5) {
    synergies.push({
      name: '完整阵容',
      count: 5,
      required: 5,
      color: 'from-emerald-500 to-emerald-700'
    })
  }
  
  // 评级羁绊
  const ratings = players.map(p => p.rating)
  const highRatings = ratings.filter(r => ['SSS', 'SS', 'S'].includes(r))
  if (highRatings.length >= 4) {
    synergies.push({
      name: '银河战舰',
      count: highRatings.length,
      required: 4,
      color: 'from-purple-500 to-purple-700'
    })
  }
  
  return synergies
}

export default function SynergyBar({ players }) {
  const synergies = calculateSynergies(players || [])
  
  if (synergies.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-6 p-4 glass rounded-xl">
        <div className="text-center text-text-cream/50 text-sm">
          抽卡后激活羁绊
        </div>
      </div>
    )
  }
  
  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto mt-6 p-4 glass rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold text-lg">⚔️</span>
        <h3 className="font-title text-lg text-gold">阵容羁绊</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {synergies.map((synergy, index) => (
          <motion.div
            key={synergy.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className={`
              px-3 py-1.5 rounded-lg
              bg-gradient-to-r ${synergy.color}
              border border-white/20
              text-white text-sm font-medium
              flex items-center gap-2
              shadow-lg
            `}
          >
            <span>{synergy.name}</span>
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {synergy.count}/{synergy.required}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
