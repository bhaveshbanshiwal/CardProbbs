import React, { useState, useEffect } from 'react';
import PlayingCard from './PlayingCard';
import CardSelector from './CardSelector';
import { evaluate250Bid, getSuitSymbol } from '../utils';

const Game250 = () => {
  const [myCards, setMyCards] = useState(Array.from({ length: 8 }, () => null));
  const [selectorIdx, setSelectorIdx] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (myCards.filter(c => c !== null).length === 8) {
      const result = evaluate250Bid(myCards);
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
    setMyCards(Array.from({ length: 8 }, () => null));
    setAnalysis(null);
  };

  const usedCards = myCards.filter(c => c !== null);

  return (
    <div className="game-250-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent-gold)' }}>250 Game: Bid Analyzer</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Select the exactly 8 cards in your hand. The analyzer will mathematically evaluate your trick-taking power, guaranteed points, and ideal trump suit to recommend the perfect bid.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {myCards.map((card, idx) => (
            <PlayingCard
              key={idx}
              card={card}
              onClick={() => setSelectorIdx(idx)}
            />
          ))}
        </div>

        <button className="btn-primary" onClick={clearCards} style={{ background: 'rgba(255,255,255,0.1)' }}>
          Clear Hand
        </button>
      </div>

      {analysis && (
        <div className="glass-panel analysis-panel" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--accent-gold)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            Mathematical Analysis
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Points In Hand</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analysis.pointsInHand}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Trump</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analysis.trump === 'hearts' || analysis.trump === 'diamonds' ? 'var(--card-red)' : 'white' }}>
                {getSuitSymbol(analysis.trump)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Bid</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{analysis.bid}</div>
            </div>
          </div>

          {analysis.friends && analysis.friends.length === 2 && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Friends to Call</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: analysis.friends[0].suit === 'hearts' || analysis.friends[0].suit === 'diamonds' ? 'var(--card-red)' : 'white' }}>
                  {analysis.friends[0].rank} {getSuitSymbol(analysis.friends[0].suit)}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>&</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: analysis.friends[1].suit === 'hearts' || analysis.friends[1].suit === 'diamonds' ? 'var(--card-red)' : 'white' }}>
                  {analysis.friends[1].rank} {getSuitSymbol(analysis.friends[1].suit)}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                These are the highest value cards not currently in your hand. Calling them minimizes the risk of overlapping partners and maximizes guaranteed points!
              </p>
            </div>
          )}

          <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Win Probability</div>
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

export default Game250;
