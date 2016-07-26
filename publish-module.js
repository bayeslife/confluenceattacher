
var debug = require('debug')('publishModule');
var path = require('path');
var Promise = require("bluebird");

var http = require('request');
var fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

confluenceurl = process.env.CONFLUENCEURL;
//"http://"+username+":"+password+"@confluence.com;

console.log(process.env.PROXYURL);
proxy = process.env.PROXYURL;
//proxy = "http://"+username+":"+password+"@"+proxyHost+":"+proxyPort;

var spaceName=null;
var parentName=null;
var pageName=null;
var apiFileName=null;

function queryContainerPage(){
   debug("Container Page"+parentName);
   debug("Proxy"+proxy);
    return new Promise(function(resolve,reject){
        http.get({
          url: confluenceurl+"/rest/api/content?title="+parentName,
          proxy: proxy
        }, function(err,resp,body){
          console.log(err);
          console.log(body);
            if(err==null){
              var b = JSON.parse(body);
              if(b.results.length>0){
                containerPageId = b.results[0].id;
                debug("Found container page:"+containerPageId);
                resolve ( containerPageId);
              }
            }else {
              console.log("Problem finding container page:"+err);
              reject();
            }
          });
    });
};

function queryAPIPage(parentPageId){
  debug("Finding API Page that is child of parent:"+ parentPageId);
  return new Promise(function(resolve,reject){
    http.get({
      url: confluenceurl+"/rest/api/content?title="+pageName,
      proxy: proxy
    }, function(err,resp,body){
      if(err==null){
        var b = JSON.parse(body);
        if(b.results.length>0){
          var pageId = b.results[0].id;
          debug("Found parent page:"+ pageId);
          resolve(pageId);
        }else {
          resolve(null);
        }
      }else {
        resolve(null);
      }
    });
  });
};

function createPage(pageId){
  return new Promise(function(resolve,reject){
    if(pageId!=null)
      resolve(pageId);
    else {
      var page = {
         "type":"page",
         "title":pageName,
         "ancestors":[{"type":"page","id":containerPageId}],
         "space":{
            "key":spaceName
         },
         "body":{
            "storage":{
               "value":"This page contains API documentation. See the attachments.",
               "representation":"storage"
            }
         }
      };

      http.post({
          url: confluenceurl+"/rest/api/content",
          proxy: proxy,
          headers: {
            "Content-Type": "application/json",
            "X-Atlassian-Token": "nocheck",
          },
          body: JSON.stringify(page)
      },function(err,resp,body){
        if(err!=null)
          reject();
        else{
          console.log(body);
          var pid = JSON.parse(body).id;
          debug("Created Page:"+ pid);
          resolve(pid);
        }
      });
    }

  })
}

function queryAttachment(pageId){
  debug("Finding attachments of page:"+ pageId);
  return new Promise(function(resolve,reject){

    var bn = path.basename(apiFileName);

    debug(confluenceurl+"/rest/api/content/"+pageId+"/child/attachment?filename="+bn);
    http.get({
      url: confluenceurl+"/rest/api/content/"+pageId+"/child/attachment?filename="+bn,
      proxy: proxy
    }, function(err,resp,body){
      if(err==null){
        var b = JSON.parse(body);
        if(b.results.length>0){
          var attachmentId = b.results[0].id;
          debug("Found attachement:"+ attachmentId);
          resolve({pageId: pageId,attachmentId: attachmentId});
        }else {
          debug("No attachment found");
          resolve({pageId: pageId, attachmentId: null});
        }
      }else {
        debug("Problem finding attachment:"+ err);
        reject(err);
      }
    });
  });
};


function createAttachment(data){
    return new Promise(function(resolve,reject){
      if(data.attachmentId!=null){
        debug("No need to create attachment already on page:"+data.attachmentId);
        resolve(data);
      } else {
        debug("Attaching to pageid:"+data.pageId);

        http.post({
              url: confluenceurl+"/rest/api/content/"+data.pageId+"/child/attachment",
              proxy: proxy,
              headers: {
                "Content-Type": "application/json",
                "X-Atlassian-Token": "nocheck",
              },
              formData: {
                file: fs.createReadStream(apiFileName)
              }
          },function(err,resp,body){
            if(err!=null)
              reject(err);
            else {
              resolve(data);
            }
          });
      }
    });
};

function updateAttachment(data){
    return new Promise(function(resolve,reject){
      if(data.attachmentId==null){
        debug("No update as attachment just created:");
        resolve();
      } else{
        debug("Updating attachment to pageid:"+data.pageId+":"+data.attachmentId);

        http.post({
              url: confluenceurl+"/rest/api/content/"+data.pageId+"/child/attachment/"+data.attachmentId+"/data",
              proxy: proxy,
              headers: {
                "Content-Type": "application/json",
                "X-Atlassian-Token": "nocheck",
              },
              formData: {
                file: fs.createReadStream(apiFileName)
              }
          },function(err,resp,body){
            if(err!=null){
              console.log("Error updating"+err);
              reject(err);
            }else {
              debug("update successful");
              resolve();
            }
          });
      }
    });
};

function publish(spaceNm,parentNm,pageNm,apiFileNm) {

  spaceName = spaceNm;
  parentName = parentNm;
  pageName = pageNm;
  apiFileName = apiFileNm;

  debug('Publishing')

  var containerPageId = null;

  var baseName = path.basename(apiFileName);

    if(baseName.indexOf('---')>0){
      debug("Page Name derived as:"+pageName);
    }

    queryContainerPage()
      .then(queryAPIPage)
      .then(createPage)
      .then(queryAttachment)
      .then(createAttachment)
      .then(updateAttachment)
      .then(function(pageId){
        debug("Attached To Page");
      });
}

function sync(apiFileNm,cb) {
  debug("Sync");
  apiFileName = apiFileNm;
  var baseName = path.basename(apiFileName);
  pageName = baseName.substring(0,baseName.indexOf('---'));


  queryAPIPage()
    .then(queryAttachment)
    .then(createAttachment)
    .then(updateAttachment)
    .then(function(pageId){
      debug("Attached To Page");
      cb();
    });
}

module.exports = {
  sync: sync,
  publish: publish
}
