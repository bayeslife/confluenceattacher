
var pages = require('./pages.js')

var population = require('./population.js')

var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");
var _ = require("underscore");

var pagemap = {};
_.each(pages.children,function(page){
  pagemap[page.title] = page.id
})


_.each(population,function(member){
  if(!member.pageId){
    var pageid = pagemap['RFS '+member.name];
    member.pageId = pageid;
    member.label = "ResourceFacingService"+member.name
  }
})

console.log(population);
