/*
Copyright (c) 2019 Trashbots - SDG

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
  var fastr = require('./fastr.js');

  // Starts as an object and will be mosty empty until start()
  // is called.
  var app = {};

  log.trace('TBlocks starting.', new Date().toLocaleDateString());

  app.hideCookieSheet = function() {
      var cookieSheet = document.getElementById('cookieSheet');
      cookieSheet.innerHTML = '';
      app.storage.setItem('cookiesAccepted', true);
  };

  // Application main, called once shell is fully up.
  app.start = function () {
    var ko = require('knockout');
    var Clipboard = require('clipboard');
    app.tbe = require('./teakblocks.js');
    app.conductor = require('./conductor.js');
    app.dots = require('./overlays/actionDots.js');
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

    // Configuration components for the app and blocks
    // Initialize knockout databinding for documents DOM
    tbe.components = {};
    tbe.components.appSettings = require('./app-settings.js');
    tbe.components.blockSettings = require('./block-settings.js');
    ko.applyBindings(tbe.components);

    var formsDiv = document.getElementById('tbe-forms');
    tbe.components.appSettings.insert(formsDiv);
    tbe.components.blockSettings.insert(formsDiv);

    var cookieSheet = document.getElementById('cookieSheet');
    var cookiesAccepted = app.storage.getItem('cookiesAccepted');
    if ((cookiesAccepted === null) || (cookiesAccepted === false)) {
        cookieSheet.innerHTML = `
        <div id='cookiesGlass'></dev>
        <div id='cookiesForm'>
            <div id='cookiesNote'>
              <input id='cookiesButton' type="button" value="  Accept Cookies  " style="float:right">
              <p>
                  We use cookies and similar technologies for document
                  stroage functionality and to measure performance of application features.
                  You consent to our cookies if you continue to use our website.
              </p>
            </div>
        </div>
        `;
        var cookiesButton = document.getElementById('cookiesButton');
        cookiesButton.onclick = app.hideCookieSheet;
    }

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
      'pages': function() { tbe.clearStates(); tbe.dropdownButtons = app.dots.showDropdown(buttonsPages, tbe, fastr.folder, 'pages'); },
      'edit': function() { tbe.clearStates(); tbe.dropdownButtons = app.dots.showDropdown(buttonsEdit, tbe, fastr.edit, 'edit'); },
      'loadDocA': function(){ tbe.loadDoc('docA'); },
      'loadDocB': function(){ tbe.loadDoc('docB'); },
      'loadDocC': function(){ tbe.loadDoc('docC'); },
      'loadDocD': function(){ tbe.loadDoc('docD'); },
      'loadDocE': function(){ tbe.loadDoc('docE'); },

      'docSnapShot': function() { app.overlays.fileOverlay.cameraFlash(); },
      'driveOverlay': function() { app.toggleOverlay('driveOverlay'); },
      'debugOverlay': function() { app.toggleOverlay('debugOverlay'); },
      'splashOverlay': function() { app.toggleOverlay('splashOverlay'); },
      'deviceScanOverlay': function() { app.toggleOverlay('deviceScanOverlay'); },

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
      log.trace('clipboard success', e);
    });
    clipboard.on('error', function(e) {
      log.trace('clipboard error', e);
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

    var actionButtonDefs = [
     {'alignment': 'L', 'label': fastr.play, 'command': 'play', 'tweakx': 4},
     {'alignment': 'L', 'label': fastr.stop, 'command': 'stop'},
     {'alignment': 'L', 'label': fastr.gamepad, 'command': 'driveOverlay'},
     {'alignment': 'M', 'label': fastr.debug, 'command': 'debugOverlay'},
     {'alignment': 'M', 'label': fastr.folder, 'command': 'pages', 'sub':buttonsPages},
     {'alignment': 'M', 'label': fastr.edit, 'command': 'edit', 'sub':buttonsEdit},
     // {'alignment': 'M', 'position': 4, 'label': fastr.camera, 'command': 'docSnapShot'},
     {'alignment': 'R', 'label': '', 'command': 'deviceScanOverlay'},
    ];

    var base = app.dots.defineButtons(actionButtonDefs, document.getElementById('editorSvgCanvas'));
    // It seesm SVG eat all the events, even ones that dont hit any objects :(
    //actionDots.defineButtons(actionButtonDefs, document.getElementById('actionDotSvgCanvas'));

    tbe.init(document.getElementById('editorSvgCanvas'), base);

    // Add the main command buttons, to left, middle and right locations.
    tbe.addPalette(package1);

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

    // TODO modularized control of editor. Why is this part of the show overlay logic?
    app.tbe.undoArray = {}; // When we switch documents we want to clear undo history.
    app.tbe.undoTransactionIndex = 0;

    // First, save the current document.
    app.tbe.saveCurrentDoc();
    app.tbe.clearStates();
    if (app.overlays.toggle(name)) {
      app.dots.activate(name, 3);
    } else {
      app.dots.activate(name, 0);
    }
};

  return app;
}();
