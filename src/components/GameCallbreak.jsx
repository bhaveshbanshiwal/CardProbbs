import React, { useState, useEffect } from 'react';
import PlayingCard from './PlayingCard';
import CardSelector from './CardSelector';
import { evaluateCallbreakBid } from '../utils';

const GameCallbreak = () => {
  const [myCards, setMyCards] = useState(Array.from({ length: 13 }, () => null));
  const [selectorIdx, setSelectorIdx] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (myCards.filter(c => c !== null).length === 13) {
      const result = evaluateCallbreakBid(myCards);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [myCards]);

  const handleCardSelect = (card) => {
    if (selectorIdx === null) return;
    setMyCards(prev => {
      const next = [...prev];
      next[selectorIdx] = card;
      return next;
    });
    setSelectorIdx(null);
  };

  const clearCards = () => {
    setMyCards(Array.from({ length: 13 }, () => null));
    setAnalysis(null);
  };

  const usedCards = myCards.filter(c => c !== null);

  return (
    <div className="game-callbreak-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent-gold)' }}>Callbreak: Bid Analyzer</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Select your 13 cards. Spades are always trump. The heuristic analyzer evaluates high card winners, length, and ruffing potential to suggest your optimal bid.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {myCards.map((card, idx) => (
            <div key={idx} style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
              <PlayingCard
                card={card}
                onClick={() => setSelectorIdx(idx)}
              />
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={clearCards} style={{ background: 'rgba(255,255,255,0.1)' }}>
          Clear Hand
        </button>
      </div>

      {analysis && (
        <div className="glass-panel analysis-panel" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--accent-gold)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            Callbreak Analysis
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Bid</div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{analysis.bid}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Power Breakdown</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.9rem' }}>
                <span>Spade Winners:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{analysis.breakdown.spades}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.9rem' }}>
                <span>Off-suit Winners:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{analysis.breakdown.offsuit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.9rem' }}>
                <span>Ruffing Potential:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{analysis.breakdown.ruffing}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--accent-gold)' }}>Expected Tricks:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{analysis.breakdown.total}</span>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Confidence Score</div>
            <div style={{ fontSize: '1.5rem', color: analysis.confidence >= 80 ? '#4ade80' : analysis.confidence >= 60 ? '#facc15' : '#f87171' }}>
              {analysis.confidence}%
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${analysis.confidence}%`, height: '100%', background: analysis.confidence >= 80 ? '#4ade80' : analysis.confidence >= 60 ? '#facc15' : '#f87171', transition: 'width 1s ease-out' }}></div>
            </div>
          </div>
        </div>
      )}

      {selectorIdx !== null && (
        <CardSelector
          onSelect={handleCardSelect}
          onClose={() => setSelectorIdx(null)}
          usedCards={usedCards}
        />
      )}
    </div>
  );
};

export default GameCallbreak;
