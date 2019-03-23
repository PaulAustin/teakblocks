/*
Copyright (c) 2018 Trashbots - SDG

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
  var log = require('./log.js');

  // Starts as an object and will be mosty empty until start()
  // is called.
  var app = {};

  log.trace('TBlocks starting.', new Date().toLocaleDateString());

  // Application main, called once shell is fully up.
  app.start = function () {
    var ko = require('knockout');
    var Clipboard = require('clipboard');
    app.tbe = require('./teakblocks.js');
    app.conductor = require('./conductor.js');
    var actionButtons = require('./actionButtons.js');
    var teaktext = require('./teaktext.js');

    // Add major modules to the application object.
    var tbe = app.tbe;

    app.overlays = require('./overlays/overlays.js').init();
    // a bit of a hack???
    app.fileManager = app.overlays.screens.fileOverlay;
    app.storage = app.fileManager.localStorage();

    if (window.MobileAccessibility) {
      window.MobileAccessibility.usePreferredTextZoom(false);
    }

    // Unicode charcodes for FontAwesome symbols.
    var fastr = {
      play: '\uf04b',
      pause: '\uf04c',
      stop: '\uf04D',
      file: '\uf016',
      trash: '\uf014',
      folder: '\uf114',
      undo: '\uf0e2',
      redo: '\uf01e',
      settings: '\uf013',
      copy: '\uf24d',
      paste:'\uf0ea',
      page: '\uf0f6',
      edit: '\uf044',
      save: '\uf0c7',
      gamepad: '\uf11b',
      debug: '\uf120',
      camera: '\uf030',
      bluetooth: '\uf294',
      connect: '\uf1e6'
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

    tbe.init(document.getElementById('editorSvgCanvas'));

    var buttonsPages = [
      {'label': 'A', 'command': 'loadDocA'},
      {'label': 'B', 'command': 'loadDocB'},
      {'label': 'C', 'command': 'loadDocC'},
      {'label': 'D', 'command': 'loadDocD'},
      {'label': 'E', 'command': 'loadDocE'},
    ];
    var buttonsEdit = [
      {'label': fastr.trash, 'command': 'trash'},
      {'label': fastr.copy, 'command': 'copy'},
      {'label': fastr.paste, 'command': 'paste'},
      {'label': fastr.save, 'command': 'save'},
      {'label': fastr.settings, 'command': 'splashOverlay'},
    ];

    tbe.deleteRay = null;
    tbe.commands = {
      //'settings': function() { tf.showHide(tbe.components.appSettings); },
      'play': function() { app.conductor.playAll(); },
      'stop': function() { app.conductor.stopAll(); },
      'trash': function() { tbe.clearAllBlocks(); },
      'pages': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.showDropdown(buttonsPages, tbe, fastr.folder, 'pages'); },
      'edit': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.showDropdown(buttonsEdit, tbe, fastr.edit, 'edit'); },
      'loadDocA': function(){ tbe.loadDoc('docA'); },
      'loadDocB': function(){ tbe.loadDoc('docB'); },
      'loadDocC': function(){ tbe.loadDoc('docC'); },
      'loadDocD': function(){ tbe.loadDoc('docD'); },
      'loadDocE': function(){ tbe.loadDoc('docE'); },

      'docSnapShot': function() { app.overlays.fileOverlay.cameraFlash(); },
      'driveOverlay': function() { app.toggleOverlay('driveOverlay'); },
      'debugOverlay': function() { app.toggleOverlay('debugOverlay'); },
      'splashOverlay': function() { app.toggleOverlay('splashOverlay'); },
      'connect': function() { app.toggleOverlay('deviceScanOverlay'); },

      'settings': function() { tbe.loadSettings(); },
      'undo': function() { tbe.undoAction(); },
      'redo': function() { tbe.redoAction(); },
      'copy': function() { tbe.copyText = teaktext.blocksToText(tbe.forEachDiagramChain); },
      'paste': function() { if(tbe.copyTest !== null) { teaktext.textToBlocks(tbe, tbe.copyText); } },
      'save': function() {
        var currentDocText = teaktext.blocksToText(tbe.forEachDiagramChain);
        app.fileManager.saveFile(tbe.currentDoc, currentDocText);
      },
    };

    // Construct the clipboard
    var clipboard = new Clipboard('.copy-button', {
      text: function() {
          return teaktext.blocksToText(tbe.forEachDiagramChain);
      }
    });
    clipboard.on('success', function(e) {
      log.trace(e);
    });
    clipboard.on('error', function(e) {
      log.trace(e);
    });

    // these could be loaded from JSON files/strings
    var package1 = {
    name:'A',
    blocks:{
        'identity':{},
        'identityAccelerometer':{},
        'identityButton': {},
        'identityTemperature': {},
        'variableSet': {},
        'variableAdd': {},
        'print': {},
        'picture':{},
        'sound':{},
        'motor':{},
        'twoMotor':{},
        //'servo':{},
        'wait':{},
        'loop':{}
        //'identityEncoder':{}
      }
    };

    // Add the main command buttons, to left, middle and right locations.
    tbe.addPalette(package1);
    var actionButtonDefs = [
     {'alignment': 'L', 'label': fastr.play, 'command': 'play', 'tweakx': 4},
     {'alignment': 'L', 'label': fastr.stop, 'command': 'stop'},
     {'alignment': 'L', 'label': fastr.gamepad, 'command': 'driveOverlay'},
     {'alignment': 'M', 'label': fastr.debug, 'command': 'debugOverlay'},
     {'alignment': 'M', 'label': fastr.folder, 'command': 'pages', 'sub':buttonsPages},
     {'alignment': 'M', 'label': fastr.edit, 'command': 'edit', 'sub':buttonsEdit},
     // {'alignment': 'M', 'position': 4, 'label': fastr.camera, 'command': 'docSnapShot'},
     {'alignment': 'R', 'label': '', 'command': 'connect'},
    ];

    actionButtons.defineButtons(actionButtonDefs, document.getElementById('actionDotSvgCanvas'));

    // Connect to resize event for refresh. Make initial call
    document.body.onresize = tbe.updateScreen;
    tbe.updateScreen();

    app.conductor.attachToScoreEditor(tbe);

    var showSplashAtAlunch = app.isRegularBrowser;
    showSplashAtAlunch = false; // For quick codova style test in browsers.
    if (showSplashAtAlunch && app.splashOverlay.showLaunchAboutBox()) {
      app.doCommand('splashOverlay');
    }
  };

  app.doCommand = function(commandName) {
    var cmdFunction = app.tbe.commands[commandName];
    if (typeof cmdFunction === 'function') {
      cmdFunction();
    }
  };

  app.toggleOverlay = function(name) {

    console.log('toggle overlay');

    // TODO modularized control of editor. Why is this part of the show overlay logic?
    app.tbe.undoArray = {}; // When we switch documents we want to clear undo history.
    app.tbe.undoTransactionIndex = 0;

    // First, save the current document.
    app.tbe.saveCurrentDoc();
    app.tbe.clearStates();
    app.overlays.toggle(name);
};

  return app;
}();
