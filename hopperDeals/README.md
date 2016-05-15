#Alexa Skill for Hopper Explorer

## About this project
Find [Hopper Deals](http://www.hopper.com/) from anywhere to anywhere. Hopper doesn't provide an open API, and there weren't many travel apps at the time of this writing, so I thought it would made for a nice project.

This skill solves my needs as a Digital Nomad wannabe: find a country to travel to for a very good price, without worrying too much exact dates or airline carrier (at least as a starting point).

The project shows how to create a Lambda function for handling Alexa Skill requests with:

- TODO: User info: Using the amazon account as a key, store user's preferences in a Database (e-mail and point of origin)
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
### Sample Utterances:
```
HopperExplorerIntent for travel deals from {USCity} to {Continent}
HopperExplorerIntent for travel deals from {USCity}
HopperExplorerIntent for travel deals to {Continent}
HopperExplorerIntent from {USCity} to {Continent}
HopperExplorerIntent from {USCity} to the {Continent} continent
HopperExplorerIntent new deals from {USCity} to {Continent}
HopperExplorerIntent what are the cheapest flights from {USCity} to {Continent}
HopperExplorerIntent show me the best flights from {USCity} to {Continent}
```

## Testing the project

To test the code, get all dependencies via npm install and then do:

```
npm test
```

To test the skill, keep in mind the following considerations:
- Make sure that the you use a **US City** as the origin. The slot type is the AMAZON.US_CITY default one after all.
- Make sure the destination is a **continent**.

Sample flow:

1) "Alexa, open HopperExplorer"
2) "new deals from Chicago to Europe"
(the skill should return the first page of results)
3) After the first page is retrieved, you can say:
  3.1) "Yes" to retrieve the next page
  3.2) "Repeat" to repeat the page results
  3.3) "No" to cancel

The skill also accept some variations, like: "HopperExplorer from Atlanta to the Asian continent".
You can also use "anywhere" as the continent, which will also include US cities in the search results, plus anywhere else in the World.

The default values for the US City is **"Seattle"**, and for the Continent is **"Outside US"** (which is anywhere in the world except US)

# To do:

- Save the point of origin in a Database.
- Extend the USCIty slot to include other cities around the World.
- Save the users' emails and send the results via e-mail. In the meantime, the result could be seen in the Alexa App's cards.

## Notes

For educational purposes only. All data stored and retrieved will never be sold nor used for anything really. Analytics may be captured on the Hopper site, but they will be for the Alexa skill, not individual users.

Keep in mind that Hopper deals are basically crowd-sourced, so it can't guarantee you the best deal ever, though it will consistently recommend you better deals than average travel sites (IMHO). If there is demand/need for it, I'll upgrade the email link to redirect you to a booking site (e.g. skyscanner's or google's), but for now it's up to you to go check the deals yourself.

Alexa skill for cities is currently constrained to US only. I may add my own list later, but I need to build the different ways to call for cities, e.g. "Mexico D.F" vs "Mexico City", all those "Saint" vs "St.", dashes, commas, apostrophes, etc. etc.

PS. The skill secretly supports cities as destinations, but the results are not as good (e.g. 10 results for the same airlines, with the same price but different days, which is not what I wanted, user-experience wise).

PS2. Kayak just published its own official skill.

For reporting bugs or suggestions, please email 54chiMaster@gmail.com

## Credits

This Alexa Skill code is a compilation of the following projectS:
- Miguel Mota's Hacker News skill, for the screen scrapping
- Toy Hammered's dailyCutiemals, for the email functionality (which I may use eventually, at least to store the point of origin)

The list of airports/city from http://codepen.io/mochiron/pen/ONGjwz and modified with continents list.

Everything else is based from the NPM packages documentation.
