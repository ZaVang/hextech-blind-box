import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CardGrid from './components/CardGrid'
import DrawButtons from './components/DrawButtons'
import MultiDrawResult from './components/MultiDrawResult'
import ScoreDisplay from './components/ScoreDisplay'
import { drawCards } from './api/draw'

function App() {
  const [players, setPlayers] = useState([])
  const [synergies, setSynergies] = useState([])
  const [score, setScore] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showMultiResult, setShowMultiResult] = useState(false)
  const [multiDraws, setMultiDraws] = useState([])

  // 单抽
  const handleSingleDraw = async () => {
    setIsLoading(true)
    try {
      const result = await drawCards(1)
      if (result.success && result.data) {
        const data = result.data
        const allPlayers = [
          ...(data.lineup?.starters || []),
          ...(data.lineup?.substitutes || [])
        ]
        setPlayers(allPlayers)
        setSynergies(data.synergies || [])
        setScore(data.score || null)
      }
    } catch (error) {
      console.error('抽卡失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 十连抽
  const handleMultiDraw = async () => {
    setIsLoading(true)
    try {
      const result = await drawCards(10)
      if (result.success && result.data && result.data.draws) {
        const draws = result.data.draws.map((draw, index) => ({
          ...draw,
          index: index + 1,
          players: [
            ...(draw.lineup?.starters || []),
            ...(draw.lineup?.substitutes || [])
          ]
        }))
        setMultiDraws(draws)
        setShowMultiResult(true)
      }
    } catch (error) {
      console.error('十连抽失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 选择十连抽中的一个阵容
  const handleSelectDraw = (selectedDraw) => {
    setShowMultiResult(false)
    const allPlayers = selectedDraw.players || []
    setPlayers(allPlayers)
    setSynergies(selectedDraw.synergies || [])
    setScore(selectedDraw.score || null)
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        className="relative py-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-gold text-2xl">⚔️</span>
          <h1 className="font-title text-3xl md:text-4xl font-bold text-text-cream tracking-wider">
            海克斯盲盒 · 传奇选手
          </h1>
          <span className="text-gold text-2xl">⚔️</span>
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold" />
          <span className="text-text-cream/50 text-sm">命运抽取</span>
          <div className="w-1.5 h-1.5 rotate-45 bg-gold" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold" />
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center px-4 pb-4">
        {/* Draw buttons - top */}
        <div className="mb-4">
          <DrawButtons
            onSingleDraw={handleSingleDraw}
            onMultiDraw={handleMultiDraw}
            isLoading={isLoading}
            disabled={false}
          />
        </div>

        {/* Results area */}
        <AnimatePresence mode="wait">
          {players.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl"
            >
              {/* Synergies */}
              {synergies.length > 0 && (
                <motion.div 
                  className="mb-4 p-3 rounded-xl bg-surface/50 border border-gold/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold">⚔️</span>
                    <span className="text-gold font-medium">阵容羁绊</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {synergies.map((synergy, index) => (
                      <motion.span
                        key={synergy.tag || index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 text-white text-sm font-medium shadow-lg"
                      >
                        {synergy.tag} x{synergy.count}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Player cards */}
              <CardGrid players={players} />

              {/* Score */}
              {score && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-center"
                >
                  <ScoreDisplay players={players} score={score} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {players.length === 0 && !isLoading && (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-7xl mb-4 opacity-30">🎴</div>
            <p className="text-text-cream/40 text-lg">
              点击上方按钮开始抽取你的传奇阵容
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative py-3 text-center">
        <p className="text-text-cream/30 text-sm">
          基于海克斯科技的神秘力量 ⚡
        </p>
      </footer>

      {/* Multi-draw result modal */}
      <AnimatePresence>
        {showMultiResult && (
          <MultiDrawResult
            draws={multiDraws}
            onSelect={handleSelectDraw}
            onClose={() => setShowMultiResult(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
