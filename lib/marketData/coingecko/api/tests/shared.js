//Modules
const mocha = require('mocha');
const chai = require('chai');
var should = chai.should();

/**
 * @description - Shared tests for validating CoinGeckoClient requests
 * @function
 */
exports.shouldBeAValidRequest = function () {

  it('should return object: {success, message, code, data}', function (done) {
    this.data.should.be.an('object');

    done();
  });

  it('should be a successful request', function (done) {
    this.data.success.should.be.true;

    done();
  });

  it('should return a 200 code', function (done) {
    this.data.code.should.equal(200);

    done();
  });
};