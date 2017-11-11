
var cfs = require('./cfs.js');
var cfs2 = require('./delme.js');

var _ = require('underscore');

var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');

//var http = require('request');
//var fs = require('fs');
//
// debug("Getting page children");
// publishModule.getPageChildren("63915652").then(function(descendant) {
//   console.log(JSON.stringify(descendant,null," "));
// });

// debug("Getting page descendant");
// publishModule.getPageDescendents("64225628").then(function(descendant) {
//   console.log(JSON.stringify(descendant,null," "));
// });


var c = {};
_.each(cfs,function(each){
   c[each.pageId] = each.name;
})

var del = []
_.each(cfs2.children,function(each){
  if(!c[each.id]){
    console.log("Del"+ each.title)
    publishModule.deletePage(each.id).then(function() {
    });
  }
})
