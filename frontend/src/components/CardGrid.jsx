import { motion } from 'framer-motion'
import PlayerCard from './PlayerCard'

export default function CardGrid({ players, revealedCards = [], disabled = false }) {
  if (!players || players.length === 0) return null

  const mainPlayers = players.slice(0, 5)
  const substitute = players[5]

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main players */}
      {mainPlayers.map((player, index) => (
        <PlayerCard
          key={`${player.name}-${index}`}
          player={player}
          index={index}
          isSubstitute={false}
        />
      ))}

      {/* Substitute */}
      {substitute && (
        <div className="pt-2 border-t border-white/10">
          <div className="text-text-cream/40 text-xs mb-2 text-center">替补选手</div>
          <PlayerCard
            player={substitute}
            index={5}
            isSubstitute={true}
          />
        </div>
      )}
    </motion.div>
  )
}
