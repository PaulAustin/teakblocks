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

// An overlay to see log messages and communications
// between the app and the robot.
module.exports = function () {
  var interact = require('interact.js');
  var log = require('log.js');
  var fastr = require('fastr.js');
  var tbot = require('tbot.js');
  var icons = require('icons.js');
  var svgb = require('svgbuilder.js');
  var cxn = require('./../cxn.js');
  var overlays = require('./overlays.js');
  var deviceScanOverlay = {};
  var dso = deviceScanOverlay;

  dso.nonName = '-?-';
  dso.tbots = {};
  dso.deviceName = dso.nonName;

  dso.selectDevice = function(newBotName) {
    // Move the selected name into the object.
    if (typeof newBotName === 'string') {
      dso.updateScreenName(newBotName);
    }
  };

  dso.decoratedName = function() {
    return fastr.robot + '  ' + dso.deviceName;
  };

  dso.updateScreenName = function(botName) {
    dso.deviceName = botName;
    dso.disconnectButton.disabled = (dso.deviceName === dso.nonName);
    dso.deviceNameLabel.innerHTML = dso.decoratedName();
  };

  dso.updateLabel = function() {
    dso.scanButton.innerHTML  = (cxn.scanning) ? (
        'Searching for ' + fastr.robot
    ) : (
        'Search for ' + fastr.robot
    );
  };

  dso.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What triggers this chain, mouse click, button, message,...
        start:'click',
        // Device name
        deviceName:dso.nonName,
        // Connection mechanism
        bus:'ble',
      },
      // Indicate what controller isx active. This may affect the data format.
      controller:'target-bt',
      status:0,
    };
  };

  dso.testButton = function(e) {
    if (e.pageX < 60 && e.pageY < 200 && !dso.testBotsShowing) {
      dso.testBotsShowing = true;
      dso.addTestBots();
    } else if (e.pageX < 60 && e.pageY > 250) {
      dso.testBotsShowing = false;
      dso.removeAllBots();
    }
  };

  dso.addTestBots = function() {
    var testNames = ['CUPUR', 'CAPAZ', 'FELIX', 'SADOW', 'NATAN', 'GATON', 'FUTOL', 'BATON', 'FILON', 'CAPON'];
    for (var i in testNames) {
      dso.addNewBlock(testNames[i], 0, icons.t55);
    }
  };

  dso.removeAllBots = function() {
    dso.tbots = {};
    dso.svg.removeChild(dso.tbotGroup);
    dso.tbotGroup = dso.svg.appendChild(svgb.createGroup('', 0, 0));
  };

  dso.testKeyTCount = 0;
  dso.testKeyCCount = 0;
  dso.keyEvent = function(e) {
    if (e.key === 'T') {
      dso.testKeyTCount +=1;
    } else if (e.key === 'C') {
      dso.testKeyCCount += 1;
    } else {
      dso.testKeyTCount = dso.testKeyCCount = 0;
    }
    if (dso.testKeyTCount > 3) {
      dso.addTestBots();
      dso.testKeyTCount = dso.testKeyCCount = 0;
    } else if (dso.testKeyCCount > 3) {
      dso.removeAllBots();
      dso.testKeyTCount = dso.testKeyCCount = 0;
    }
  };

  // External function for putting it all together.
  dso.start = function () {
    document.body.addEventListener('keydown', dso.keyEvent, false);

    // Construct the DOM for the overlay.
    overlays.overlayDom.innerHTML = `
      <div id='overlayRoot'>
        <div id='dsoOverlay'>
            <div id='dsoSvgShell' class='dso-list-box-shell'>
              <svg id='dsoSVG' class= 'dso-svg-backgound' width='100%' height='100%' xmlns="http://www.w3.org/2000/svg"></svg>
            </div>
            <div class='dso-botton-bar'>
                <button id='dsoScan' class='fa fas dso-button'>
                LABEL SET BASED ON STATE
                </button>
                <button id='dsoDisconnect' class='fa fas dso-button' style='float:right'>
                Disconnect
                </button>
            </div>
        </div>
      </div>`;

    dso.svg = document.getElementById('dsoSVG');
    dso.background = svgb.createRect('dso-svg-backgound', 0, 0, 20, 20, 0);
    var backgroundGroup = dso.svg.appendChild(svgb.createGroup('', 0, 0));
    backgroundGroup.appendChild(dso.background);

    dso.tbotGroup = dso.svg.appendChild(svgb.createGroup('', 0, 0));

    window.addEventListener("resize", dso.onResize, false);
    dso.onResize();
    // build the visuals list
    for (var t in dso.tbots) {
      dso.tbots[t].buildSvg(dso.svg);
    }

    dso.scanButton = document.getElementById('dsoScan');
    dso.scanButton.onclick = dso.onScanButton;
    dso.disconnectButton = document.getElementById('dsoDisconnect');
    dso.disconnectButton.onclick = dso.onDisconnectButton;

    // Backdoor way to change hold duration.
    dso.saveHold = interact.debug().defaultOptions._holdDuration;
    interact.debug().defaultOptions._holdDuration = 2000;
    dso.interact = interact('.dso-svg-backgound', {context:dso.svg})
      .on('hold', function(e) { dso.testButton(e); } )
    dso.deviceNameLabel = document.getElementById('device-name-label');

    if (!cxn.isBLESupported()) {
      dso.sorryCantDoIt();
    }

    if (!cxn.scanUsesHostDialog()) {
      dso.watch = cxn.connectionChanged.subscribe(dso.refreshList);
      cxn.startScanning();
    }

    dso.updateLabel();
    dso.updateScreenName(dso.deviceName);
  };

  dso.sorryCantDoIt = function() {
    var tb = new tbot.Class(dso.tbotGroup, 100, 20, '-----', icons.sad55);
    dso.tbotGroup = dso.svg.appendChild(svgb.createGroup('', 0, 0));
    var message = 'Can not access Bluetooth (BLE)'
    dso.tbotGroup.appendChild(svgb.createText('svg-clear tbot-device-name', 450, 95, message));
  };

  dso.nextLocation = function(i) {
    let w = dso.columns;
    let row = Math.floor(i / w);
    let col = i % w;
    return {x: 20 + (col * 150), y:20 + (row * 150)};
  };

  dso.pauseResume = function(active) {
    //log.trace('pause-resume', active, '************************************');
  };

  dso.onResize = function() {
    // Ran in to problems using HTML layout (via flex layout) so
    // just forcing it right now. Many of these numbers could be
    // calculated.
    var overlay = document.getElementById('dsoOverlay');
    dso.w = overlay.clientWidth;
    dso.h = overlay.clientHeight;
    var svgHeight = (dso.h - 95) + 'px';
    document.getElementById('dsoSvgShell').style.height = svgHeight;

    svgb.resizeRect(dso.background, dso.w, dso.h);

    dso.columns = Math.floor((dso.w - 40) / 150);
    var i = 0;
    for (var t in dso.tbots) {
      var loc = dso.nextLocation(i);
      i += 1;
      var tb = dso.tbots[t];
      tb.setLocation(loc.x, loc.y);
    }
  };

  // Close the overlay.
  dso.exit = function() {
    document.body.removeEventListener('keydown', dso.keyEvent, false);
    window.removeEventListener('resize', dso.onResize, false);

    interact.debug().defaultOptions._holdDuration = dso.saveHold;

    for (var t in dso.tbots) {
      dso.tbots[t].releaseSvg();
    }
    dso.testBotsShowing = false;
    dso.svg = null;
    dso.background = null;
    dso.tbotGroup = null;

    if (cxn.scanning) {
      cxn.stopScanning();
      dso.watch.dispose();
      dso.watch = null;
    }
  };

  dso.tryConnect = function(tb) {
    if (cxn.scanUsesHostDialog()) {
      // In Host dialog mode (used on browsers) a direct connection
      // can be made, so just bring up the host scan. That will
      // disconnect any current as well.
      dso.onScanButton();
    } else if (!tb.selected) {
      // Right now only one connection is allowed
      //tb.setConnectionStatus(cxn.statusEnum.CONNECTING);
      cxn.disconnectAll();
      cxn.connect(tb.name);
      dso.selectDevice(tb.name);
    } else {
      // Just clear this one
      // Only one is connected so use the main button.
      cxn.disconnectAll();
    }
  };

  dso.onScanButton = function(e) {
    if (cxn.scanUsesHostDialog()) {
      if (cxn.scanning) {
        cxn.stopScanning();
        dso.watch.dispose();
        dso.watch = null;
      } else {
        dso.onDisconnectButton();
        dso.refreshList(cxn.devices);
        dso.watch = cxn.connectionChanged.subscribe(dso.refreshList);
        cxn.startScanning();
      }
    }
  };

  dso.onDisconnectButton = function() {
      cxn.disconnectAll();
  };

  dso.addNewBlock = function(key, status, face) {
    var loc = dso.nextLocation(Object.keys(dso.tbots).length);
    var tb = new tbot.Class(dso.tbotGroup, loc.x, loc.y, key, face);
    tb.onclick = function() { dso.tryConnect(tb); };
    tb.setConnectionStatus(status);
    dso.tbots[key] = tb;
    return tb;
  };

  // refreshList() -- rebuilds the UI list based on devices the
  // connection manager knows about.
  dso.refreshList = function (bots) {
    var cxnSelectedBot = dso.nonName;
    for (var key in bots) {
      let status = bots[key].status;
      var tb = dso.tbots[key];
      if (tb !== undefined) {
        tb.setConnectionStatus(status);
      } else {
        tb = dso.addNewBlock(key, status, icons.smile55);
      }
      if (status === cxn.statusEnum.CONNECTED) {
          cxnSelectedBot = key;
      }
    }
    dso.updateLabel();
    dso.updateScreenName(cxnSelectedBot);
  };

  return dso;
}();
