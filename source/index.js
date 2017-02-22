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
    'play': function() { tbe.fblocks.identityBlock.sendMessage(); },
    'stop': function() { tbe.fblocks.identityBlock.disconnectMessage(); },
    'trashFirst': function() { tbe.stage1deletion(fastr); },
    'trashSecond': function() {  tbe.stage2deletion(fastr); },
    'loadDocA': function(){ tbe.loadDoc('docA'); },
    'loadDocB': function(){ tbe.loadDoc('docB'); },
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
/*
tbe.loadDoc(docName) {

  if (docName === tbe.currentDoc) {
  // for now save docname
   return ;
} else {
  save.update file (tbe.currentDoc, .....); //
  clear existing doc
  vsr text = save.loadFile(docName);
  console.log(text)
  deserialize text;
}
}
/*
docFile - serialezed dat in utf8
model - function block objects wiht links
view - svg elements in the pages DOM  ( partof TBE SVG elt)
*/
// if(on docA -> docB) 1. save docA, 2. clear the screen 3. set currentDoc to docB 4. update editor with saved version of docB
/*
  var configButton = document.getElementById('app-settings-button');
  configButton.onclick = function() { tf.showHide(tbe.components.appSettings); };

  var clearButton = document.getElementById('clear-button');
  clearButton.onclick = function() { tbe.clearAllBlocks(); };
*/

  // these could be loaded from JSON files/strings
  var package1 = {
  name:'A',
  blocks:{
      'identity':{},
      'picture':{},
      'sound':{},
      'motor':{},
      'twoMotor':{},
      'servo':{},
      'wait':{},
      'loop':{}
    }
  };

 tbe.addPalette(package1);
 var actionButtons = [
   {'alignment': 'L', 'position': 1, 'label': fastr.play, 'command': 'play', 'tweakx': 4},
   {'alignment': 'L', 'position': 2, 'label': fastr.stop, 'command': 'stop'},
   {'alignment': 'M', 'position': 1, 'label': fastr.file, 'command': 'loadDocA'},
   {'alignment': 'M', 'position': 2, 'label': fastr.file, 'command': 'loadDocB'},
   {'alignment': 'M', 'position': 3, 'label': fastr.trashEmpty, 'command': 'trashFirst'},
   {'alignment': 'R', 'position': 3, 'label': fastr.copyToClipboard, 'command': 'copyToClipboard'},
   {'alignment': 'R', 'position': 2, 'label': fastr.redo, 'command': 'redo'},
   {'alignment': 'R', 'position': 1, 'label': fastr.undo, 'command': 'undo'}
 ];

 tbe.deleteRay = tbe.addActionButtons(actionButtons);
 /*
 actionButtons[0] = {'alignment': 'L', 'position': 1, 'label': fastr.play, 'tweak': 4};
 tbe.addActionButton(0.5, fastr.play, 'play', 4);
 tbe.addActionButton(1.5, fastr.stop, 'stop');
 tbe.addActionButton(4.5, fastr.file, 'loadDocA');
 tbe.addActionButton(5.5, fastr.file, 'loadDocB');
 tbe.deleteButton = tbe.addActionButton(7.5, fastr.trashEmpty, 'trashFirst');
 //tbe.addActionButton(9.5, fastr.settings, 'settings');
 tbe.addActionButton(9.5, fastr.copyToClipboard, 'copyToClipboard');
 tbe.addActionButton(12.2, fastr.redo, 'redo');
 tbe.addActionButton((window.innerWidth/80)*0.8, fastr.undo, 'undo');//13.2 innerWidth .7135
*/
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
