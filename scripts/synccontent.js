
var debug = require('debug')('publish');
var path = require('path');
var Promise = require("bluebird");

var publishModule = require('../publish-module');

//var http = require('request');
//var fs = require('fs');


var content=' Test \
  <ac:layout> \
    <ac:layout-section ac:type="three_equal"> \
        <ac:layout-cell> \
            <p>Fixed Convergence2</p> \
            <p>&nbsp;</p> \
            <p>&lt;todo content from TaaS Service catalogue.</p> \
            <p>&nbsp;</p> \
            <p>&nbsp;</p> \
            <p>&nbsp;</p> \
            <p>Label:PD2</p> \
        </ac:layout-cell> \
        <ac:layout-cell> \
            <p> \
                <ac:structured-macro ac:macro-id="940ae62b-4754-4fd4-b2cf-bdf9b603f8c3" ac:name="contentbylabel" ac:schema-version="2"> \
                    <ac:parameter ac:name="showLabels">false</ac:parameter> \
                    <ac:parameter ac:name="showSpace">false</ac:parameter> \
                    <ac:parameter ac:name="title">Customer Experiences provided by this product</ac:parameter> \
                    <ac:parameter ac:name="cql">label = &quot;pd2&quot; and ancestor = &quot;63902248&quot;</ac:parameter> \
                </ac:structured-macro> \
            </p> \
        </ac:layout-cell> \
        <ac:layout-cell> \
            <p> \
                <ac:structured-macro ac:macro-id="8a2af581-3916-43bb-83de-f013d08b7b68" ac:name="contentbylabel" ac:schema-version="2"> \
                    <ac:parameter ac:name="showLabels">false</ac:parameter> \
                    <ac:parameter ac:name="showSpace">false</ac:parameter> \
                    <ac:parameter ac:name="title">Services providing this product</ac:parameter> \
                    <ac:parameter ac:name="cql">label = &quot;pd2&quot; and ancestor = &quot;63915652&quot;</ac:parameter> \
                </ac:structured-macro> \
            </p> \
        </ac:layout-cell> \
    </ac:layout-section> \
</ac:layout> '




debug("Set Content");
publishModule.syncContent("RG",null,'63918536', "PD2", content, function() {
  console.log("Published");
});
