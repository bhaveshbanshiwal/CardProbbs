import { CardGroup, OddsCalculator } from 'poker-odds-calculator';

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export const getSuitSymbol = (suit) => {
  switch(suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

export const getRankDisplay = (rank) => {
  if (rank === 'T') return '10';
  return rank;
};

// Convert custom card object to poker-odds-calculator format (e.g. "Jh", "Ts")
export const formatCardString = (card) => {
  if (!card) return null;
  const suitMap = {
    'hearts': 'h',
    'diamonds': 'd',
    'clubs': 'c',
    'spades': 's'
  };
  return `${card.rank}${suitMap[card.suit]}`;
};

// Helper to evaluate hand rank from 7 cards (2 hole + 5 board)
// Cards are strings like 'Ah', 'Td'
const evaluateHandRank = (cards) => {
  if (cards.length < 5) return 'High Card';
  
  const ranks = '23456789TJQKA';
  const rankCounts = {};
  const suitCounts = {};
  
  cards.forEach(c => {
    const r = c[0];
    const s = c[1];
    rankCounts[r] = (rankCounts[r] || 0) + 1;
    suitCounts[s] = (suitCounts[s] || 0) + 1;
  });

  const isFlush = Object.values(suitCounts).some(c => c >= 5);
  
  const rVals = cards.map(c => ranks.indexOf(c[0])).sort((a,b) => b-a);
  const uniqueRVals = [...new Set(rVals)];
  
  let isStraight = false;
  let straightHigh = -1;
  if (uniqueRVals.length >= 5) {
    for (let i = 0; i <= uniqueRVals.length - 5; i++) {
      if (uniqueRVals[i] - uniqueRVals[i+4] === 4) {
        isStraight = true;
        straightHigh = uniqueRVals[i];
        break;
      }
    }
    // Check A-2-3-4-5 low straight (A=12, 5=3, 4=2, 3=1, 2=0)
    if (!isStraight && uniqueRVals.includes(12) && uniqueRVals.includes(3) && uniqueRVals.includes(2) && uniqueRVals.includes(1) && uniqueRVals.includes(0)) {
      isStraight = true;
      straightHigh = 3; // 5 high
    }
  }

  const counts = Object.values(rankCounts).sort((a,b) => b-a);
  const is4OfKind = counts[0] === 4;
  const isFullHouse = counts[0] === 3 && counts[1] >= 2;
  const is3OfKind = counts[0] === 3;
  const isTwoPair = counts[0] === 2 && counts[1] === 2;
  const isPair = counts[0] === 2;

  // Simplistic Straight Flush check (doesn't perfectly verify the straight is same suit, but close enough for MC estimates)
  if (isFlush && isStraight) {
    if (straightHigh === 12) return 'Royal Flush';
    return 'Straight Flush';
  }
  if (is4OfKind) return 'Four of a Kind';
  if (isFullHouse) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (is3OfKind) return 'Three of a Kind';
  if (isTwoPair) return 'Two Pair';
  if (isPair) return 'Pair';
  return 'High Card';
};

export const runMonteCarloSimulation = (heroHand, boardCards, opponentCount, iterations = 200) => {
  try {
    if (!heroHand || heroHand.length !== 2 || !heroHand[0] || !heroHand[1]) {
      return null;
    }

    const heroCardStr1 = formatCardString(heroHand[0]);
    const heroCardStr2 = formatCardString(heroHand[1]);
    const validBoardCards = boardCards.filter(c => c !== null);
    
    // Determine dead cards
    const deadCards = [heroCardStr1, heroCardStr2, ...validBoardCards.map(formatCardString)];
    
    // Create live deck
    const deckStrs = [];
    RANKS.forEach(r => {
      ['h', 'd', 'c', 's'].forEach(s => {
        const c = `${r}${s}`;
        if (!deadCards.includes(c)) deckStrs.push(c);
      });
    });

    let totalEquity = 0;
    const handStats = {
      'Royal Flush': 0, 'Straight Flush': 0, 'Four of a Kind': 0,
      'Full House': 0, 'Flush': 0, 'Straight': 0,
      'Three of a Kind': 0, 'Two Pair': 0, 'Pair': 0, 'High Card': 0
    };
    
    const opponentStats = {
      'Royal Flush': 0, 'Straight Flush': 0, 'Four of a Kind': 0,
      'Full House': 0, 'Flush': 0, 'Straight': 0,
      'Three of a Kind': 0, 'Two Pair': 0, 'Pair': 0, 'High Card': 0
    };

    const rankValue = {
      'Royal Flush': 10, 'Straight Flush': 9, 'Four of a Kind': 8,
      'Full House': 7, 'Flush': 6, 'Straight': 5,
      'Three of a Kind': 4, 'Two Pair': 3, 'Pair': 2, 'High Card': 1
    };

    // Run Monte Carlo Iterations
    for (let i = 0; i < iterations; i++) {
      // Shuffle live deck
      const currentDeck = [...deckStrs];
      for (let j = currentDeck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [currentDeck[j], currentDeck[k]] = [currentDeck[k], currentDeck[j]];
      }

      const playerGroups = [CardGroup.fromString(`${heroCardStr1}${heroCardStr2}`)];
      const opponentHandsStr = [];
      
      // Deal to opponents
      for (let op = 0; op < opponentCount; op++) {
        const c1 = currentDeck.pop();
        const c2 = currentDeck.pop();
        playerGroups.push(CardGroup.fromString(`${c1}${c2}`));
        opponentHandsStr.push([c1, c2]);
      }

      // Deal remaining board
      let currentBoardStr = validBoardCards.map(formatCardString).join('');
      const cardsNeeded = 5 - validBoardCards.length;
      const rolloutBoardArray = validBoardCards.map(formatCardString);
      for (let b = 0; b < cardsNeeded; b++) {
        const dealt = currentDeck.pop();
        currentBoardStr += dealt;
        rolloutBoardArray.push(dealt);
      }
      
      const boardGroup = currentBoardStr ? CardGroup.fromString(currentBoardStr) : null;
      
      // Evaluate equity
      const result = OddsCalculator.calculate(playerGroups, boardGroup);
      totalEquity += result.equities[0].getEquity();

      // Evaluate hero hand rank
      const fullHeroHand = [heroCardStr1, heroCardStr2, ...rolloutBoardArray];
      const hr = evaluateHandRank(fullHeroHand);
      if (handStats[hr] !== undefined) {
        handStats[hr]++;
      }

      // Evaluate best opponent hand rank
      if (opponentCount > 0) {
        let bestOpRank = 'High Card';
        let bestOpVal = 1;
        opponentHandsStr.forEach(opHand => {
          const fullOpHand = [...opHand, ...rolloutBoardArray];
          const opHr = evaluateHandRank(fullOpHand);
          const val = rankValue[opHr];
          if (val > bestOpVal) {
            bestOpVal = val;
            bestOpRank = opHr;
          }
        });
        if (opponentStats[bestOpRank] !== undefined) {
          opponentStats[bestOpRank]++;
        }
      }
    }

    // Convert to percentages
    const statsPercentages = {};
    const opStatsPercentages = {};
    for (const key of Object.keys(handStats)) {
      statsPercentages[key] = ((handStats[key] / iterations) * 100).toFixed(1);
      opStatsPercentages[key] = ((opponentStats[key] / iterations) * 100).toFixed(1);
    }

    return {
      equity: Math.round(totalEquity / iterations),
      stats: statsPercentages,
      opStats: opStatsPercentages
    };
  } catch (error) {
    console.error("Monte Carlo Error:", error);
    return null;
  }
};

export const calculate250Points = (cards) => {
  let total = 0;
  cards.forEach(card => {
    if (!card) return;
    
    // Queen of Spades = 60
    if (card.rank === 'Q' && card.suit === 'spades') {
      total += 60;
    }
    // Aces = 15
    else if (card.rank === 'A') {
      total += 15;
    }
    // Kings = 10
    else if (card.rank === 'K') {
      total += 10;
    }
    // Queens (other) = 10
    else if (card.rank === 'Q') {
      total += 10;
    }
    // Jacks = 10
    else if (card.rank === 'J') {
      total += 10;
    }
    // 10s = 5
    else if (card.rank === 'T') {
      total += 5;
    }
  });
  return total;
};

export const evaluate250Bid = (cards) => {
  // We need exactly 8 cards
  const validCards = cards.filter(c => c !== null);
  if (validCards.length < 8) return null;

  const pointsInHand = calculate250Points(validCards);
  
  const suitCounts = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  
  validCards.forEach(c => {
    suitCounts[c.suit]++;
  });

  // Best Trump is longest suit
  let bestTrump = 'spades';
  let maxLen = 0;
  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count > maxLen) {
      maxLen = count;
      bestTrump = suit;
    }
  }

  // Determine Friend Cards to Call
  // Priority 1: Queen of Spades (60 points) - IF we don't have it
  // Priority 2: Ace of Trump - IF we don't have it
  // Priority 3: Other Aces - IF we don't have them
  // Priority 4: King of Trump
  const hasCard = (suit, rank) => validCards.some(c => c.suit === suit && c.rank === rank);
  
  let recommendedFriends = [];
  
  // 1. Spade Queen
  if (!hasCard('spades', 'Q')) {
    recommendedFriends.push({ suit: 'spades', rank: 'Q' });
  }
  
  // 2. Ace of Trump
  if (!hasCard(bestTrump, 'A') && recommendedFriends.length < 2) {
    // Edge case: bestTrump is spades, and we just added Spade Queen. That's fine, we can call Spade Ace too.
    recommendedFriends.push({ suit: bestTrump, rank: 'A' });
  }

  // 3. Other Aces
  const otherSuits = ['hearts', 'diamonds', 'clubs', 'spades'].filter(s => s !== bestTrump);
  for (const suit of otherSuits) {
    if (recommendedFriends.length >= 2) break;
    if (!hasCard(suit, 'A')) {
      recommendedFriends.push({ suit, rank: 'A' });
    }
  }

  // 4. Fallback: Kings
  if (recommendedFriends.length < 2 && !hasCard(bestTrump, 'K')) {
    recommendedFriends.push({ suit: bestTrump, rank: 'K' });
  }
  for (const suit of otherSuits) {
    if (recommendedFriends.length >= 2) break;
    if (!hasCard(suit, 'K')) {
      recommendedFriends.push({ suit, rank: 'K' });
    }
  }

  // Calculate trick power
  let trickPower = 0;
  validCards.forEach(c => {
    if (c.rank === 'A') trickPower += 1.0;
    else if (c.rank === 'K') trickPower += 0.6;
    else if (c.rank === 'Q' && c.suit !== 'spades') trickPower += 0.3;
    else if (c.rank === 'Q' && c.suit === 'spades') trickPower += 0.8;
    
    if (c.suit === bestTrump && c.rank !== 'A' && c.rank !== 'K') {
      trickPower += 0.4; // Small trump cards have some power
    }
  });

  // Base expectation: 
  // Our tricks win average ~30 pts each.
  // Plus we call 2 friends who represent roughly 40% of the remaining cards.
  let expectedTeamTricks = trickPower + ((8 - trickPower) * 0.4);
  let expectedScore = (expectedTeamTricks * 31.25);
  
  // Give extra weight if we literally hold the Spade Queen (60pts guaranteed if we win the trick)
  if (validCards.some(c => c.rank === 'Q' && c.suit === 'spades')) {
    expectedScore += 30; 
  }
  
  // Give extra weight for the friends we called (Queen of spades is +60, Ace is +15 and trick winner)
  recommendedFriends.forEach(f => {
    if (f.suit === 'spades' && f.rank === 'Q') expectedScore += 45; // Huge boost
    else if (f.rank === 'A') expectedScore += 25;
    else if (f.rank === 'K') expectedScore += 15;
  });

  // Determine realistic bid (nearest multiple of 5 between 150 and 250)
  let recommendedBid = Math.round(expectedScore / 5) * 5;
  recommendedBid = Math.min(250, Math.max(150, recommendedBid));
  
  // Calculate confidence (chance to hit the bid)
  // If expectedScore is higher than the recommendedBid, confidence goes up.
  let diff = expectedScore - recommendedBid;
  let confidence = 65 + (diff * 1.5);
  confidence = Math.min(99, Math.max(20, confidence));

  return {
    bid: recommendedBid,
    trump: bestTrump,
    confidence: Math.round(confidence),
    pointsInHand,
    friends: recommendedFriends
  };
};
