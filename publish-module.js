
var debug = require('debug')('publishModule');
var path = require('path');
var Promise = require("bluebird");

var http = require('request');
var fs = require('fs');

var xml2js = require("xml2js");
var striptags = require('striptags');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

confluenceurl = process.env.CONFLUENCEURL;
//"http://"+username+":"+password+"@confluence.com;

console.log(process.env.PROXYURL);
proxy = process.env.PROXYURL;
//proxy = "http://"+username+":"+password+"@"+proxyHost+":"+proxyPort;

function context(s,pr,pg,fn){

var spaceName=s;
var parentName=pr;
var pageName=pg;
var apiFileName=fn;

var queryContainerPage = function(){
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

var getAPIPage= function (){
   debug("Get API Page:");
   return new Promise(function(resolve,reject){
     http.get({
       url: confluenceurl+"/rest/api/content/"+pageName,
       proxy: proxy
     }, function(err,resp,body){
       if(err==null && resp.statusCode!=404){
          debug("Found API Page:");
           var pageId = pageName;
           resolve(pageId);
       }else {
         console.log(err);
         resolve(null);
       }
     });
   });
 };

var queryAPIPage = function(pageId,pageName){
    return new Promise(function(resolve,reject){
      if(pageId!=null){
        resolve(pageId);
      }else {
        debug("Finding API Page by title:"+ pageName);
      http.get({
        //url: confluenceurl+"/rest/api/content?title="+pageName,
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
    }
  });

};


var getPageVersion =function (pageId){
    return new Promise(function(resolve,reject){

      var url = confluenceurl+"/rest/api/content/"+pageId+"?expand=version";
      debug("Get Page Version:"+pageId);
      debug("Confluence Url:"+ url);
      debug("Proxy"+ proxy);
      http.get({
        url: url,
        proxy: proxy
      }, function(err,resp,body){
        if(err==null){
            var b = JSON.parse(body);
            var version  = b.version.number;
            resolve(version);
        }else {
          resolve(null);
        }
    });
  });
};

var createPage = function(spaceName,containerPageId,pageId,pageName){
  return new Promise(function(resolve,reject){
    if(pageId!=null)
      resolve(pageId);
    else {
      debug("Creating Page");
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
        if(err!=null){
          reject();
        }
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

var updatePage = function(spaceName,pageName,pageId,pageVersion,content){
  return new Promise(function(resolve,reject){
    debug("Updating Page+"+ pageId)
      var page = {
        "type":"page",
        "title":pageName,
        "version" : {
          "number": pageVersion+1
        },
        "body":{
            "storage":{
               "value": content,
               "representation":"storage"
            }
         }
      };

      http.put({
          url: confluenceurl+"/rest/api/content/"+ pageId,
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


  })
}

var queryAttachment = function(pageId){
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


var createAttachment = function(data){
    return new Promise(function(resolve,reject){
      debug("createAttach");
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

var updateAttachment = function(data){
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
  return {
     queryContainerPage: queryContainerPage,
     getAPIPage: getAPIPage,
     queryAPIPage: queryAPIPage,
     getPageVersion: getPageVersion,
     createPage: createPage,
     updatePage: updatePage,
     queryAttachment: queryAttachment,
     createAttachment: createAttachment,
     updateAttachment: updateAttachment
  }

}

function getPageContent(pageId){
    return new Promise(function(resolve,reject){
      var url = confluenceurl+"/rest/api/content/"+pageId+"?expand=body.storage";
      debug("Get Page:"+pageId);
      debug("Confluence:"+ url);
      debug("Proxy"+ proxy);
      http.get({
        url: url,
        proxy: proxy
      }, function(err,resp,body){
        try{
        if(err==null){
            var b = JSON.parse(body);
            var xml  = b.body.storage.value;
            var content = striptags(xml);
            console.log(content);
            resolve({ title: b.title,body: content});
        }else {
          resolve(null);
        }
      }catch(exception){
        res(exception)
      }
    });
  });
};

function publish(spaceNm,parentNm,pageNm,apiFileNm) {

  // spaceName = spaceNm;
  // parentName = parentNm;
  // pageName = pageNm;
  // apiFileName = apiFileNm;

  var c = context(spaceNm,parentNm,pageNm,apiFileNm)

  debug('Publishing:'+apiFileNm)

  var containerPageId = null;

  var baseName = path.basename(apiFileName);
  debug('basename:'+baseName)

    if(baseName.indexOf('---')>0){
      debug("Page Name derived as:"+pageName);
    }

    c.queryContainerPage()
      .then(c.queryAPIPage)
      .then(c.createPage)
      .then(c.queryAttachment)
      .then(c.createAttachment)
      .then(c.updateAttachment)
      .then(function(pageId){
        debug("Attached To Page");
      });
}

function sync(apiFileNm,cb) {
  debug("Sync");
  //apiFileName = apiFileNm;
  var baseName = path.basename(apiFileNm);
  pageName = baseName.substring(0,baseName.indexOf('---'));

  var c = context(null,null,pageName,apiFileNm)
  c.getAPIPage()
    .then(c.queryAPIPage)
    .then(c.queryAttachment)
    .then(c.createAttachment)
    .then(c.updateAttachment)
    .then(function(pageId){
      debug("Attached To Page");
      if(cb)
        cb();
    });
}

function get(pageId) {
  debug('Get Page:'+ pageId);
  var c = context();
  c.getPageVersion(pageId)
    .then(function(body){
        console.log(body);
    });
}

function syncContent(spaceNm,containerPgId,pgId,pageNm,theContent,cb) {
  debug("SyncContent");

  var c = context()

  var spaceName = spaceNm;
  var pageName = pageNm;
  var containerPageId = containerPgId;
  var pageId = pgId;
  var content = theContent;
  var pageVersion = 0;

  c.createPage(spaceName,containerPageId,pageId,pageName)
    .then(function(pgId){ pageId=pgId })
    .then(function(){return c.getPageVersion(pageId)})
    .then(function(pgVersion){pageVersion=pgVersion})
    .then(function(){return c.updatePage(spaceName,pageName,pageId,pageVersion,content)})
    .then(function(pageId){
      debug("Content Updated");
      cb(pageId);
    });
}

module.exports = {
  sync: sync,
  publish: publish,
  get: get,
  syncContent: syncContent,
  getPageContent: getPageContent
}
