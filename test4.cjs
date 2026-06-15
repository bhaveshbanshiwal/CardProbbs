const { CardGroup, FullDeckRank } = require('poker-odds-calculator');
const g = CardGroup.fromString('AcAsAhAd2s3h4c');
const hr = FullDeckRank.evaluate(g);
console.log(hr.getName());
