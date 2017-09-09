Highcharts.chart('container', {
  chart: {
    type: 'pie',
    backgroundColor: '',
    options3d: {
      enabled: true,
      alpha: 25
    }
  },
  credits: {
    enabled: false
  },
  title: {
    text: 'davidhq'
  },
  subtitle: {
    text: 'cryptofolio'
  },
  plotOptions: {
    pie: {
      innerSize: 100,
      depth: 45
    }
  },
  series: [
    {
      name: 'Pct',
      data: [
        ['Ethereum', 84.79],
        ['NEM', 4.01],
        ['NEO', 3.51],
        ['Augur', 3.2],
        ['Golem', 0.88],
        ['OmiseGO', 0.79],
        ['IOTA', 0.57],
        ['district0x', 0.45],
        ['Gas', 0.28],
        ['Mothership', 0.22],
        ['Bitcoin', 0.2],
        ['DigixDAO', 0.19],
        ['0x', 0.18],
        ['Status', 0.14],
        ['Ardor', 0.13],
        ['Basic Attention Token', 0.12],
        ['Bancor', 0.11],
        ['Metal', 0.08],
        ['TenX', 0.06],
        ['SingularDTV', 0.03],
        ['Aragon', 0.02],
        ['Melon', 0.02],
        ['Gnosis', 0.01]
      ]
    }
  ]
});
