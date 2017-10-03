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

module.exports = function () {

  // Starts as an object and will be mosty empty until start()
  // is called.
  var app = {};

  // Application main, called once shell is fully up.
  app.start = function () {
    var ko = require('knockout');
    var Clipboard = require('clipboard');
    app.tbe = require('./teakblocks.js');
    app.conductor = require('./conductor.js');
    var actionButtons = require('./actionButtons.js');
    var teaktext = require('./teaktext.js');
    var save = require('./save.js');

    // Add major modules to the application object.
    var tbe = app.tbe;
    app.overlayDom = document.getElementById('tbe-overlay-mode');
    app.driverOverlay = require('./overlays/driveMode.js');
    app.debugOverlay = require('./overlays/debugOverlay.js');
    app.settingsOverlay = require('./overlays/settings.js');
    app.splashOverlay = require('./overlays/splashOverlay.js');

    // Unicode charcodes for FontAwesome symbols.
    var fastr = {
      play: '\uf04b',
      pause: '\uf04c',
      stop: '\uf04D',
      file: '\uf016',
      trash: '\uf014',
      folder: '\uf115',
      undo: '\uf0e2',
      redo: '\uf01e',
      settings: '\uf013',
      copy: '\uf24d',
      paste:'\uf0ea',
      page: '\uf0f6',
      edit: '\uf044',
      save: '\uf0c7',
      gamepad: '\uf11b',
      debug: '\uf120'
    };

    // Configuration components for the app and blocks
    // Initialize knockout databinding for documents DOM
    tbe.components = {};
    tbe.components.appSettings = require('./app-settings.js');
    tbe.components.blockSettings = require('./block-settings.js');
    ko.applyBindings(tbe.components);

    var formsDiv = document.getElementById('tbe-forms');
    tbe.components.appSettings.insert(formsDiv);
    tbe.components.blockSettings.insert(formsDiv);

    // Some early experiments. seems to work well for desktop Chrome
    // Safari has noticeable lag, with volume fluctuations.
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

    tbe.init(document.getElementById('editorCanvas'));

    var buttonsPages = [
      {'label': 'A', 'command': 'loadDocA'},
      {'label': 'B', 'command': 'loadDocB'},
      {'label': 'C', 'command': 'loadDocC'},
      {'label': 'D', 'command': 'loadDocD'},
      {'label': 'E', 'command': 'loadDocE'},
      //{'label': fastr.gamepad, 'command': 'loadDriveMode'},
    ];
    var buttonsEdit = [
      {'label': fastr.trash, 'command': 'trash'},
      {'label': fastr.copy, 'command': 'copy'},
      {'label': fastr.paste, 'command': 'paste'},
      {'label': fastr.save, 'command': 'save'},
      {'label': fastr.settings, 'command': 'settings'}
    ];

    tbe.deleteRay = null;
    tbe.commands = {
      //'settings': function() { tf.showHide(tbe.components.appSettings); },
      'play': function() { app.conductor.playAll(); },
      'stop': function() { app.conductor.stopAll(); },
      'trash': function() { tbe.clearAllBlocks(); },
      'pages': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.createDropdown(buttonsPages, tbe, fastr.page, 'pages'); },
      'edit': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.createDropdown(buttonsEdit, tbe, fastr.edit, 'edit'); },
      'loadDocA': function(){ tbe.loadDoc('docA'); },
      'loadDocB': function(){ tbe.loadDoc('docB'); },
      'loadDocC': function(){ tbe.loadDoc('docC'); },
      'loadDocD': function(){ tbe.loadDoc('docD'); },
      'loadDocE': function(){ tbe.loadDoc('docE'); },
      'loadDriveMode': function(){ app.showOverlay(app.driverOverlay); },
      'loadDebugMode': function(){ app.showOverlay(app.debugOverlay); },
      'settings': function(){ tbe.loadSettings(); },
      'undo': function(){ tbe.undoAction(); },
      'redo': function(){ tbe.redoAction(); },
      'pullUppages': function(){ actionButtons.deleteDropdown(tbe.dropdownButtons, tbe, fastr.page, 'pages'); },
      'pullUpedit': function(){ actionButtons.deleteDropdown(tbe.dropdownButtons, tbe, fastr.edit, 'edit'); },
      'copy': function(){ tbe.copyText = teaktext.blocksToText(tbe.forEachDiagramChain); },
      'paste': function(){ if(tbe.copyTest !== null) { teaktext.textToBlocks(tbe, tbe.copyText); } },
      'save': function(){ var currentDocText = teaktext.blocksToText(tbe.forEachDiagramChain); save.saveFile(tbe.currentDoc, currentDocText); }
    };

    // Construct the clipboard
    var clipboard = new Clipboard('.copy-button', {
      text: function() {
          return teaktext.blocksToText(tbe.forEachDiagramChain);
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
        //'servo':{},
        'wait':{},
        'loop':{}
      }
    };

   // Add the main command buttons, to left, middel and right locations.
   tbe.addPalette(package1);
   var actionButtonObj = [
     {'alignment': 'L', 'position': 1, 'label': fastr.play, 'command': 'play', 'tweakx': 4},
     {'alignment': 'L', 'position': 2, 'label': fastr.stop, 'command': 'stop'},
     {'alignment': 'M', 'position': 1, 'label': fastr.gamepad, 'command': 'loadDriveMode'},
     {'alignment': 'M', 'position': 2, 'label': fastr.debug, 'command': 'loadDebugMode'},
     {'alignment': 'M', 'position': 3, 'label': fastr.page, 'command': 'pages'},
     {'alignment': 'M', 'position': 4, 'label': fastr.edit, 'command': 'edit'},
     {'alignment': 'R', 'position': 2, 'label': fastr.redo, 'command': 'redo'},
     {'alignment': 'R', 'position': 1, 'label': fastr.undo, 'command': 'undo'}
   ];

   tbe.actionButtons = actionButtonObj;
   actionButtons.addActionButtons(actionButtonObj, tbe);
   document.body.onresize = tbe.updateScreenSizes; // Buttons/screen resizing

   // The conductor coordinates the score managed by the editor and the collection
   // of bots that make up the orchestra.
   app.conductor.attachToScoreEditor(tbe);
 };

 app.showOverlay = function(overlay) {

   // TODO modularized control of editor. Why is this part of the show overlay logic?
   app.tbe.undoArray = {}; // When we switch documents we want to clear undo history.
   app.tbe.undoTransactionIndex = 0;

   // First, save the current document.
   app.tbe.saveCurrentDoc();
   app.tbe.clearStates();
   overlay.start();
 };

 return app;
}();