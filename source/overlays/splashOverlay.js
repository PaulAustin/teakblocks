/*
Copyright (c) 2019 TRashbots - SDG

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

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){

  var splashOverlay = {};
  var app = require('./../appMain.js');
  var overlays = require('./overlays.js');
  // External function for putting it all together.
  splashOverlay.start = function () {

    // Construct the DOM for the overlay.
    overlays.overlayDom.innerHTML = `
    <div id='overlayRoot'>
        <div id='splashOverlay'>
            <div id='splashDialog'>
              <p class='splashTitle'>TBlocks<p>
              <p class='splashBody'>A block sequencing tool for simple programs.<p>
              <p class='splashBody'> This site uses cookies and local storage to maintain your settings.<p>
              <p class='splashBody'> © 2019 Paul Austin and Sidharth Srinivasan. All rights reserved.<p>
            <div class='margin:20'>
                <button id='done' class='splash-button' style='width:200px'>OK</button>
                <br><br><br>
                <button id='reset' class='splash-button' style='width:200px'>Clear all.</button>
            </div>
            <br>
            <div>
                <label class='splashBody'>
                </label>
            </div>
            </div>
        </div>
    </div>`;

    // Exit simply go back to editor.
    var exitButton = document.getElementById('done');
    exitButton.onclick = splashOverlay.hideAbout;

    // Reset - clear all pages so students can go back to the origianl state.
    // often for the next student.
    var resetButton = document.getElementById('reset');
    resetButton.onclick = splashOverlay.resetApp;
  };

  splashOverlay.hideAbout = function() {
      overlays.hideOverlay(null);
  };

  splashOverlay.resetApp = function() {
      app.tbe.clearAllBlocks();
      app.defaultFiles.setupDefaultPages(true);
      overlays.hideOverlay(null);
  };

  splashOverlay.exit = function () {
  };

  splashOverlay.showLaunchAboutBox = function() {
    var value = app.storage.getItem('teakBlockShowAboutBox');
    return (value === null) || (value === true);
  };

  return splashOverlay;
}();
