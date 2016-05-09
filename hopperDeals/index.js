/**
  2016, 54chi
  For educational purposes only
**/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - User info: Using the amazon account as a key, store user's preferences in a Database (e-mail and point of origin)
 * - Screen scrapper: Usi
 * - Session State: Handles a multi-turn dialog model.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 * - use i18n
 *
 * Examples:
 * Dialog model:
 *  User: "Alexa, ask Wise Guy to tell me a knock knock joke."
 *  Alexa: "Knock knock"
 *  User: "Who's there?"
 *  Alexa: "<phrase>"
 *  User: "<phrase> who"
 *  Alexa: "<Punchline>"
 */

//Amazon skill template (this is pretty much standard)
'use strict';

//require stuff
var AlexaSkill = require('./libs/AlexaSkill');
var intentHandlers = require('./libs/intents');
var i18n = require('./libs/i18n');

// App ID for the skill
var APP_ID = '';

// App is a child of AlexaSkill
var App = function () {
 AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
App.prototype = Object.create(AlexaSkill.prototype);
App.prototype.varructor = App;

App.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
 console.log('App onSessionStarted requestId: ' + sessionStartedRequest.requestId + ', sessionId: ' + session.sessionId);
 // any initialization logic goes here
};

App.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
 console.log('App onLaunch requestId: ' + launchRequest.requestId + ', sessionId: ' + session.sessionId);

 response.ask(i18n.greeting, i18n.greetingReprompt);
};

App.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
 console.log('App onSessionEnded requestId: ' + sessionEndedRequest.requestId + ', sessionId: ' + session.sessionId);
 // any cleanup logic goes here
};

App.prototype.intentHandlers = intentHandlers;

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
 // Create an instance of the App skill.
 var app = new App();
 app.execute(event, context);
};
