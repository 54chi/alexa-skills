#Alexa Skill for Hopper Deals

## Scrap notes:
1) Besides Amazon's Alexa Kit Use Hacker News skill as a template (from miguelmota.com)

Basic tutorial:
https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function
https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/understanding-the-smart-home-skill-api
https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/testing-an-alexa-skill
https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-voice-design-handbook

Super simple Cheerio usage:
  var cheerio = require('cheerio');
  var request = require('request');

  request('https://julieanns.com/flavor-of-the-day-calendar/', function(err, res, html) {
    if (!err && res.statusCode === 200) {
      var $ = cheerio.load(html);
      var flavors = $('.evcal_desc.evo_info')
        .map(function(index, flavor) {
          var $flavor = $(flavor);
          return {
            name: $flavor.children('.evcal_event_title').text(),
            description: $flavor.children('.evcal_event_subtitle').text(),
          };
        }).toArray();
      flavors.forEach(function(flavor) {
        console.log(flavor);
      });
    }
  });

Setup/store email using Amazon's DynamoDB:
https://github.com/toyhammered/alexa-skills/tree/master/dailyCutiemals/src



## Examples
### Dialog model:
    User: "Alexa, ask Hopper Deals for cheap tickets from Chicago to Europe"
  or
    User:  "Alexa, open Hopper Deals"
    Alexa: "Welcome to Hopper Deals. Are you planning to depart from Chicago?"
    User:  "Yes"
    Alexa: "Ok. Where would you like to go?"
    User:  "Europe"
  or
    User:  "Alexa, open Hopper Deals"
    Alexa: "Welcome to Hopper Deals. Are you planning to depart from Chicago?"
    User:  "No, from Denver"
    Alexa: "Ok. Where would you like to go?"
    User:  "Europe"
  or
    User:  "Alexa, open Hopper Deals"
    Alexa: "Welcome to Hopper Deals. Are you planning to depart from Chicago?"
    User:  "No"
    Alexa: "Got it. Where are you planning to depart from?"
    User:  "Denver"
    Alexa: "Ok. Where would you like to go?"
    User:  "Europe"

    Alexa: "Searching"

    Alexa: "Here are the top deals from Chicago to Europe. The top deal is to <city name> from <start date> to <end date> for $<dollar amount>. Would you like to get more info on this deal?"
    User:  "no"
    Alexa: "The second deal is .... Would you like to get more info on this deal?"
    User : "yes"|"sure"|"yep"|"why not?"|"okay"
    Alexa: "Ok. I've sent you an email with more information. Would you like to hear more deals?"
    User : "no"

    User: "Alexa, change the destination"
    Alexa: "Ok. Where would you like to go?"
    User:  "Mauritus"

    User: "Alexa, let's do a new search"


    User: "Alexa, quit Hopper Deals"
    User: "Alexa, Exit"

    User: "Cancel"
