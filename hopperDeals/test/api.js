'use strict';

var test = require('tape');
var api = require('../src/api');

test('api', function (t) {
  t.plan(1);
  var dealTypes = ['new'];
  dealTypes.forEach(function(type) {
    api.getDeals({
      destination:'city/SEA'
    }).then(function(deals){
      var titles = deals.map(function(deal){
        return deal.title;
      });
      t.ok(titles.length>0, 'Title length is greater than 0');
    });
  });
})
