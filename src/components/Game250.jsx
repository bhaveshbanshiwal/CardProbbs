import React, { useState, useEffect } from 'react';
import PlayingCard from './PlayingCard';
import CardSelector from './CardSelector';
import { evaluate250Bid, getSuitSymbol, SUITS, RANKS } from '../utils';

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

  const randomizeHand = () => {
    const deck = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        deck.push({ suit, rank });
      });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setMyCards(deck.slice(0, 8));
  };

  const addRandomCard = () => {
    const emptyIdx = myCards.findIndex(c => c === null);
    if (emptyIdx === -1) return; // Hand is full

    const deck = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        deck.push({ suit, rank });
      });
    });

    const usedCardStrs = myCards.filter(c => c !== null).map(c => `${c.rank}${c.suit}`);
    const availableCards = deck.filter(c => !usedCardStrs.includes(`${c.rank}${c.suit}`));

    if (availableCards.length === 0) return;

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

    setMyCards(prev => {
      const next = [...prev];
      next[emptyIdx] = randomCard;
      return next;
    });
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn-primary" onClick={addRandomCard} style={{ background: 'var(--accent-gold)', color: 'black' }}>
            + Random Card
          </button>
          <button className="btn-primary" onClick={randomizeHand} style={{ background: 'var(--accent-gold)', color: 'black' }}>
            Randomize Hand
          </button>
          <button className="btn-primary" onClick={clearCards} style={{ background: 'rgba(255,255,255,0.1)' }}>
            Clear Hand
          </button>
        </div>
      </div>

      {analysis && (
        <div className="glass-panel analysis-panel" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--accent-gold)', maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            Hand Analysis
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', textAlign: 'center' }}>
            
            <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Points In Hand</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{analysis.pointsInHand}</div>
            </div>

            <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Trump</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {analysis.trump} <span style={{ color: ['hearts','diamonds'].includes(analysis.trump) ? '#ef4444' : 'white' }}>{getSuitSymbol(analysis.trump)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-gold)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Bid</div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{analysis.bid}</div>
            </div>

          </div>

          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ textAlign: 'center', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem' }}>Recommended Friends to Call</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {analysis.friends.map((f, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  {f.rank} of {f.suit} <span style={{ color: ['hearts','diamonds'].includes(f.suit) ? '#ef4444' : 'white' }}>{getSuitSymbol(f.suit)}</span>
                </div>
              ))}
              {analysis.friends.length === 0 && <span style={{ color: 'var(--text-muted)' }}>None needed!</span>}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Confidence Score</div>
              <div style={{ fontSize: '2rem', color: analysis.confidence >= 80 ? '#4ade80' : analysis.confidence >= 60 ? '#facc15' : '#f87171' }}>
                {analysis.confidence}%
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${analysis.confidence}%`, height: '100%', background: analysis.confidence >= 80 ? '#4ade80' : analysis.confidence >= 60 ? '#facc15' : '#f87171', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>

            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Bid Chances</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.bidProbabilities.map((b) => (
                  <div key={b.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: b.level === analysis.bid ? 'bold' : 'normal', color: b.level === analysis.bid ? 'var(--accent-gold)' : 'white' }}>
                      Bid {b.level}
                    </span>
                    <span style={{ fontSize: '1rem', color: b.chance >= 80 ? '#4ade80' : b.chance >= 50 ? '#facc15' : '#f87171' }}>
                      {b.chance}%
                    </span>
                  </div>
                ))}
              </div>
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
