
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('./publish-module');

//var http = require('request');
//var fs = require('fs');

debug("Publishing By Page Id[ <page id>---<attachemnt>]");
publishModule.sync("c:/content/62392330---resource.svg", function() {
  console.log("Published");
});


debug("Publishing by Page Title[ <page name>---<attachment>]");
publishModule.sync("c:/content/Standards---resource.svg", function() {
  console.log("Published");
});
