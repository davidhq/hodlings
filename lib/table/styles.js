import chalk from 'chalk';

const upDownStyle = (value, formatted) => {
  if (value > 0) return chalk.green(formatted);
  if (value < 0) return chalk.red(formatted);

  return chalk.white.dim(formatted);
};

const marketCapStyle = (value, formatted) => {
  if (value == 0) return chalk.dim('n/a');
  return chalk.cyan.dim(formatted);
};

const rankStyle = (value, formatted) => {
  if (value == undefined) return chalk.dim('n/a');
  return chalk.white(formatted);
};

export default {
  header: chalk.white.bold.underline,
  dim: chalk.white.dim,
  totalLabel: chalk.white.bold,
  totalValue: chalk.yellow.bold,
  footerValue: chalk.blue.bold,
  upDownStyle,
  marketCapStyle,
  rankStyle
};
