var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');


var xml2js = require('xml2js');

var processors = require('xml2js/lib/processors.js');

var Promise = require('bluebird');

var jsonxml = require('json-to-xml');

var cxs = require("../../../vdfn-repo/generated/ServiceCatalogue/src/main/data/population/CX-population.CustomerExperience.json")

var getWidgetContent = function(label,pageId){

  var cfs_page_id = "63915652";
  //var cql = "label = \"cxenterpriseapplicationaccess\" and ancestor = \"63915652\"";
  var cql = "label = \""+label+"\" and ancestor = \""+cfs_page_id+"\"";

  var widget =  {
    "$": {
     "ac:type": "three_equal"
    },
    "ac:layout-cell": [
     {
      "p": [
       {
        "strong": [
         "Related Customer Facing Services"
        ]
       },
       {
        "ac:structured-macro": [
         {
          "$": {
           "ac:macro-id": "ed997e27-830c-4f14-a473-9b5b0ba30b53",
           "ac:name": "contentbylabel",
           "ac:schema-version": "2"
          },
          "ac:parameter": [
           {
            "_": "false",
            "$": {
             "ac:name": "showLabels"
            }
           },
           {
            "_": "false",
            "$": {
             "ac:name": "showSpace"
            }
           },
           {
            "_": cql,
            "$": {
             "ac:name": "cql"
            }
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "p": [
       " "
      ]
     },
     {
      "p": [
       " "
      ]
     }
    ]
   }

   return widget;
}

var engine = jsonxml.createEngine();

//var pageId = "66709862"

var updatePageAddWidget = function(pageId,label,content) {
  return new Promise(function(res,rej){
    //console.log(content);

    console.log("Updating Page:"+pageId)

    //var options = {tagNameProcessors: [processors.stripPrefix]};
    var options={};
    xml2js.parseString(content.body,options,function(err,json){

        if(!json['ac:layout']){
          console.log("No layout in page:"+pageId);
          res("failure"+pageId);
        }else {
          //console.log(JSON.stringify(json,null," "));
          var sections = json['ac:layout']['ac:layout-section']
          console.log(sections.length);

          var widget =getWidgetContent(label,pageId);
          var newsections = sections.push(widget);

          //json['ac:layout']['ac:layout-section'] = newsections;
          //var sections = json['ac:layout']['ac:layout-section']
          //console.log(sections.length);

          //var newcontentstring = JSON.stringify(json,null,"");
          //console.log(newcontentstring);

          //var newjson = JSON.parse(n);

          var newcontent = engine.write(json);
          //console.log(newcontent);

          publishModule.syncContent(null,null,pageId,content.title,newcontent,function(){
              res("Success");
          })
        }
        })
  })
}

cxs.forEach(function(cx){
  var pageId = cx.pageId;
  var label = cx.label;
  debug("Getting page content");
  publishModule.getPageContent(pageId)
    .then(function(content){
      return updatePageAddWidget(pageId,label,content)
    })
    .then(function(result){
      console.log(result);
    })

})
