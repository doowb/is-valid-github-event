'use strict';
var crypto = require('crypto');
var typeOf = require('kind-of');
var compare = require('safe-compare');
var extend = require('extend-shallow');
var event = require('typeof-github-event');

/**
 * Validates that the provided request is a valid GitHub webhook request
 * with a valid GitHub event and action.
 *
 * ```js
 * // using an express middleware
 * express.post('/webhook', function(req, res) {
 *   if (!isValid(req, 'my-secret', {event: 'issues', action: 'opened'})) {
 *     res.status(500);
 *     res.send({message: 'Invalid request'});
 *     return;
 *   }
 *   res.status(200);
 *   res.send({message: 'Valid request'});
 * })
 * ```
 * @name isValid
 * @param  {Object} `req` Instance of an HTTP Request object (usually from express, hapi, or koa)
 * @param  {String} `secret` Optional secret used to sign the GitHub request. Leave this out to just check `event` or `action`
 * @param  {Object} `options` Additional options for validating against `event` and `action`.
 * @param  {String} `options.event` The GitHub event to validate against. See [typeof-github-event][] for more information.
 * @param  {String} `options.action` The event action to validate against. See [GitHub API docs](https://developer.github.com/v3/activity/events/types/) for more information.
 * @return {Boolean} Returns `true` when valid and `false` when not.
 * @api public
 */

module.exports = function(req, secret, options) {
  if (typeOf(req) === 'undefined') {
    throw new TypeError('expected first argument to be a request object');
  }

  if (typeOf(secret) === 'object') {
    options = secret;
    secret = null;
  }

  var opts = extend({}, options);
  var payload = req.body;
  var valid = true;

  if (secret) {
    var signature = req.headers['x-hub-signature'];
    var hmac = crypto.createHmac('sha1', secret)
        .update(JSON.stringify(payload, null, 0))
        .digest('hex');
    valid = compare(signature, `sha1=${hmac}`);
  }

  if (valid === true && typeOf(opts.event) !== 'undefined') {
    var events = arrayify(opts.event);
    for (var i = 0; i < events.length; i++) {
      if(!event.is(events[i], payload)) {
        valid = false;
        break;
      }
    }
  }

  if (valid === true && typeOf(opts.action) !== 'undefined') {
    valid = (payload.action === opts.action);
  }

  return valid;
};

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}
