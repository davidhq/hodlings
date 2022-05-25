// as visible in bitcoin.json cached market data
const COMMODITY = {
  xag: 'Silver Ounce',
  xau: 'Gold Ounce'
};

export default function getCommodity(coinName) {
  return COMMODITY[coinName.toLowerCase()];
}
