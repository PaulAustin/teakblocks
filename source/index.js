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

// Load cordova.js if not in regular browser, and then set up initialization.
var isRegularBrowser = false;

function deviceReady() {

  var tbe = require('./teakblocks.js');
  var tf = require('./teak-forms.js');
  var ko = require('knockout');
  var Clipboard = require('clipboard');
  var tt = require('./teaktext.js');
  var conductor = require('./conductor.js')

  /* font awesome strings */
  var fastr = {
    play: '\uf04b',
    pause: '\uf04c',
    stop: '\uf04D',
    file: '\uf016',
    trashEmpty: '\uf014',
    folder: '\uf115',
    undo: '\uf0e2',
    redo: '\uf01e',
    settings: '\uf013',
    trashFull: '\uf1f8',
    copyToClipboard: '\uf0ea',
  };

  // A few things are sensitive to diffs from running in tablet vs.
  // browser.
  tbe.isRegularBrowser = isRegularBrowser;

  // Configuation components for the app and blocks
  // Initialize knockout databinding for documnets DOM
  tbe.components = {};
  tbe.components.appSettings = require('./app-settings.js');
  tbe.components.blockSettings = require('./block-settings.js');
  ko.applyBindings(tbe.components);

  var formsDiv = document.getElementById('tbe-forms');
  tbe.components.appSettings.insert(formsDiv);
  tbe.components.blockSettings.insert(formsDiv);

  // Some early experiments. seems to work well for desktop Chrome
  // Safar has noticable lag, wih volume fluxuations.
  tbe.audio = {
    shortClick: document.getElementById('short-click'),
    poof: document.getElementById('poof'),
    playSound: function (element) {
      if (tbe.components.appSettings.editorSounds()) {
        element.play();
      }
    }
  };
  tbe.audio.shortClick.preload = 'true';
  tbe.audio.poof.preload = 'true';

  tbe.init(
    document.getElementById('editorCanvas'),
    document.getElementById('teakCode'));

  tbe.deleteRay = null;
  tbe.commands = {
    'settings': function() { tf.showHide(tbe.components.appSettings); },
    'play': function() { conductor.playAll(); },
    'stop': function() { conductor.stopAll(); },
    'trashFirst': function() { tbe.stage1deletion(fastr); },
    'trashSecond': function() {  tbe.stage2deletion(fastr); },
    'loadDocA': function(){ tbe.loadDoc('docA'); },
    'loadDocB': function(){ tbe.loadDoc('docB'); },
    'undo': function(){ tbe.undoAction(); },
    'redo': function(){ tbe.redoAction(); },
  };


  var clipboard = new Clipboard('.copy-button', {
    text: function() {
        return tt.blocksToText(tbe.forEachDiagramChain);
    }
  });
  clipboard.on('success', function(e) {
    console.log(e);
  });
  clipboard.on('error', function(e) {
      console.log(e);
  });
  //create a method to make a group
  //

  // these could be loaded from JSON files/strings
  var package1 = {
  name:'A',
  blocks:{
      'identity':{},
      'picture':{},
      'sound':{},
      'motor':{},
      'twoMotor':{},
    //  'servo':{}, hide for now.
      'wait':{},
      'loop':{}
    }
  };

 tbe.addPalette(package1);
 var actionButtons = [
   {'alignment': 'L', 'position': 1, 'label': fastr.play, 'command': 'play', 'tweakx': 4},
   {'alignment': 'L', 'position': 2, 'label': fastr.stop, 'command': 'stop'},
   {'alignment': 'M', 'position': 1, 'label': fastr.file+"A", 'command': 'loadDocA'},
   {'alignment': 'M', 'position': 2, 'label': fastr.file+"B", 'command': 'loadDocB'}, //check char count and based on that add new text
   {'alignment': 'M', 'position': 3, 'label': fastr.trashEmpty, 'command': 'trashFirst'},
   {'alignment': 'R', 'position': 3, 'label': fastr.copyToClipboard, 'command': 'copyToClipboard'},
   {'alignment': 'R', 'position': 2, 'label': fastr.redo, 'command': 'redo'},
   {'alignment': 'R', 'position': 1, 'label': fastr.undo, 'command': 'undo'}
 ];

 tbe.actionButtons = actionButtons;

 tbe.deleteRay = tbe.addActionButtons(actionButtons);
 document.body.onresize = tbe.updateScreenSizes; // Buttons/screen resizing

 // The conductor coordinates the score managed by the editor and the collection
 // of bots that make up the orchestra.
 conductor.attachToScoreEditor(tbe);
}

isRegularBrowser =
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
