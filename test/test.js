'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var crypto = require('crypto');

var isValid = require('..');

var fixtures = path.join.bind(path.join, __dirname, 'fixtures');
var secret = 'is-valid-github-event-tests';

function createSignature(secret, payload) {
  var hmac = crypto.createHmac('sha1', secret)
    .update(JSON.stringify(payload, null, 0))
    .digest('hex');
  return 'sha1=' + hmac;
}

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

  var files = fs.readdirSync(fixtures());
  files.forEach(function(file) {
    var event = path.basename(file, path.extname(file));
    var payload = require(fixtures(file));
    var req = {
      headers: {
        'x-hub-signature': createSignature(secret, payload)
      },
      body: payload
    };

    it('should validate the "' + event + '" event with the correct signature', function() {
      assert(isValid(req, secret, {event: event}), 'expected "' + event + '" with a secret to be valid');
    });

    it('should validate the "' + event + '" event payload', function() {
      assert(isValid(req, {event: event}), 'expected "' + event + '" to be valid');
    });
  });
});
