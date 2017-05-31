
//var tbe = require('./teakblocks.js');
var teak = require('teak');
//var tbe = require('./teakblocks.js');

module.exports = function (){

  var save = {};
  save.loadFile = function(fileName){
    var content =  localStorage.getItem(fileName);
    return content;
  };

  save.saveFile = function(fileName, content){
    if (typeof (Storage) !== "undefined") {
      // Store
      console.log('saved to local storage to ' + fileName);
      localStorage.setItem(fileName, content);
    } else {
      console.log('no local storage');
    }
    //update
  };

 //open
 //update
 //getcurrent

 //become comforatble w cordova
 //

/*var logOb = "";

function writeLog(str) {
    if(!logOb) return;
    var log = str + " [" + (new Date()) + "]\n";
    //console.log("going to log "+log);
    logOb.createWriter(function(fileWriter) {

        fileWriter.seek(fileWriter.length);

        var blob = new Blob([log], {type:'text/plain'});
        fileWriter.write(blob);
        //console.log("ok, in theory i worked");
    }, fail);
}

 window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
        console.log("got main dir",dir);
        dir.getFile("log.txt", {create:true}, function(file) {
            console.log("got the file", file);
            logOb = file;
            writeLog("App started");
        });
    });
*/
  return save;
}();
