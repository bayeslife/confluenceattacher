
var debug = require('debug')('getcontent');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('./publish-module');


debug("GetContent");
publishModule.getPageContent("63074138", function(res) {
  console.log(res);
});
