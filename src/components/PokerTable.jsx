import React from 'react';
import PlayingCard from './PlayingCard';

const PokerTable = ({ 
  playerCount, 
  playerCards, 
  boardCards, 
  equities, 
  onCardClick 
}) => {
  // Generate positions for players around an ellipse
  const getPlayerStyle = (index, total) => {
    // Offset by 90 degrees so player 0 is at the bottom
    const angle = (index / total) * Math.PI * 2 + Math.PI / 2;
    // Ellipse dimensions
    const rx = 45; // % of container width
    const ry = 40; // % of container height
    
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  const players = Array.from({ length: playerCount });

  return (
    <div className="poker-table-area">
      <div className="felt-table">
        {/* Community Cards */}
        <div className="community-cards">
          {[0, 1, 2, 3, 4].map(idx => (
            <PlayingCard
              key={`board-${idx}`}
              card={boardCards[idx]}
              onClick={() => onCardClick('board', idx)}
            />
          ))}
        </div>

        {/* Players */}
        {players.map((_, idx) => {
          const isHero = idx === 0;
          return (
            <div 
              key={`player-${idx}`} 
              className="player-spot"
              style={getPlayerStyle(idx, playerCount)}
            >
              <div className="player-info">
                <span>{isHero ? "You (Hero)" : `Opponent ${idx}`}</span>
                {isHero && equities && equities[0] !== undefined && (
                  <span className="win-prob">{equities[0]}%</span>
                )}
              </div>
              <div className="player-cards">
                {isHero ? (
                  <>
                    <PlayingCard
                      card={playerCards[0]?.[0]}
                      onClick={() => onCardClick('player', 0, 0)}
                    />
                    <PlayingCard
                      card={playerCards[0]?.[1]}
                      onClick={() => onCardClick('player', 0, 1)}
                    />
                  </>
                ) : (
                  <>
                    <div className="playing-card-wrapper">
                      <div className="playing-card-inner">
                        <div className="card-face back"></div>
                      </div>
                    </div>
                    <div className="playing-card-wrapper">
                      <div className="playing-card-inner">
                        <div className="card-face back"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokerTable;
