//Modules
const fs = require('fs');
const mocha = require('mocha');
const chai = require('chai');
var should = chai.should();

//Helpers
const CoinGecko = require('../../lib/CoinGecko');

const shared = require('../shared');

describe('CoinGecko', function () {
  before(function (done) {
    this.CoinGeckoClient = new CoinGecko();

    done();
  });

  describe('ping', function () {
    before(function (done) {
      this.CoinGeckoClient.ping().then((data) => {
        this.data = data;
        done();
      });
    });

    shared.shouldBeAValidRequest();
  });

  describe('global', function () {
    before(function (done) {
      this.CoinGeckoClient.global().then((data) => {
        this.data = data;
        done();
      });
    });

    shared.shouldBeAValidRequest();
  });

  describe('coins', function () {

    describe('list', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.list().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.all({
          order: CoinGecko.ORDER.COIN_NAME_ASC,
          per_page: 100,
          page: 1,
          localization: false,
          sparkline: true,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('markets', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.markets({
          vs_currency: 'usd',
          ids: ['bitcoin', 'ethereum', 'ripple'],
          order: CoinGecko.ORDER.COIN_NAME_ASC,
          per_page: 100,
          page: 1,
          sparkline: true,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetch', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetch('bitcoin', {
          tickers: true,
          market_data: true,
          community_data: true,
          developer_data: true,
          localization: true,
          sparkline: true,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchTickers', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetchTickers('bitcoin').then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchHistory', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetchHistory('bitcoin', {
          date: '30-12-2017',
          localization: true,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchMarketChart', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetchMarketChart('bitcoin', {
          vs_currency: 'usd',
          days: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchMarketChartRange', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetchMarketChartRange('bitcoin', {
          vs_currency: 'usd',
          from: 1392577232,
          to: 1422577232,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchStatusUpdates', function () {
      before(function (done) {
        this.CoinGeckoClient.coins.fetchStatusUpdates('bitcoin', {
          per_page: 100,
          page: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchCoinContractInfo', function () {
      before(function (done) {
        var zrx = '0xe41d2489571d322189246dafa5ebde1f4699f498';
        this.CoinGeckoClient.coins.fetchCoinContractInfo(zrx).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchCoinContractMarketChart', function () {
      before(function (done) {
        var zrx = '0xe41d2489571d322189246dafa5ebde1f4699f498';
        this.CoinGeckoClient.coins.fetchCoinContractMarketChart(zrx).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchCoinContractMarketChartRange', function () {
      before(function (done) {
        var zrx = '0xe41d2489571d322189246dafa5ebde1f4699f498';
        this.CoinGeckoClient.coins.fetchCoinContractMarketChartRange(zrx, 'ethereum', {
          from: 1392577232,
          to: 1422577232,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

  });

  describe('exchanges', function () {
    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.all().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('list', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.list().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetch', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.fetch('binance').then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchTickers', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.fetchTickers('binance', {
          page: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchStatusUpdates', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.fetchStatusUpdates('binance', {
          per_page: 100,
          page: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchVolumeChart', function () {
      before(function (done) {
        this.CoinGeckoClient.exchanges.fetchVolumeChart('binance', {
          days: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('statusUpdates', function () {
    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.statusUpdates.all({
          category: CoinGecko.STATUS_UPDATE_CATEGORY.EVENT,
          project_type: CoinGecko.STATUS_UPDATE_PROJECT_TYPE.COIN,
          per_page: 100,
          page: 1,
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('events', function () {
    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.events.all({
          country_code: 'US',
          type: CoinGecko.EVENT_TYPE.CONFERENCE,
          page: 1,
          upcoming_events_only: false,
          from_date: '2018-06-01',
          to_date: '2018-07-01'
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchCountries', function () {
      before(function (done) {
        this.CoinGeckoClient.events.fetchCountries().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchTypes', function () {
      before(function (done) {
        this.CoinGeckoClient.events.fetchTypes().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('exchangeRates', function () {
    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.exchangeRates.all().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('simple', function () {
    describe('price', function () {
      before(function (done) {
        this.CoinGeckoClient.simple.price({
          vs_currencies: 'usd',
          ids: ['bitcoin', 'ethereum', 'ripple'],
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('supportedVsCurrencies', function () {
      before(function (done) {
        this.CoinGeckoClient.simple.supportedVsCurrencies().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchTokenPrice', function () {
      before(function (done) {
        var zrx = '0xe41d2489571d322189246dafa5ebde1f4699f498';
        this.CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: zrx,
          vs_currencies: 'usd',
        }).then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('finance', function () {
    describe('fetchPlatforms', function () {
      before(function (done) {
        this.CoinGeckoClient.finance.fetchPlatforms().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchProducts', function () {
      before(function (done) {
        this.CoinGeckoClient.finance.fetchProducts().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('indexes', function () {
    describe('all', function () {
      before(function (done) {
        this.CoinGeckoClient.indexes.all().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetch', function () {
      before(function (done) {
        this.CoinGeckoClient.indexes.fetch('BTC').then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('list', function () {
      before(function (done) {
        this.CoinGeckoClient.indexes.list().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });
  });

  describe('derivatives', function () {
    describe('fetchTickers', function () {
      before(function (done) {
        this.CoinGeckoClient.derivatives.fetchTickers().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('allExchanges', function () {
      before(function (done) {
        this.CoinGeckoClient.derivatives.allExchanges().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('fetchExchange', function () {
      before(function (done) {
        this.CoinGeckoClient.derivatives.fetchExchange('bitmex').then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

    describe('listExchanges', function () {
      before(function (done) {
        this.CoinGeckoClient.derivatives.listExchanges().then((data) => {
          this.data = data;
          done();
        });
      });

      shared.shouldBeAValidRequest();
    });

  });

});