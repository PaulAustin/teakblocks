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

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){

  var splashOverlay = {};
  var app = require('./../appMain.js');
  // External function for putting it all together.
  splashOverlay.start = function () {

    // Construct the DOM for the overlay.
    // TODO Add a method to app for showing overlays.
    app.overlayDom.innerHTML = `
    <div id='overlayFrame' class='fullScreenSlideIn'>
      <div id='splashOverlay'>
      <p class='splashTitle'>Teak blocks<p>
      <p class='splashBody'>A block sequencing tool for simple programs.<p>
      <br>
      <br>
      <br>
      <br>
      <br>
      <!--div>
        <input id='noLaunchSplash' type='checkbox' class='splashBody'>
        <label for='noLaunchSplash' class='splashBody'>Show at launch</lable>
      </div-->
      <br>
      <br>
      <p class='splashBody'>Copyright 2017 Paul Austin and Sidharth Srinivasan<p>
      </div>
    </div>`;
    var exitButton = document.getElementById('splashOverlay');
    exitButton.onclick = splashOverlay.exit;
  };

  splashOverlay.exit = function () {
    // TODO should be done by application class.
    var overlay = document.getElementById('overlayFrame');
    if (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }
  };

  return splashOverlay;
}();
