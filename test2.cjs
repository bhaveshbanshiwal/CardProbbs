const { CardGroup, OddsCalculator } = require('poker-odds-calculator');

const p1 = CardGroup.fromString('AcAs');
const board = CardGroup.fromString('2h3h4h5hTc');
const r = OddsCalculator.calculate([p1, CardGroup.fromString('7c8c')], board);

try {
  console.log(r.equities[0].getHandRank().getName());
} catch(e) {
  console.log("no getHandRank");
}

console.log(Object.keys(r.equities[0]));
console.log(r.equities[0].getEquity());
