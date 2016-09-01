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

require('webcomponents.js');

function deviceReady() {
  // TODO make the teak block editor a web component as well.
  var tbe = require('./teakblocks.js');
  var tf = require('./teak-forms.js');

  var webComponents = {};
  webComponents.config = require('./teak-config-widget.js');
  webComponents.sound = require('./teak-sound-widget.js');
  webComponents.scan = require('./teak-scan-widget.js');
  //webComponents.motor = require('./teak-motor-widget.js');
  //webComponents.LED5x5 = require('./teak-led5x5-widget.js');

  tbe.init(
    document.getElementById('editorCanvas'),
    document.getElementById('teakCode'));

  // jQuery woudl make these shorter, but is that a good thing?
  var configButton = document.getElementById('config-button');
  configButton.onclick = function() { tf.showHide('app-config'); };

  var clearButton = document.getElementById('clear-button');
  clearButton.onclick = tbe.clearDiagramBlocks;

  var scanButton = document.getElementById('scan-button');
  scanButton.onclick = function() { tf.showHide('teak-scan'); };

  var palettes =  {
    tabs:['A', 'B', 'C'],
    A:['A1', 'A2', 'A3', 'A4', 'A5'],
    B:['B1', 'B2', 'B3', 'B4', 'B5'],
    C:['C1', 'C2', 'C3', 'C4', 'C5'],
  };

  tbe.initPalettes(palettes);
}

// Load cordova.js if not in regular browser, set up initialization.
var isRegularBrowser =
  document.URL.indexOf('http://') >= 0 ||
  document.URL.indexOf('https://') >= -0;

if (!isRegularBrowser) {
  document.addEventListener('deviceready', deviceReady, false);
  // Guess that it is Cordova then. Not intened to run direct from file:
  var script = document.createElement('script');
  script.setAttribute('src','./cordova.js');
  document.head.appendChild(script);
} else {
  deviceReady();
}
