
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('./publish-module');

var http = require('request');
var fs = require('fs');

var spaceName=process.argv[2];

var parentName=process.argv[3];

var pageName=process.argv[4];

var apiFileName = process.argv[5];

debug("Publishing");
publishModule.publish(spaceName,parentName,pageName,apiFileName);
