
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');

//var http = require('request');
//var fs = require('fs');

debug("Getting page labels");
publishModule.getPageLabels("63918717").then(function(labels) {
  console.log(labels);
});


debug("Setting page labels");
publishModule.updatePageLabels("Fixed","63918717",[
  "ProductSpecificiationESNEnterprisePriority",
     "ProductSpecificiationESNHazmat",
     "ProductSpecificiationESNMissionCriticalConnectivity",
     "ProductSpecificiationESNRadioIPNetwork",
     "ProductSpecificiationGNETConnectLite",
     "ProductSpecificiationGNETDataCentreInterconnect",
     "ProductSpecificiationGNETDataCentreSwitching",
     "ProductSpecificiationGNETMicrowave",
     "ProductSpecificiationGNETSatellite",
     "ProductSpecificiationGNETServiceConnect",
     "ProductSpecificiationHighAvailability",
     "ProductSpecificiationNONIAASCentreConnect",
     "ProductSpecificiationVodafoneManagedNetworkServices",
     "ProductSpecificiationCommunityConnect",
     "ResourceFacingServiceMetroLite",
     "ResourceFacingServiceBIA",
     "ResourceFacingServiceMetroAccess",
     "ResourceFacingServiceSatellite",
     "ResourceFacingServiceMicrowave",
     "ResourceFacingServiceBusinessBroadband",
     "ResourceFacingServiceHSNS"
  ]
).then(function() {
  console.log("Updated");
});
//
// debug("Remove page labels");
// publishModule.removePageLabels("62397456","foo").then(function() {
//   console.log("Removed");
// });
