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
  var editStyle = require('editStyle.js');
  var app = require('./../appMain.js');
  var overlays = require('./overlays.js');
  // External function for putting it all together.
  splashOverlay.start = function () {

    overlays.insertHTML(`
        <div id='splashOverlay'>
            <div id='splashDialog'>
              <p class='splash-title'>TBlocks</p>
              <p class='splash-body splash-text'>A block sequencing tool for interactive programming.</p>
              <p class='splash-body splash-text'>© 2019 Paul Austin and Sidharth Srinivasan. All rights reserved.</p>
              <br>
            <div>
                <button id='done' class='splash-button splash-text'>OK</button>
                <br><br>
                <button id='reset' class='splash-button splash-text'>Clear all.</button>
            </div>
            <br>
            </div>
        </div>`);

    // <p class='splash-body splash-text'>This site uses cookies and local storage to maintain your settings.</p>

    // Exit simply go back to editor.
    var exitButton = document.getElementById('done');
    exitButton.onclick = splashOverlay.hideAbout;

    // Reset - clear all pages so students can go back to the origianl state.
    // often for the next student.
    var resetButton = document.getElementById('reset');
    resetButton.onclick = splashOverlay.resetApp;

    window.addEventListener("resize", splashOverlay.onResize, false);
    splashOverlay.onResize();
  };

  splashOverlay.onResize = function() {
    var overlay = document.getElementById('splashOverlay');
    var w = overlay.clientWidth;
    var h = overlay.clientHeight;
    var scale = editStyle.calcSreenScale(w, h);
    // console.log('splash resize', w, h, scale);

    var rt = editStyle.findCSSRule('.splash-text');
    editStyle.setFontSize(rt.style, 18 * scale);

    var rb = editStyle.findCSSRule('.splash-button');
    editStyle.setHeight(rb.style, 50 * scale);
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
    window.removeEventListener('resize', splashOverlay.onResize, false);
  };

  splashOverlay.showLaunchAboutBox = function() {
    var value = app.storage.getItem('teakBlockShowAboutBox');
    return (value === null) || (value === true);
  };

  return splashOverlay;
}();
