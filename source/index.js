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

  // Some early experiments. seems to work well for desktop Chrome
  // Safar has noticable lag, wih volume fluxuations.
  tbe.audio = {
    shortClick: document.getElementById('short-click'),
    poof: document.getElementById('poof'),
  };
  tbe.audio.shortClick.preload = 'true';
  tbe.audio.poof.preload = 'true';

  tbe.init(
    document.getElementById('editorCanvas'),
    document.getElementById('teakCode'));

  // jQuery woudl make these shorter, but is that a good thing?
  var configButton = document.getElementById('config-button');
  configButton.onclick = function() { tf.showHide('app-config'); };

  var clearButton = document.getElementById('clear-button');
  clearButton.onclick = function() {
    if (tbe.diagramBlocks.length >1 ) {
      tbe.clearDiagramBlocks();
      tbe.audio.poof.play();
    }
  };

  var scanButton = document.getElementById('scan-button');
  scanButton.onclick = function() { tf.showHide('teak-scan'); };
/*
  {name:'a1', tcode:{power:50}, tabs:[1]},
*/

/*
  name - root name used for internationalization look up
  tcode - properties for the function blocks, includes the name
  tabs - where to place it on the tabs ( might include position as well)
*/

/* functions and config blocks.
 The connection bewtween these two is loose, not strictly one to one.
 the source stored the actual function block name, not the config panel.
  a config panel may end up scripting different blocks  ( perhaps a set of them?)

  if a set woudl tht be a group? Sound good.
*/

// How to list multiple blocks? Perhasp list multiple blocks?
// name:['while','repeat']
// Or could it simple be in teak code.
// do the loader first???
// These are two blocks, but the are paired, and willinked when created.
// How?
// what does the source look like?
// branches? Is this the last big question?


var pBlocks = [
{palette:'a', name:'motor', tcode:{power:50, port:'a'}},
{palette:'a', name:'servo', tcode:{position:90, port:'b'}},
{palette:'a', name:'light', tcode:{power:50, port:'b', color:'green'}},
{palette:'a', name:'display', tcode:{icon:'happy'}},
{palette:'a', name:'sound', tcode:{tone:'c4', time:0.25}},
{palette:'b', name:'compass', tcode:{icon:'smile'}},
{palette:'b', name:'wait', tcode:{time:1.0}},
{palette:'b', name:'wait-button', tcode:{button:'a', transition:'rising'}},
{palette:'b', name:'wait-shake', tcode:{direction:'x'}},
{palette:'b', name:'wait-tilt', tcode:{direction:'x'}},
{palette:'c', name:'while', tcode:{icon:'smile'}},
{palette:'c', name:'for', tcode:{icon:'smile'}},
{palette:'c', name:'if', tcode:{icon:'smile'}},
{palette:'d', name:'digital-out', tcode:{pin:4}},
{palette:'d', name:'serial-read', tcode:{pin:4}},
{palette:'d', name:'serial-write', tcode:{pin:4}},
];

// the function block names will map to widgers which will synthesize
// an image based on the settings. For Dev Block will simply use tab
// position

var pBockConfigMap = {
  // output based
  'motor':{color:'blue'},
  'servo':{color:'blue'},
  'light':{color:'blue'},
  'display':{color:'blue'},
  'sound':{color:'blue'},

  // sensor based
  'compass':{color:'blue'},
  'wait-time':{color:'blue'},
  'wait-button':{color:'blue'},
  'wait-shake':{color:'blue'},
  'wait-tilt':{color:'blue'},

  // Control flow
  'while':{color:'blue'},
  'for':{color:'blue'},
  'if':{color:'blue'},

  // Advanced IO
  'ditital-out':{color:'blue'},
  'serial-read':{color:'blue'},
  'serial-write':{color:'blue'},
};

  var pBlocks2 = [
    { tab:'a', blocks:['A1', 'A2', 'A3']},
    { tab:'b', blocks:['B1', 'B2', 'b3']}
  ];

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
