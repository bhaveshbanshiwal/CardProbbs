const { CardGroup, OddsCalculator } = require('poker-odds-calculator');

try {
  const p1 = CardGroup.fromString('AcAs');
  const board = CardGroup.fromString(''); // empty
  // Can we just calculate without a second player?
  const r = OddsCalculator.calculate([p1], board);
  console.log("Success with 1 player:", r.equities[0].getEquity());
} catch(e) {
  console.error("Error with 1 player:", e.message);
}

try {
  const p1 = CardGroup.fromString('AcAs');
  const p2 = CardGroup.fromString(''); // empty string instead of cards
  const board = CardGroup.fromString('');
  const r2 = OddsCalculator.calculate([p1, p2], board);
  console.log("Success with empty p2:", r2.equities[0].getEquity());
} catch(e) {
  console.error("Error with empty p2:", e.message);
}
