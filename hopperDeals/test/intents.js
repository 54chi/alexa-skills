'use strict';

var test = require('tape');
var intents = require('../src/intents');

var intent = {};

var session = {
  attributes: {}
};

var response = {
  ask: function(data) {
    console.log('Alexa ASK: ' + data);
  },
  askWithCard: function(data) {
    console.log('Alexa ASK with CARD: ' + data);
  },
  tell: function(data) {
    console.log('Alexa TELL: ' + data);
  },
  tellWithCard: function(data) {
    console.log('Alexa TELL with CARD: ' + data);
  }
};

test('intents', function (t) {
  t.plan(1);

  intents.ReadNewDealsIntent(intent, session, response).then(callback);

  function callback(speech) {
    t.equal(typeof speech, 'string');
  }
});
