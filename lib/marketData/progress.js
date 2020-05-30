import ProgressBar from 'progress';
import chalk from 'chalk';

class Progress {
  constructor({ coinsNumber }) {
    this.bar = new ProgressBar(`Reading ${chalk.green('CoinGecko')} market data ${chalk.cyan('[:bar]')} ${chalk.cyan(':percent')} ${chalk.gray('ETA :etas')}`, {
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
