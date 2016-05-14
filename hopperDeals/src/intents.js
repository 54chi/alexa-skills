'use strict';
var _ = require('lodash');
var pluralize = require('pluralize');
var capitalize = require('capitalize');
var api = require('./api');
var i18n = require('./i18n');
var iata = require('./iata');
var debug = true;  //turn it to false if you want to reduce the number of console.logs

//pagination stuff
var PAGINATION_SIZE = 4;

// The intents that the Alexa skill will Support
// the ones that start with "AMAZON" are standard ones

/* FOR FUTURE INTERACTIONS:
AddEmail
DeleteEmail
AddHomeCity
EmailMe
StartOver
Repeat
*/
var intents = {
  'AMAZON.HelpIntent': HelpIntent,
  'AMAZON.YesIntent': YesIntent,
  'AMAZON.NoIntent': NoIntent,
  'AMAZON.CancelIntent': CancelIntent,
  'AMAZON.StopIntent': StopIntent,
  'AMAZON.RepeatIntent': RepeatIntent,
  HopperExplorerIntent: ReadNewDealsIntent
};

// FUNCTION: HelpIntent: help message
function HelpIntent(intent, session, response) {
  var speech = i18n.helpInstructions + ' ' + i18n.seeHelpCard + ' ' + i18n.helpPrompt;
  var cardTitle = i18n.help;
  var cardContent = i18n.helpInstructions + ' ' + i18n.helpContact;
  response.askWithCard(speech, i18n.helpInstructions, cardTitle, cardContent);
}

// FUNCTION: YesIntent: this is used to "paginate" through the results
// invokes readNextDeals to paginate
function YesIntent(intent, session, response) {
  return readNextDeals(intent, session, response, {
    type: 'new'
  });
}

// FUNCTION: RepeatIntent: repeat the same page
// reduces the page attribute counter and repeats the readNextDeals
function RepeatIntent(intent, session, response) {
  session.attributes.page=(session.attributes.page<1)?1:(session.attributes.page-1);
  return readNextDeals(intent, session, response, {
    type: 'new'
  });
}

// FUNCTIONs: NoIntent, CancelIntent, StopIntent: exits the app
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

/*
FUNCTION: ReadNewDealsIntent: invokes readDeals to get the latest deals based on passed parameters
    &origin=city%2FCHI
    &destination=region/20oH,region/26m5,region/2CIv,region/25Cs,region/1uw0,country/2BFn,region/2FyS //ANYWHERE IN THE WORLD
    &departure_day=
    &departure_flex=3%3A3
    &return_day=
    &return_flex=3%3A3
    &departure_month=
    &stay=22
    &commit=Find+Flights
*/
function ReadNewDealsIntent(intent, session, response) {
  return readDeals(intent, session, response, {
    type: 'new',
    origin: getOriginFromIntent(intent,true),
    destination: getDestinationFromIntent(intent, true)
  });
};

//FUNCTION makePageCards: creates a sub-array of the results, for pagination
var makePageCards=function(session){
  var pageDeals =[];
  for (var i = (session.attributes.page-1)*PAGINATION_SIZE; i < (session.attributes.page)*PAGINATION_SIZE; i++) {
    if(i<session.attributes.deals.length){
      pageDeals.push(session.attributes.deals[i])
    };
  };
  return pageDeals
};

//FUNCTION: readNextDeals: retrieves the next list of deals
function readNextDeals(intent, session, response, options) {
  var type = options.type;
  session.attributes.dealType = type;
  var cardTitle = i18n[type + 'Deals'];
  if (typeof session.attributes.page=='undefined') session.attributes.page=0;
  var speech = i18n.noDeals;

  var nextOrLatest = (session.attributes.page+1) >= session.attributes.pages ? i18n.speechDealsLast : session.attributes.page>0?i18n.speechDealsNext:i18n.speechDealsFirst;
  session.attributes.page++;
  var pageDeals=makePageCards(session);
  var cardContent = generateDealsCardContent(pageDeals);
  var startDealsSpeech = i18n.speechDealsStart + nextOrLatest + i18n.speechDealsEnd;

  if (cardContent.length > 1) {
    var speech = startDealsSpeech + ', ' + generateDealSpeech(pageDeals) + '. ' + i18n.hearMoreDeals;
    if (debug) console.log(speech);
    session.attributes.readMore = true;
    response.askWithCard(speech, i18n.hearMoreDeals, cardTitle, cardContent);
  };
  return speech;
};

//FUNCTION: readDeals: calls the API to get the deals
function readDeals(intent, session, response, options) {
  var type = options.type;
  session.attributes.dealType = type;
  if (debug) console.log(options);
  return api.getDeals(options).then(function(deals) {
    // get the first page
    session.attributes.page=0;
    session.attributes.deals=deals;
    session.attributes.pages=(deals.length/PAGINATION_SIZE);
    return readNextDeals(intent,session,response,options);
  }).catch(function(error) {
    response.tell(i18n['errorRetrieving' + capitalize(type) + 'Deals']);
    return error;
  });
}

/*
title: $title,
price: $price,
dates: $dates,
link:  $link;
airports : $airports
*/
//FUNCTION generateDealSpeech: Creates the Alexa Spoken message
function generateDealSpeech(deals) {
  var speech = deals.map(function(deal, i) {
    var initialText = i18n.nextDeal;
    if (i === 0) {
      initialText = i18n.firstDeal;
    }
    if (deals.length - 1 === i) {
      initialText = i18n.lastDeal;
    }
    return initialText + ': ' + deal.airports + ' to ' + deal.title + ', from ' + deal.price + '.';
  }).join('\n');
  //console.log("Deal Speech: "+ speech);
  return speech;
}

//FUNCTION generateDealsCardContent: Creates the Alexa Card message
function generateDealsCardContent(deals) {
  var cardContent = deals.map(function(deal, i) {
    var n = i + 1;
    return n + '. To: ' + deal.title + ' from ' + deal.price +' ('+ deal.airports +'). Link:'+ deal.link;
  }).join('\n');
  //console.log("Card Speech: "+ cardContent);
  return cardContent;
}

/**
 * Gets the origin from the intent, or returns an error
 */
function getOriginFromIntent(intent, assignDefault) {
    var originSlot = intent.slots.USCity;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!originSlot || !originSlot.value) {
        if (!assignDefault) {
            return '';
        } else {
            // For sample skill, default to Seattle.
            return iata.getCode('seattle');
        }
    } else {
        return iata.getCode(originSlot.value);
    }
}

/**
 * Gets the destination from the intent, or returns an error
 */
function getDestinationFromIntent(intent, assignDefault) {
    var destinationSlot = intent.slots.Continent;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!destinationSlot || !destinationSlot.value) {
        if (!assignDefault) {
            return '';
        } else {
            return iata.getCode('outside US');
        }
    } else {
        return iata.getCode(destinationSlot.value);
    }
}

module.exports = intents;
