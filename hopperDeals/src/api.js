'use strict';
var _ = require('lodash');
var Q = require('q');
var cheerio = require('cheerio');
var utils = require('./utils');

var debug = false; //turn it to false if you want to reduce the number of console.logs

//Base Search URL (in this case, we're using Hopper, but I may change this later)
var baseUrl= 'http://www.hopper.com';
var baseUrlFeed= baseUrl+'/flights/feed';
/* PARAMS
  departure_day=&
  departure_flex=3:3&
  destination=region%2F1uw0%2Cregion%2F25Cs%2Ccity%2FSEA&
  origin=city%2FCHI&
  return_day=&
  return_flex=3:3&
  deal_level=10
*/
var apiUrls = {newDeals: baseUrlFeed + '?'};  //put this in an array in case I decide to add URLs in the future (keep it clean)
var pendingPromises = {};                 //this array will be used for async calls
var api = {
  // Hopper results already groups the flights to the same destination under the same group
  // so you don't end up having repeated cities and all that overhead.
  // Since there are less results, the best approach is that each result from the getDeals API call is "paginated"
  // so the user can execute commands on them without having to remember any kind of sorting order

  // ******************************************************
  // FUNCTION api.parsePage: Screen Scrapping (using cheerio)
  // as of 05/09/2016, Hopper puts all the Explorer search results under:
  // div#feed > div.flights > div.flight etc. etc.
  // "magic-box" is the class used to insert ads
  parsePage: function(page, type) {
    var $ = cheerio.load(page);
    var $feed = $('#feed');
    var $results = $feed.find('.flight:not(.magic-box)');
    if (debug) console.log("ParsePage: Found "+ $results.length + " trip deals.");
    var deals = [];
    //populate the deals array
    $results.each(function() {
      // E.g. title: Seattle, Washington
      //      dates: At least 1 flight found (or "Sat Jul 2 to Sun Jul 24" depending on the screen level of detail)
      //      price: $417 (includes the dollar sign)
      //      link:  /flights/feed?deal_level=100.0&amp;departure_day=&amp;departure_flex=3%3A3&amp;departure_month=&amp;destination=airport%2FSEA&amp;origin=city%2FCHI&amp;return_day=&amp;return_flex=3%3A3&amp;stay=22
      // there are other values of course, but I don't need them
      //the regex could be done more efficiently, but I'll leave there for now in case there are changes in the HTML in the future
      var $title = $(this).find('.destination-container').text().replace(/(\r\n|\n|\r)/gm,"");
      var $price = $(this).find('.price').text().replace(/(\r\n|\n|\r)/gm,"");
      var $dates = $(this).find('.dates').text().replace(/(\r\n|\n|\r)/gm,"");
      var $link = $(this).find('.show-more').attr('href');
      var $airports = $(this).find('.route').text().replace(/(\r\n|\n|\r)/gm,"");
      // in case the page is too specific, we'll just return the shop page URL (though it may not work on the browser)
      if (typeof $link=='undefined') $link=baseUrl+$(this).find('.shop').attr('href');

      var deal = {
        title:    $title,
        price:    $price,
        dates:    $dates,
        link:     $link,
        airports: $airports
      };
      deals.push(deal);
    });
    return deals;
  },


  // ******************************************************
  // FUNCTION getDeals: parse the options from the intent, build the URL and triggers the response handlers
  // it uses deffered calls to keep the thing fluid (I expect)
  getDeals: function(options) {
    //build the URL parameters with the provided options
    if (!(options instanceof Object)) {
      options = {};
    }
    var defaults = {
      type: 'new',
      page: 1,
      departure_flex:'3:3',
      destination:'region/1uw0,region/25Cs,city/SEA',
      origin:'city/CHI',
      return_flex: '3:3',
      deal_level: '10'
    };
    _.defaults(options, defaults);  //lodash underscore function that merges the options with the defaults to make sure we won't miss any default value
    var dealType = options.type + 'Deals';
    var typeUrl = apiUrls[dealType];
    typeUrl +=  "departure_day=&departure_flex="+options.departure_flex
            + "&destination="+options.destination
            + "&origin="+options.origin
            + "&return_day=&return_flex="+options.return_flex
            + "&deal_level="+options.deal_level;
    if (debug) console.log("getDeals: URL to fetch is "+ typeUrl);

    // create a deffered function call to manage async events (aka: open the hopper page)
    var deferred = Q.defer();
    var pendingPromiseHash = dealType + '-' + options.toString();   //simple unique ID for the promise
    var fn = function() {
      pendingPromises[pendingPromiseHash] = utils.http.get(typeUrl);
      pendingPromises[pendingPromiseHash].then(function(page) {
        handleResponse(page);   //once the request is executed, execute this success callback
      }).catch(handleFailure);  //otherwise, execute the error callback
      return pendingPromises[pendingPromiseHash];
    };
    utils.queue.enqueue(fn);    //queue the calls, in case there is more than one in progress

    //promise's success callback
    var handleResponse = function(page) {
      var deals = this.parsePage(page, options.type);
      deferred.resolve(deals);
    }.bind(this);

    //promise's error callback
    var handleFailure = function(error) {
      console.error(error);
      deferred.reject(error);
    };
    return deferred.promise;  //return the deferred value to the caller (e.g. the intent)
  },
};
module.exports = api;
