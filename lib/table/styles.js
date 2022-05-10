import colors from 'chalk';

const upDownStyle = (value, formatted) => {
  if (value > 0) return colors.green(formatted);
  if (value < 0) return colors.red(formatted);

  return colors.white.dim(formatted);
};

const marketCapStyle = (value, formatted) => {
  if (value == 0) return colors.dim('n/a');
  return colors.cyan.dim(formatted);
};

const rankStyle = (value, formatted) => {
  if (value == undefined) return colors.dim('n/a');
  return colors.white(formatted);
};

export default {
  header: colors.white.bold.underline,
  dim: colors.white.dim,
  totalLabel: colors.white.bold,
  totalValue: colors.yellow.bold,
  footerValue: colors.blue.bold,
  upDownStyle,
  marketCapStyle,
  rankStyle
};
