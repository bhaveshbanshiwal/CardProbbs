import React, { useState, useEffect } from 'react';
import { Settings, RefreshCcw, Info } from 'lucide-react';
import PokerTable from './components/PokerTable';
import Game250 from './components/Game250';
import GameCallbreak from './components/GameCallbreak';
import CardSelector from './components/CardSelector';
import { runMonteCarloSimulation } from './utils';

function App() {
  const [gameMode, setGameMode] = useState('poker'); // 'poker', '250', or 'callbreak'
  const [playerCount, setPlayerCount] = useState(2);
  
  // Poker State
  const [boardCards, setBoardCards] = useState([null, null, null, null, null]);
  // Player cards: array of arrays. e.g. [[card1, card2], [card1, card2]]
  const [playerCards, setPlayerCards] = useState(
    Array.from({ length: 10 }, () => [null, null])
  );
  const [equities, setEquities] = useState({});
  const [handStats, setHandStats] = useState(null);
  const [opStats, setOpStats] = useState(null);
  
  // Modal State
  const [selectorTarget, setSelectorTarget] = useState(null);

  // Recalculate equities whenever cards change
  useEffect(() => {
    if (gameMode === 'poker') {
      const heroHand = playerCards[0];
      if (heroHand[0] && heroHand[1]) {
        // Run monte carlo against (playerCount - 1) random opponents
        const result = runMonteCarloSimulation(heroHand, boardCards, playerCount - 1, 200);
        if (result) {
          setEquities({ 0: result.equity });
          setHandStats(result.stats);
          setOpStats(result.opStats);
        }
      } else {
        setEquities({});
        setHandStats(null);
        setOpStats(null);
      }
    }
  }, [playerCards, boardCards, playerCount, gameMode]);

  const handleModeSwitch = (mode) => {
    setGameMode(mode);
  };

  const handlePlayerCountChange = (delta) => {
    setPlayerCount(prev => {
      const next = prev + delta;
      return next >= 2 && next <= 10 ? next : prev;
    });
  };

  const resetTable = () => {
    if (window.confirm("Are you sure you want to clear the table?")) {
      setBoardCards([null, null, null, null, null]);
      setPlayerCards(Array.from({ length: 10 }, () => [null, null]));
      setEquities({});
      setHandStats(null);
      setOpStats(null);
    }
  };

  const openSelector = (type, playerIdx, cardIdx = null) => {
    setSelectorTarget({ type, playerIdx, cardIdx });
  };

  const handleCardSelect = (card) => {
    if (!selectorTarget) return;

    const { type, playerIdx, cardIdx } = selectorTarget;

    if (type === 'board') {
      setBoardCards(prev => {
        const next = [...prev];
        next[playerIdx] = card;
        return next;
      });
    } else if (type === 'player') {
      // For this probability tool, only allow selecting Player 1's cards
      if (playerIdx !== 0) {
        setSelectorTarget(null);
        return;
      }
      setPlayerCards(prev => {
        const next = [...prev];
        next[playerIdx] = [...next[playerIdx]]; // Deep copy
        next[playerIdx][cardIdx] = card;
        return next;
      });
    }

    setSelectorTarget(null);
  };

  // Compute all currently used cards to pass to the selector
  const usedCards = [
    ...boardCards.filter(c => c !== null),
    ...playerCards.flat().filter(c => c !== null)
  ];

  return (
    <div className="app-container">
      <header className="glass-panel">
        <div>
          <h1 className="title-glow" style={{ margin: 0 }}>CardProbbs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Advanced Probability Calculator</p>
        </div>
        
        <div className="mode-switch">
          <button 
            className={`mode-btn ${gameMode === 'poker' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('poker')}
          >
            Texas Hold'em
          </button>
          <button 
            className={`mode-btn ${gameMode === '250' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('250')}
          >
            250 Game
          </button>
          <button 
            className={`mode-btn ${gameMode === 'callbreak' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('callbreak')}
          >
            Callbreak
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        
        {/* Left Sidebar for Statistics */}
        {gameMode === 'poker' && handStats && opStats && (
          <aside className="glass-panel sidebar" style={{ overflowY: 'auto', minWidth: '450px', flexShrink: 0 }}>
            <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', color: 'var(--accent-gold)' }}>
              Statistics
            </h2>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div className="control-group" style={{ flex: 1 }}>
                <label style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>Hero</label>
                <div className="points-list">
                  {Object.entries(handStats).map(([rank, pct]) => (
                    <div key={`hero-${rank}`} className="point-item" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                      <span>{rank}</span>
                      <span className="score" style={{ color: pct > 10 ? '#4ade80' : 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="control-group" style={{ flex: 1 }}>
                <label style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>Opponents</label>
                <div className="points-list">
                  {Object.entries(opStats).map(([rank, pct]) => (
                    <div key={`op-${rank}`} className="point-item" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                      <span>{rank}</span>
                      <span className="score" style={{ color: pct > 10 ? '#f87171' : 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
              Opponents column shows the chance that AT LEAST ONE opponent gets this hand.
            </p>
          </aside>
        )}

        {/* Main Play Area */}
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: '800px' }}>
          {gameMode === 'poker' && (
            <PokerTable 
              playerCount={playerCount}
              playerCards={playerCards}
              boardCards={boardCards}
              equities={equities}
              onCardClick={openSelector}
            />
          )}
          {gameMode === '250' && <Game250 />}
          {gameMode === 'callbreak' && <GameCallbreak />}
        </div>

        {/* Right Sidebar for Controls */}
        <aside className="glass-panel sidebar" style={{ overflowY: 'auto', minWidth: '260px', flexShrink: 0 }}>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <Settings size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Controls
          </h2>

          {gameMode === 'poker' && (
            <div className="control-group" style={{ marginTop: '1rem' }}>
              <label>Number of Players</label>
              <div className="player-count-ctrl">
                <button onClick={() => handlePlayerCountChange(-1)} disabled={playerCount <= 2}>-</button>
                <span>{playerCount} Players</span>
                <button onClick={() => handlePlayerCountChange(1)} disabled={playerCount >= 10}>+</button>
              </div>
            </div>
          )}

          <div className="control-group" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button className="btn-primary" onClick={resetTable}>
              <RefreshCcw size={18} />
              Reset Board
            </button>
          </div>
        </aside>
      </main>

      {selectorTarget && (
        <CardSelector 
          onSelect={handleCardSelect}
          onClose={() => setSelectorTarget(null)}
          usedCards={usedCards}
        />
      )}
    </div>
  );
}

export default App;
