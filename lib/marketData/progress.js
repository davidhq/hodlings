import ProgressBar from 'progress';
import colors from 'chalk';

class Progress {
  constructor({ coinsNumber }) {
    this.bar = new ProgressBar(`Reading ${colors.green('CoinGecko')} market data ${colors.cyan('[:bar]')} ${colors.cyan(':percent')} ${colors.gray('ETA :etas')}`, {
      complete: '■',
      incomplete: ' ',
      width: 20,
      total: coinsNumber + 2 // globalData and coinList are separate requests
    });
  }

  tick() {
    this.bar.tick();
  }
}

export default Progress;
