//Modules
const chai = require('chai');
var should = chai.should();

//Helpers
const Utils = require('../../../lib/helpers/utilities');

const VAR_TYPES = {
  STRING: 'String',
  STRING_EMPTY: '',
  NULL: null,
  UNDEFINED: undefined,
  NUMBER: 250,
  ARRAY: ['a', 'basic', 'array'],
  OBJECT: { 'a': 'b', 'c': 'd' },
  DATE: new Date(),
};

describe('Utilities', function () {
  describe('isString', function () {
    it('should return true if value is string', function (done) {
      Utils.isString(VAR_TYPES.STRING_EMPTY).should.be.true;
      Utils.isString(VAR_TYPES.STRING).should.be.true;

      done();
    });

    it('should return false if value is null', function (done) {
      Utils.isString(VAR_TYPES.NULL).should.be.false;

      done();
    });

    it('should return false if value is undefined', function (done) {
      Utils.isString(VAR_TYPES.UNDEFINED).should.be.false;

      done();
    });

    it('should return false if value is number', function (done) {
      Utils.isString(VAR_TYPES.NUMBER).should.be.false;

      done();
    });

    it('should return false if value is array', function (done) {
      Utils.isString(VAR_TYPES.ARRAY).should.be.false;

      done();
    });

    it('should return false if value is object', function (done) {
      Utils.isString(VAR_TYPES.OBJECT).should.be.false;

      done();
    });

    it('should return false if value is date', function (done) {
      Utils.isString(VAR_TYPES.DATE).should.be.false;

      done();
    });
  });

  describe('isStringEmpty', function () {
    it('should return false if value is string with value "string"', function (done) {
      Utils.isStringEmpty(VAR_TYPES.STRING).should.be.false;

      done();
    });

    it('should return true if value is string with value ""', function (done) {
      Utils.isStringEmpty(VAR_TYPES.STRING_EMPTY).should.be.true;

      done();
    });
  });

  describe('isDate', function () {
    it('should return false if value is string', function (done) {
      Utils.isDate(VAR_TYPES.STRING_EMPTY).should.be.false;
      Utils.isDate(VAR_TYPES.STRING).should.be.false;

      done();
    });

    it('should return false if value is null', function (done) {
      Utils.isDate(VAR_TYPES.NULL).should.be.false;

      done();
    });

    it('should return false if value is undefined', function (done) {
      Utils.isDate(VAR_TYPES.UNDEFINED).should.be.false;

      done();
    });

    it('should return false if value is number', function (done) {
      Utils.isDate(VAR_TYPES.NUMBER).should.be.false;

      done();
    });

    it('should return false if value is array', function (done) {
      Utils.isDate(VAR_TYPES.ARRAY).should.be.false;

      done();
    });

    it('should return false if value is object', function (done) {
      Utils.isDate(VAR_TYPES.OBJECT).should.be.false;

      done();
    });

    it('should return true if value is date', function (done) {
      Utils.isDate(VAR_TYPES.DATE).should.be.true;

      done();
    });
  });

  describe('isObject', function () {
    it('should return false if value is string', function (done) {
      Utils.isObject(VAR_TYPES.STRING_EMPTY).should.be.false;
      Utils.isObject(VAR_TYPES.STRING).should.be.false;

      done();
    });

    it('should return false if value is null', function (done) {
      Utils.isObject(VAR_TYPES.NULL).should.be.false;

      done();
    });

    it('should return false if value is undefined', function (done) {
      Utils.isObject(VAR_TYPES.UNDEFINED).should.be.false;

      done();
    });

    it('should return false if value is number', function (done) {
      Utils.isObject(VAR_TYPES.NUMBER).should.be.false;

      done();
    });

    it('should return false if value is array', function (done) {
      Utils.isObject(VAR_TYPES.ARRAY).should.be.false;

      done();
    });

    it('should return true if value is object', function (done) {
      Utils.isObject(VAR_TYPES.OBJECT).should.be.true;

      done();
    });

    it('should return false if value is date', function (done) {
      Utils.isObject(VAR_TYPES.DATE).should.be.false;

      done();
    });
  });

  describe('isNumber', function () {
    it('should return false if value is string', function (done) {
      Utils.isNumber(VAR_TYPES.STRING_EMPTY).should.be.false;
      Utils.isNumber(VAR_TYPES.STRING).should.be.false;

      done();
    });

    it('should return false if value is null', function (done) {
      Utils.isNumber(VAR_TYPES.NULL).should.be.false;

      done();
    });

    it('should return false if value is undefined', function (done) {
      Utils.isNumber(VAR_TYPES.UNDEFINED).should.be.false;

      done();
    });

    it('should return true if value is number', function (done) {
      Utils.isNumber(VAR_TYPES.NUMBER).should.be.true;

      done();
    });

    it('should return false if value is array', function (done) {
      Utils.isNumber(VAR_TYPES.ARRAY).should.be.false;

      done();
    });

    it('should return false if value is object', function (done) {
      Utils.isNumber(VAR_TYPES.OBJECT).should.be.false;

      done();
    });

    it('should return false if value is date', function (done) {
      Utils.isNumber(VAR_TYPES.DATE).should.be.false;

      done();
    });
  });

  describe('isArray', function () {
    it('should return false if value is string', function (done) {
      Utils.isArray(VAR_TYPES.STRING_EMPTY).should.be.false;
      Utils.isArray(VAR_TYPES.STRING).should.be.false;

      done();
    });

    it('should return false if value is null', function (done) {
      Utils.isArray(VAR_TYPES.NULL).should.be.false;

      done();
    });

    it('should return false if value is undefined', function (done) {
      Utils.isArray(VAR_TYPES.UNDEFINED).should.be.false;

      done();
    });

    it('should return false if value is number', function (done) {
      Utils.isArray(VAR_TYPES.NUMBER).should.be.false;

      done();
    });

    it('should return true if value is array', function (done) {
      Utils.isArray(VAR_TYPES.ARRAY).should.be.true;

      done();
    });

    it('should return false if value is object', function (done) {
      Utils.isArray(VAR_TYPES.OBJECT).should.be.false;

      done();
    });

    it('should return false if value is date', function (done) {
      Utils.isArray(VAR_TYPES.DATE).should.be.false;

      done();
    });
  });

  describe('_WARN_', function () {
    it('should return true regardless', function (done) {
      Utils._WARN_('Title', 'Some detail...').should.be.true;

      done();
    });
  });
});