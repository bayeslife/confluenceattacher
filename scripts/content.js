
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');

//var http = require('request');
//var fs = require('fs');

debug("Getting page content");
publishModule.getPageContent("63918536").then(function(descendant) {
  console.log(descendant);
});
