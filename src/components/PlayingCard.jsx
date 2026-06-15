import React from 'react';
import { getSuitSymbol, getRankDisplay } from '../utils';

const PlayingCard = ({ card, onClick, className = '' }) => {
  if (!card) {
    return (
      <div className={`playing-card-wrapper ${className}`} onClick={onClick}>
        <div className="card-empty">
          <span>+</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`playing-card-wrapper flipped ${className}`} onClick={onClick}>
      <div className="playing-card-inner">
        <div className="card-face front">
          <div className="card-top">
            <span className={`card-value ${isRed ? 'suit-hearts' : 'suit-clubs'}`}>
              {getRankDisplay(card.rank)}
            </span>
            <span className={`card-suit suit-${card.suit}`}>
              {getSuitSymbol(card.suit)}
            </span>
          </div>
          <div className="card-bottom">
            <span className={`card-value ${isRed ? 'suit-hearts' : 'suit-clubs'}`}>
              {getRankDisplay(card.rank)}
            </span>
            <span className={`card-suit suit-${card.suit}`}>
              {getSuitSymbol(card.suit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayingCard;
