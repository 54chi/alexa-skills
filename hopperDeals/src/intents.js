'use strict';

var _ = require('lodash');
var pluralize = require('pluralize');
var capitalize = require('capitalize');
var api = require('./api');
var i18n = require('./i18n');

/*
AddEmail
DeleteEmail
OneShotDeals
AddOrigin
Amazon StartOver
Amazon Repeat
*/
var intents = {
  'AMAZON.HelpIntent': HelpIntent,
  'AMAZON.YesIntent': YesIntent,
  'AMAZON.NoIntent': NoIntent,
  'AMAZON.CancelIntent': CancelIntent,
  'AMAZON.StopIntent': StopIntent,
  ReadNewDealsIntent: ReadNewDealsIntent
};

function HelpIntent(intent, session, response) {
  var speech = i18n.helpInstructions + ' ' + i18n.seeHelpCard + ' ' + i18n.helpPrompt;
  var cardTitle = i18n.help;
  var cardContent = i18n.helpInstructions + ' ' + i18n.helpContact;

  response.askWithCard(speech, i18n.helpInstructions, cardTitle, cardContent);
}

function YesIntent(intent, session, response) {
  if (session.attributes.readMore) {
    if (session.attributes.dealType) {
      session.attributes.page += 1;
      return readDeals(intent, session, response, {
        type: session.attributes.dealType,
        page: session.attributes.page
      });
    }
  }

  return response.tell('');
}

function NoIntent(intent, session, response) {
  if (session.attributes.readMore) {
    if (session.attributes.dealType) {
      return response.tell(i18n.exit);
    }
  }

  return response.tell('');
}

function CancelIntent(intent, session, response) {
  return response.tell(i18n.exit);
}

function StopIntent(intent, session, response) {
  return response.tell(i18n.exit);
}

function ReadNewDealsIntent(intent, session, response) {
  return readDeals(intent, session, response, {
    type: 'new'
  });
}

function readDeals(intent, session, response, options) {
//  var count = (_.get(intent, ['slots', 'Count', 'value'], 10) >> 0);
  var type = options.type;
//  var page = options.page;

//  if (typeof page !== 'number') {
//    page = 1;
//  }

  session.attributes.dealType = type;
//  session.attributes.page = page;


/*
dealTypes.forEach(function(type) {
  api.getDeals().then(function(deals){
    var titles = deals.map(function(deal){
      return deal.title;
    });
    t.ok(titles.length>0, 'Title length is greater than 0');
  });
});
*/

  return api.getDeals().then(function(deals) {
    var cardTitle = i18n[type + 'Deals'];
    var cardContent = generateDealsCardContent(deals);

//    var nextOrLatest = page > 1 ? 'next' : 'latest';

//    var startDealsSpeech = 'Here are the ' + nextOrLatest + ' ' + count + ' ' + type + ' Hacker News deals';

    var speech = i18n.noDeals;

    console.log("We have "+ deals.length + " deals");

    if (deals.length > 1) {
      //var speech = startDealsSpeech + ', ' + generateDealSpeech(deals) + '. ' + i18n.hearMoreDeals;
      speech="test";
      session.attributes.readMore = true;
      response.askWithCard(speech, i18n.hearMoreDeals, cardTitle, cardContent);
    }

    return speech;
  }).catch(function(error) {
    response.tell(i18n['errorRetrieving' + capitalize(type) + 'Deals']);

    return error;
  });
}

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, open Tide Pooler and get tide information for Seattle on Saturday'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotDealsRequest(intent, session, response) {

    // Determine city, using default if none provided
    var origin = getOriginFromIntent(intent, true),
        repromptText,
        speechOutput;
    if (origin.error) {
        // invalid city. move to the dialog
        repromptText = "Currently, I know tide information for these coastal cities";
        // if we received a value for the incorrect city, repeat it to the user, otherwise we received an empty slot
        speechOutput = origin.origin ? "I'm sorry, I don't have any data for " + origin.origin + ". " + repromptText : repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }


    // all slots filled, either from the user or by default values. Move to final request
    getListOfDealsResponse(origin, destination, response);
}

/**
 * Gets the origin from the intent, or returns an error
 */
function getOriginFromIntent(intent, assignDefault) {
    var originSlot = intent.slots.Origin;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!originSlot || !originSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // For sample skill, default to Seattle.
            return {
                origin: 'seattle'
            }
        }
    } else {
        return {
          origin: originSlot.value
        }
    }
}

/**
 * Gets the destination from the intent, or returns an error
 */
function getDestinationFromIntent(intent, assignDefault) {
    var destinationSlot = intent.slots.Destination;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!destinationSlot || !destinationSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // For sample skill, default to Seattle.
            return {
                destination: 'chicago'
            }
        }
    } else {
        return {
          destination: destinationSlot.value
        }
    }
}


/*
title: $title,
price: $price,
dates: $dates,
link:  $link;
*/



function generateDealSpeech(deals) {
  var speech = deals.map(function(deal, i) {
    var initialText = i18n.nextDeal;

    if (i === 0) {
      initialText = i18n.firstDeal;
    }
    if (deals.length - 1 === i) {
      initialText = i18n.lastDeal;
    }

    return initialText + ' with ' + deal.dates + ' '  + ' from ' + deal.price + ', ' + deal.title + '.';
  }).join(' ');

  console.log("Deal Speech: "+ speech);


  return speech;
}

function generateDealsCardContent(deals) {
  var cardContent = deals.map(function(deal, i) {
    var n = i + 1;
    return n + '. (' + deal.dates + ') ' + deal.title + ' ' + ' from ' + deal.price +' '+ deal.link;
  }).join('\n');


  console.log("Card Speech: "+ cardContent);

  return cardContent;
}

module.exports = intents;
