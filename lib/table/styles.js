import chalk from 'chalk';

const upDownStyle = (value, formatted) => {
  if (value > 0) return chalk.green(formatted);
  if (value < 0) return chalk.red(formatted);

  return chalk.white.dim(formatted);
};

export default {
  header: chalk.white.bold.underline,
  dim: chalk.white.dim,
  totalLabel: chalk.white.bold,
  totalValue: chalk.yellow.bold,
  footerValue: chalk.blue.bold,
  upDownStyle
};
