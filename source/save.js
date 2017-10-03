/*
Copyright (c) 2017 Sidharth Srinivasan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
