
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');

//var http = require('request');
//var fs = require('fs');

// debug("Getting page children");
// publishModule.getPageChildren("63912999").then(function(descendant) {
//   console.log(descendant);
// });

debug("Getting page descendant");
publishModule.getPageDescendents("66688215").then(function(descendant) {
  console.log(JSON.stringify(descendant,null," "));
});
