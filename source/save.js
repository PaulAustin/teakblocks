
//var tbe = require('./teakblocks.js');
var teak = require('teak');
//var tbe = require('./teakblocks.js');

module.exports = function (){

  var save = {};
  save.loadFile = function(fileName){
    //tbe.currentDoc = fileName;
    return localStorage.getItem(fileName);
  };

  save.saveFile = function(fileName, content){
    //Serialize
    console.log("content: ", content);
  //  var symbols ={
  //    picture:function(){},
  //    sound:function(){},
  //  };
  //  var state = {};
  //  var serialized = teak.parse(content, state, symbols);
  //  console.log("serialized:", serialized);
    if (typeof (Storage) !== "undefined") {
      // Store
      console.log('saved to local storage');
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
