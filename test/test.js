'use strict';

require('mocha');
var assert = require('assert');
var isValid = require('..');

describe('is-valid-github-event', function() {
  it('should export a function', function() {
    assert.equal(typeof isValid, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      isValid();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a request object');
      cb();
    }
  });
});
