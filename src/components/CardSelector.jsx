import React, { useState } from 'react';
import { SUITS, RANKS, getSuitSymbol } from '../utils';

const CardSelector = ({ onSelect, onClose, usedCards = [] }) => {
  const [selectedSuit, setSelectedSuit] = useState('spades');

  const handleRankClick = (rank) => {
    onSelect({ suit: selectedSuit, rank });
  };

  const isCardUsed = (suit, rank) => {
    return usedCards.some(card => card && card.suit === suit && card.rank === rank);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel card-selector" onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          Select Card
        </h3>
        
        <div className="suit-row">
          {SUITS.map(suit => (
            <button
              key={suit}
              className={`suit-btn ${selectedSuit === suit ? 'active' : ''}`}
              onClick={() => setSelectedSuit(suit)}
              style={{
                color: suit === 'hearts' || suit === 'diamonds' ? 'var(--accent-red)' : '#000'
              }}
            >
              {getSuitSymbol(suit)}
            </button>
          ))}
        </div>

        <div className="selector-grid">
          {RANKS.map(rank => {
            const used = isCardUsed(selectedSuit, rank);
            return (
              <button
                key={rank}
                className="rank-btn"
                onClick={() => handleRankClick(rank)}
                disabled={used}
                style={{ opacity: used ? 0.3 : 1 }}
              >
                {rank === 'T' ? '10' : rank}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="btn-danger" onClick={onClose} style={{ width: '100%' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSelector;
