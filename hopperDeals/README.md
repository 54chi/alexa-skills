#Alexa Skill for Hopper Deals

## Scrap notes:
1) Besides Amazon's Alexa Kit Use Hacker News skill as a template (from miguelmota.com)
2) npm test <-- make sure that "tape" is installed globally

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


## About this project
Find [Hopper Deals](http://www.hopper.com/) from anywhere to anywhere. Hopper doesn't provide an open API, and there weren't many travel apps at the time of this writing, so I thought it would made for a nice project.

This sample project shows how to create a Lambda function for handling Alexa Skill requests with:

- User info: Using the amazon account as a key, store user's preferences in a Database (e-mail and point of origin)
- Screen scrapper: Using Cheerio
- Session State: Handles a multi-turn dialog model.
- Custom slot type: demonstrates using custom slot types to handle a finite set of known values
- SSML: Using SSML tags to control how Alexa renders the text-to-speech.
- Support i18n (for future usage and better message configuration)

File structure:
- index.js is the starter generic file (e.g. the App is called "App" :))
- /lib contains the Amazon libraries (AlexaSkill.js)
- /src contains the intents and configured dialogs (via i18n)
- /test contains the test files (using tape for simplicity)

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

## Testing the project

To test, get all dependencies via npm install and then do:

```
npm test
```

## Notes

For educational purposes only. All data stored and retrieved will never be sold nor used for anything really. Analytics may be captured on the Hopper site, but they will be for the Alexa skill, not individual users.

Keep in mind that Hopper deals are basically crowd-sourced, so it can't guarantee you the best deal ever, though it will consistently recommend you better deals than average travel sites (IMHO). If there is demand/need for it, I may upgrade the email link to redirect you to a booking site (e.g. skyscanner's or google's) so you get the most accurate price, along other alternatives.

I may also like to offer some airbnb options through their API (https://api.airbnb.com/), but I'm not totally sure how to do the UX for the interaction yet (e.g. my own preference is to pick a place NEAR a specific place I want to visit -- e.g. within a city, but that is not too expensive nor in a dangerous area).

For reporting bugs or suggestions, please email 54chiMaster@gmail.com

## Credits

This Alexa Skill code is a compilation of the following projectS:
- Miguel Mota's Hacker News skill, for the screen scrapping
- Toy Hammered's dailyCutiemals, for the email functionality

List of airports/city from https://gist.github.com/tdreyno/4278655

Everything else is based from the NPM packages documentation.
