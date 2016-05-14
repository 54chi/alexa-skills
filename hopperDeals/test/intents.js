'use strict';

var test = require('tape');
var intents = require('../src/intents');

var intent = {
  slots:{"USCity":{value:"Chicago"}}
};

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
  t.plan(5);
  t.equal(typeof intents["AMAZON.HelpIntent"](intent, session, response), 'undefined');   //display help message

  intents.HopperExplorerIntent(intent, session, response).then(callback); //get results and test page 1
  function callback(speech) {
    t.equal(typeof speech, 'string'); //confirm the result from the callback
    //paginate to the next 2 pages
    t.equal(typeof intents["AMAZON.RepeatIntent"](intent, session, response), 'string');   //call the repeat intent
    t.equal(typeof intents["AMAZON.YesIntent"](intent, session, response), 'string');   //page 2
    t.equal(typeof intents["AMAZON.YesIntent"](intent, session, response), 'string');   //page 3
  }
});
