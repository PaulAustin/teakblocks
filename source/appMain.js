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
  var log = require('log.js');
  var fastr = require('fastr.js');

  // Starts as an object and will be mosty empty until start()
  // is called.
  var app = {};
  app.buildFlags = require('../buildFlags.js');

  let timeFormat = {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour:  "2-digit",
      minute: "2-digit",
      second: "2-digit"
    };

  log.trace('TBlocks starting -',new Date().toLocaleDateString("en-US", timeFormat));

  app.hideCookieSheet = function() {
      var cookieSheet = document.getElementById('cookieSheet');
      cookieSheet.innerHTML = '';
      app.storage.setItem('cookiesAccepted', true);
  };

  app.pause = function () {
    log.trace('TBlocks pause.', new Date().toLocaleDateString("en-US", timeFormat));
    app.overlays.pauseResume(true);
  };

  app.resume = function () {
    log.trace('TBlocks resuming.', new Date().toLocaleDateString("en-US", timeFormat));
    app.overlays.pauseResume(false);
  };

  // Application main, called once shell is fully up.
  app.start = function () {
    if (window.cordova !== undefined) {
      app.platformId = window.cordova.platformId;
    } else {
      app.platformId = "broswer";
    }

    var gIsApp = app.isCordovaApp;
    var luanchMessage = 'verson:' + app.buildFlags.version +
        ', isApp:' + app.isCordovaApp +
        ', platform:' + app.platformId;
    log.trace(luanchMessage);

    // Once app has started these can be added.
    document.addEventListener("pause", app.pause, false);
    document.addEventListener("resume", app.resume, false);

    var ko = require('knockout');
    var Clipboard = require('clipboard');
    app.tbe = require('./teakblocks.js');
    app.conductor = require('./conductor.js');
    app.dots = require('./overlays/actionDots.js');
    app.defaultFiles = require('./defaultFiles.js');
    app.teaktext = require('./teaktext.js');

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
    tbe.components.blockSettings = require('./block-settings.js');
    ko.applyBindings(tbe.components);

    var formsDiv = document.getElementById('tbe-forms');
    tbe.components.blockSettings.insert(formsDiv);

    var cookieSheet = document.getElementById('cookieSheet');
    var cookiesAccepted = app.storage.getItem('cookiesAccepted');
    if ((!gIsApp) && ((cookiesAccepted === null) || (cookiesAccepted === false))) {
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
        // TODO need means to turn off sounds
        if (true /* tbe.components.appSettings.editorSounds() */) {
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
      {'label': fastr.copy, 'command': 'copy'},
      {'label': fastr.paste, 'command': 'paste'},
      {'label': fastr.trash, 'command': 'trash'},
      {'label': fastr.settings, 'command': 'splashOverlay'},
    ];

    tbe.deleteRay = null;
    tbe.commands = {
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
      'driveOverlay': 'driveOverlay',
      'debugOverlay': 'debugOverlay',
      'splashOverlay': 'splashOverlay',
      'deviceScanOverlay': 'deviceScanOverlay',

      'settings': function() { tbe.loadSettings(); },
      'copy': function() { tbe.copyText = app.teaktext.blocksToText(tbe.forEachDiagramChain); },
      'paste': function() { if(tbe.copyTest !== null) { app.teaktext.textToBlocks(tbe, tbe.copyText); } },
      'save': function() {
        var currentDocText = app.teaktext.blocksToText(tbe.forEachDiagramChain);
        app.storage.setItem(tbe.currentDoc, currentDocText);
      },
    };

    // Construct the clipboard
    var clipboard = new Clipboard('.copy-button', {
      text: function() {
          return app.teaktext.blocksToText(tbe.forEachDiagramChain);
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
    blocks:[
        // Start Blocks
        {name: 'identity', group: 'start'},
        {name: 'identityAccelerometer', group: 'start'},
        {name: 'identityButton', group: 'start'},
        {name: 'identityTemperature', group: 'start'},
        // Function Blocks
        {name: 'picture', group: 'fx'},
        {name: 'sound', group: 'fx'},
        {name: 'motor', group: 'fx'},
        {name: 'twoMotor', group: 'fx'},
        {name: 'variableSet', group: 'fx'},
        {name: 'print', group: 'fx'},
        // Control Blocks
        {name: 'wait', group: 'control'},
        {name: 'loop', group: 'control'},
      ]
    };

    var actionButtonDefs = [
     {'alignment': 'L', 'label': fastr.play, 'command': 'play', 'tweakx': 4},
     {'alignment': 'L', 'label': fastr.stop, 'command': 'stop'},
     {'alignment': 'L', 'label': fastr.gamepad, 'command': 'driveOverlay'},
     {'alignment': 'M', 'label': fastr.debug, 'command': 'debugOverlay'},
     {'alignment': 'M', 'label': fastr.file, 'command': 'pages', 'sub':buttonsPages},
     {'alignment': 'M', 'label': fastr.edit, 'command': 'edit', 'sub':buttonsEdit},
     // {'alignment': 'M', 'position': 4, 'label': fastr.camera, 'command': 'docSnapShot'},
     {'alignment': 'R', 'label': '', 'command': 'deviceScanOverlay'},
    ];

    var base = app.dots.defineButtons(actionButtonDefs, document.getElementById('editorSvgCanvas'));
    // It seesm SVG eat all the events, even ones that don't hit any objects :(
    //actionDots.defineButtons(actionButtonDefs, document.getElementById('actionDotSvgCanvas'));

    // This is pretty Wonky
    app.defaultFiles.setupDefaultPages(false);

    tbe.init(document.getElementById('editorSvgCanvas'), base);

    var loadedDocText = app.storage.getItem('docA');
    if (loadedDocText !== null) {
      app.teaktext.textToBlocks(tbe, loadedDocText);
    }

    // Add the main command buttons, to left, middle and right locations.
    tbe.addPalette(package1);

    // Connect to resize event for refresh. Make initial call
    document.body.onresize = tbe.resize;
    tbe.resize();

    app.conductor.attachToScoreEditor(tbe);

    var showSplashAtAlunch = app.isRegularBrowser;
    showSplashAtAlunch = false; // For quick codova style test in browsers.
    if (showSplashAtAlunch && app.splashOverlay.showLaunchAboutBox()) {
      app.doCommand('splashOverlay');
    }
  };

  app.doCommand = function(commandName) {
    // Write the current doc state to storage insert
    // before any command
    app.tbe.saveCurrentDoc();

    var cmd = app.tbe.commands[commandName];
    if (app.overlays.isAnimating) {
      return;
    }

    if (app.overlays.currentShowing !== null) {
      // First hide the current one, then
      // invoke the command once hiding animation is done.
      if (app.overlays.currentShowing === cmd) {
        // Simply hide if its the same overlay.
        app.dots.activate(commandName, 0);
        app.overlays.hideOverlay(null);
      } else {
        if (typeof cmd === 'string') {
          app.dots.activate(commandName, 3);
        }
        app.overlays.hideOverlay(function () {
          app.doCommand(commandName);
         });
      }
    } else if (typeof cmd === 'function') {
      cmd();
    } else if (typeof cmd === 'string') {
      app.dots.activate(cmd, 3);
      app.overlays.showOverlay(cmd);
    }
  };

  return app;
}();
