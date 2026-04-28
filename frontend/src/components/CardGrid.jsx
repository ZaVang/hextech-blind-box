import { motion } from 'framer-motion'
import Card from './Card'

export default function CardGrid({ players, onCardClick, revealedCards = [], disabled = false }) {
  if (!players || players.length === 0) return null

  const mainPlayers = players.slice(0, 5)
  const substitute = players[5]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main team - 5 players */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {mainPlayers.map((player, index) => (
          <Card
            key={`${player.name}-${index}`}
            player={player}
            index={index}
            isFlipped={revealedCards.includes(index)}
            onClick={() => onCardClick && onCardClick(index)}
            disabled={disabled}
          />
        ))}
      </motion.div>

      {/* Substitute player */}
      {substitute && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative"
        >
          <Card
            player={substitute}
            index={5}
            isSubstitute={true}
            isFlipped={revealedCards.includes(5)}
            onClick={() => onCardClick && onCardClick(5)}
            disabled={disabled}
          />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-surface border border-gold rounded-full text-xs text-gold">
            替补选手
          </div>
        </motion.div>
      )}
    </div>
  )
}
