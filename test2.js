import { CardGroup, OddsCalculator } from 'poker-odds-calculator';

const p1 = CardGroup.fromString('AcAs');
const board = CardGroup.fromString('2h3h4h5h7c');
const r = OddsCalculator.calculate([p1, CardGroup.fromString('7c8c')], board);

console.log(JSON.stringify(r.equities[0].getHandRank(), null, 2));
console.log(r.equities[0].getHandRank().getName());
