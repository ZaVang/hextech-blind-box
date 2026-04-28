import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CardGrid from './components/CardGrid'
import SynergyBar from './components/SynergyBar'
import ScoreDisplay from './components/ScoreDisplay'
import DrawButtons from './components/DrawButtons'
import MultiDrawResult from './components/MultiDrawResult'
import { drawCards } from './api/draw'

function App() {
  const [players, setPlayers] = useState([])
  const [synergies, setSynergies] = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMultiResult, setShowMultiResult] = useState(false)
  const [multiDraws, setMultiDraws] = useState([])
  const [hasDrawn, setHasDrawn] = useState(false)

  // 逐个揭示卡牌
  const revealCardsSequentially = useCallback((count) => {
    setRevealedCards([])
    let delay = 0
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, i])
      }, delay)
      delay += 400
    }
  }, [])

  // 单抽
  const handleSingleDraw = async () => {
    setIsLoading(true)
    setHasDrawn(false)
    
    try {
      const result = await drawCards(1)
      if (result.success && result.data) {
        const data = result.data
        // 从 lineup 获取选手列表
        const allPlayers = [
          ...(data.lineup?.starters || []),
          ...(data.lineup?.substitutes || [])
        ]
        setPlayers(allPlayers)
        setSynergies(data.synergies || [])
        revealCardsSequentially(allPlayers.length)
        setHasDrawn(true)
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
    setHasDrawn(false)
    
    try {
      const result = await drawCards(10)
      if (result.success && result.data && result.data.draws) {
        // 提取每个阵容的选手列表
        const draws = result.data.draws.map((draw, index) => ({
          ...draw,
          index,
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
    revealCardsSequentially(allPlayers.length)
    setHasDrawn(true)
  }

  // 关闭十连抽结果
  const handleCloseMultiResult = () => {
    setShowMultiResult(false)
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
        className="relative py-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-gold text-3xl">⚔️</span>
          <h1 className="font-title text-4xl md:text-5xl font-bold text-text-cream tracking-wider">
            海克斯盲盒
          </h1>
          <span className="text-gold text-3xl">⚔️</span>
        </div>
        <p className="font-body text-text-cream/60 text-lg tracking-widest">
          传奇选手 · 命运抽取
        </p>
        
        {/* Decorative line */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent to-gold" />
          <div className="w-2 h-2 rotate-45 bg-gold" />
          <div className="w-24 h-px bg-gradient-to-l from-transparent to-gold" />
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center px-4 pb-8">
        {/* Card area */}
        <AnimatePresence mode="wait">
          {players.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <CardGrid 
                players={players}
                revealedCards={revealedCards}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!hasDrawn && players.length === 0 && (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-8xl mb-6 opacity-30">🎴</div>
            <p className="text-text-cream/40 text-lg">
              点击下方按钮开始抽取你的传奇阵容
            </p>
          </motion.div>
        )}

        {/* Synergy bar */}
        <AnimatePresence>
          {players.length > 0 && revealedCards.length === players.length && synergies.length > 0 && (
            <motion.div 
              className="w-full max-w-2xl mx-auto mt-6 p-4 glass rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gold text-lg">⚔️</span>
                <h3 className="font-title text-lg text-gold">阵容羁绊</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {synergies.map((synergy, index) => (
                  <motion.div
                    key={synergy.tag || index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`
                      px-3 py-1.5 rounded-lg
                      bg-gradient-to-r from-amber-500 to-amber-700
                      border border-white/20
                      text-white text-sm font-medium
                      flex items-center gap-2
                      shadow-lg
                    `}
                  >
                    <span>{synergy.tag}</span>
                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {synergy.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score display */}
        <AnimatePresence>
          {players.length > 0 && revealedCards.length === players.length && (
            <ScoreDisplay players={players} />
          )}
        </AnimatePresence>

        {/* Draw buttons */}
        <DrawButtons
          onSingleDraw={handleSingleDraw}
          onMultiDraw={handleMultiDraw}
          isLoading={isLoading}
          disabled={false}
        />
      </main>

      {/* Footer */}
      <footer className="relative py-4 text-center">
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
            onClose={handleCloseMultiResult}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
