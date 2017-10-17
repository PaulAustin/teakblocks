/*
Copyright (c) 2017 Paul Austin - SDG

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

// An overlay to see access saved and sample programs
/* Theory of operation
  I core challenge is how to come up with simple/meaningful identifers for the
  many programs authored. The programs are pictures so the first approximation
  is to use picture.

  Hypothesis - programs come in two comon forms:
  >  adhoc, simple demos, easy to remake, standalone
  >  more thoght out parts for a bigger plan.

  For the adhoc simple test, the ide is to treat these a bit more like
  photographs. There is no for a name. The program its self is the identifier
  If a user can thumb through recent programs that is simple than having to make
  up a name for each one. Most programs.



  For the work sheet. Two key operation
  <new> save the current one and show a new sheet.
  <clear> wipe the current workspace.
  <snapshot> take a picture of the current work and let me continue woring.
   this fit the photograph model.

  <record> future perhasp alwasy on, let you roll back any time you want.
*/
module.exports = function () {


  var fileOverlay = {};
  var app = require('./../appMain.js');

  fileOverlay.saveCamera = document.getElementById('saveCamera');

  // External function for putting it all together.
  fileOverlay.start = function () {

    // Construct the DOM for the overlay.
    app.overlayDom.innerHTML = `
      <div id='debugOverlay' class ='fullScreenSlideIn'>
        <div id='overlayExitButton'>
          <i class='fa fa-times driver-x-debug svg-clear' aria-hidden='true'></i>
        </div>
        <div id='debugLogBackground'>
          <div id='debugLog'></div>
        </div>
      </div>`;

    var exitButton = document.getElementById('overlayExitButton');
    exitButton.onclick = fileOverlay.exit;
  };

  // Close the overlay.
  fileOverlay.exit = function() {
    var overlay = document.getElementById('fileOverlay');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }

    // For now, leave the element there until the next overlay replaces it.
    // app.overlayDom.innerHTML = '';
  };

  // Get an canvas image of the curret screen.
  // TODO save in medium size perahsp 1/4 scale, for a regualr screen that is
  // 1/16 the storeac, then show smaller thumb nails. on hover the thumb nail
  // can be magnified.

  fileOverlay.saveFile = function(fileName, content) {
    if (typeof (Storage) !== "undefined") {
      // Store
      console.log('saved to local storage to ' + fileName);
      localStorage.setItem(fileName, content);
    } else {
      console.log('no local storage');
    }
  };

  fileOverlay.loadFile = function(fileName) {
    var content =  localStorage.getItem(fileName);
    return content;
  };

  fileOverlay.cameraFlash = function() {
    fileOverlay.saveCamera.className = 'cameraFlash';
    setTimeout(function() {
      fileOverlay.saveCamera.className = 'cameraIdle';
      }, 1000);
  };

  fileOverlay.snapShot = function() {
    var image = new Image();
    var context = document.getElementById('snapShotCanvas');
    var svg = document.getElementById('editor-canvas');

    // Create a SVG string by joining the serialized form with a header.
    var xml = new XMLSerializer().serializeToString(svg);
    image.src = 'data:image/svg+xml;base64,' + btoa(xml);

    context.drawImage(image, 0, 0);
  };

  return fileOverlay;
}();
