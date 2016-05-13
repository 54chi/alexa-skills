'use strict';
var request = require('request');
var Q = require('q');

//QUEUE functions (w/promises)
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

//HTTP functions (to get pages from URL w/promises)
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

module.exports.queue = queue;
module.exports.http = http;
