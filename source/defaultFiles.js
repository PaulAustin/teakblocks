/*
Copyright (c) 2016 Paul Austin - SDG

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

module.exports = function () {
  var defaultFiles = {};
  var app = require('./appMain.js');
  var defaultDocA = '()';

  var defaultDocB = `(
  (chain x:80 y:240 (
    (identity start:'click' deviceName:'-?-' bus:'ble')
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 1 0 0 0 1 0 1 1 1 0))
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 1 1 0 1 0 0 0 1))
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 1 1 1 1 1 0 0 0 0 0))
    (picture pix:(0 1 0 1 0 0 0 0 0 0 0 1 1 1 0 1 0 0 0 1 0 1 1 1 0))
  )))`;

  var defaultDocC = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (loop count:'25' (
        (picture pix:(1 1 1 1 1 1 0 0 0 1 1 0 0 0 1 1 0 0 0 1 1 1 1 1 1))
        (picture pix:(0 0 0 0 0 0 1 1 1 0 0 1 0 1 0 0 1 1 1 0 0 0 0 0 0))
        (picture pix:(0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0))
      ))
    )))`;

  var defaultDocD = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (sound description:'C4' period:'1/4')
      (sound description:'E4' period:'1/4')
      (sound description:'G4' period:'1/4')
      (sound description:'E4' period:'1/4')
      (sound description:'C4' period:'1/4')
    )))`;

  var defaultDocE = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (motor speed:50 duration:0)
      (motor speed:'100' duration:0)
      (motor speed:50 duration:0)
      (motor speed:'0' duration:0)
      (motor speed:'-50' duration:0)
      (motor speed:'-100' duration:0)
      (motor speed:'-50' duration:0)
    )))`;

 // check if contains file (file name)
 defaultFiles.containsFile = function(fileName){
   if(app.fileManager.loadFile(fileName) === null || app.fileManager.loadFile(fileName) === `null`){
     return false;
   }
   return true;
 };

 // default Files
 defaultFiles.default = function(files){
   for(var i = 0; i < files.length; i++){
     if(!this.containsFile(files[i])){
       var file = '';
       switch (files[i]) {
         case 'docA':
           file = defaultDocA;
           break;
         case 'docB':
           file = defaultDocB;
           break;
         case 'docC':
            file = defaultDocC;
           break;
         case 'docD':
           file = defaultDocD;
           break;
         case 'docE':
           file = defaultDocE;
           break;
         default:
           file = defaultDocA;
           break;

       }
       app.fileManager.saveFile(files[i], file);
     }
   }
 };

 return defaultFiles;
}();
