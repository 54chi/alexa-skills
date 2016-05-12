'use strict';

var _ = require('lodash');
var request = require('request');
var Q = require('q');
var cheerio = require('cheerio');

var baseUrl= 'http://www.hopper.com/flights/feed';
var baseApiUrl = 'https://hacker-news.firebaseio.com/v0';
/* PARAMS
  departure_day=&
  departure_flex=3:3&
  destination=region%2F1uw0%2Cregion%2F25Cs%2Ccity%2FSEA&
  origin=city%2FCHI&
  return_day=&
  return_flex=3:3&
  deal_level=10


newDeals: baseUrl + '?departure_day=&departure_flex=3%3A3&destination=region%2F1uw0%2Cregion%2F25Cs%2Ccity%2FSEA&origin=city%2FCHI&return_day=&return_flex=3%3A3&deal_level=10',
showDeals: baseUrl + '/show',
askDeals: baseUrl + '/ask',
jobDeals: baseUrl + '/jobs',
bestDeals: baseUrl + '/best',
activeDeals: baseUrl + '/active',
noobDeals: baseUrl + '/noobdeals',
deal: baseApiUrl + '/item/{id}}.json'
*/
var apiUrls = {
  newDeals: baseUrl + '?'
};

var pendingPromises = {};

var queue = {
  inProgress: false,

  queue: [],

  enqueue: function(fn) {
    this.queue.push(fn);

    if (!this.inProgress) {
      this.dequeue();
    }
  },

  dequeue: function() {
    if (this.inProgress) {
      return false;
    }

    var fn = this.queue.shift();

    if (typeof fn === 'function') {
      var promise = fn();
      if (typeof promise === 'object') {
        this.inProgress = true;
        return promise.then(function() {
          this.inProgress = false;
          this.dequeue();
        }.bind(this)).catch(function() {
          this.inProgress = false;
          this.dequeue();
        }.bind(this));
      }
    }
  }
};

var http = {
  get: function(url) {
    var deferred = Q.defer();

    request({
      url: url
    }, function(error, response, body) {
      if (error) {
        deferred.reject(error);
        return false;
      }

      deferred.resolve(body);
    });

    return deferred.promise;
  }
};

var api = {
  /**
   * Parsing page is faster than making a call
   * to each individual deal.
   */
  parsePage: function(page, type) {
    if (page.length < 600) {

    }
    var $ = cheerio.load(page);

    var $feed = $('#feed');

    var $results = $feed.find('.flight');
    console.log("Found "+ $results.length + " trip deals.");

    var deals = [];

    $results.each(function() {
//      console.log(" ##########"+ $(this).find('.destination').text().replace(/(\r\n|\n|\r)/gm,"") +"#############");

      var $title = $(this).find('.destination').text().replace(/(\r\n|\n|\r)/gm,"");
      var $price = $(this).find('.price').text().replace(/(\r\n|\n|\r)/gm,"");
      var $dates = $(this).find('.dates').text().replace(/(\r\n|\n|\r)/gm,"");
      var $link = $(this).find('.show-more').attr('href');

      var deal = {
        title: $title,
        price: $price,
        dates: $dates,
        link:  $link
      };
      deals.push(deal);
    });

    return deals;
  },

  getDeal: function(id) {
    if (typeof id !== 'number') {
      return Q.reject(new TypeError('`id` must be a number.'));
    }

    return http.get(apiUrls.deal);
  },


//  newDeals: baseUrl + '?departure_day=&departure_flex=3%3A3&destination=region/1uw0,region/25Cs,city/SEA&origin=city/CHI&return_day=&return_flex=3%3A3&deal_level=10',

  getDeals: function(options) {
    var deferred = Q.defer();

    if (!(options instanceof Object)) {
      options = {};
    }

    var defaults = {
      type: 'new',
      count : 10,
      departure_flex:'3:3',
      destination:'region/1uw0,region/25Cs,city/SEA',
      origin:'city/CHI',
      return_flex: '3:3',
      deal_level: '10'
    };

    _.defaults(options, defaults);


    var dealType = options.type + 'Deals';  //newDeals
    var pendingPromiseHash = dealType + '-' + options.toString();

    //console.log(pendingPromiseHash);
    var typeUrl = apiUrls[dealType];

    typeUrl = apiUrls.newDeals + "departure_day=&departure_flex=3:3&destination=region%2F1uw0%2Cregion%2F25Cs%2Ccity%2FSEA&origin=city%2FCHI&return_day=&return_flex=3:3&deal_level=10";

    var fn = function() {
      pendingPromises[pendingPromiseHash] = http.get(typeUrl);

      pendingPromises[pendingPromiseHash].then(function(page) {
        handleResponse(page);
      }).catch(handleFailure);

      return pendingPromises[pendingPromiseHash];
    };

    queue.enqueue(fn);
    var handleResponse = function(page) {
      var deals = this.parsePage(page, options.type);

      deferred.resolve(deals);
    }.bind(this);

    var handleFailure = function(error) {
      console.error(error);
      deferred.reject(error);
    };
    return deferred.promise;
  },
};

module.exports = api;
