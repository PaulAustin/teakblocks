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
  var log = require('./../log.js');
  var cxn = require('./../cxn.js');
  var overlays = require('./overlays.js');
  var ko = require('knockout');
  var deviceScanOverlay = {};
  var dso = deviceScanOverlay;

  dso.devices = ko.observableArray([]);
  dso.deviceName = '-?-';
  dso.onDeviceClick = function() {
      // Ah JavaScript... 'this' is NOT the deviceScanOverlay.
      // It is the knockout item in the observable array.
      console.log('on device click', this.name, this);
      dso.selectDevice(this.name);
  }

  dso.selectDevice = function(newBotName) {
    console.log('SD name is ', newBotName);
    if (typeof newBotName === 'string') {

      var currentBotName = dso.deviceName;
      if (currentBotName !== newBotName) {
        // arrayFirst as a visitor.
        ko.utils.arrayFirst(dso.devices(), function(item) {
            item().selected(item().name === newBotName);
            return false; // visit all items
        });
      }

      // Move the selected name into the object.
      dso.updateScreenName(newBotName);
    }
  };

  dso.updateScreenName = function(botName) {
    dso.deviceName = botName;
    var txt = document.getElementById('device-name-label');
    txt.innerHTML = "bot: " + dso.deviceName;
  };

  dso.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What triggers this chain, mouse click, button, message,...
        start:'click',
        // Device name
        deviceName:'-?-',
        // Connection mechanism
        bus:'ble',
      },
      // Indicate what controller isx active. This may affect the data format.
      controller:'target-bt',
      status:0,
    };
  };

  // External function for putting it all together.
  dso.start = function () {

    // Construct the DOM for the overlay.
    overlays.overlayDom.innerHTML = `
      <div id='overlayRoot'>
        <div id='dsoOverlay'>
            <div class='dso-list-box-shell'>
                <ul class='dso-list-box' data-bind='foreach: devices'>
                  <li data-bind="css:{'dso-list-item-selected':selected()}">
                    <div data-bind="text:name, click:$parent.onDeviceClick"></div>
                  </li>
                </ul>
            </div>
            <button id='dsoScan' class='dso-scan-button dso-scan-label'>
             Search for TB1s from the broswer
            </button>
        </div>
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(dso, overlays.overlayDom);
    dso.scanButton = document.getElementById('dsoScan');
    dso.scanButton.onclick = dso.handleScanButton;

    // If currently connected then disconnect and let them choose the same again
    // or pick another.
    var currentBotName = dso.deviceName;
    log.trace('currently connected to', currentBotName);
  };

  // Close the overlay.
  dso.exit = function() {
      log.trace('dso.exit()');

    if (cxn.scannning) {
      dso.toggleBtScan();
    }
    ko.cleanNode(overlays.overlayDom);
  };

  dso.handleScanButton = function() {
    if (cxn.scanning) {
      log.trace('stop scanning');
      var currentBotName = dso.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        log.trace('disconnect from current mac', mac);
        cxn.disconnect(mac, currentBotName);
      }
    } else {
      log.trace('start scanning');
      dso.toggleBtScan();
    }
  };

  // Turn on Scanning
  dso.configBtnScan = function(scanning) {
    log.trace('config scaning button', scanning);
    var button= dso.scanButton;
    if (scanning) {
      // Turn on scanning.
      button.innerHTML =
      "<span>Looking for bots <i class='fa fa-spinner fa-pulse fa-fw'></i></span>";
    } else {
      // Turn off back scanning
      button.innerHTML = "<span>Look for bots </span>";
    }
  };

  dso.toggleBtScan = function() {
    if (cxn.scannning) {
      // Turn off back scanning
      cxn.stopScanning();
      dso.watch.dispose();
      dso.watch = null;
    } else {
      console.log('in theory start scanning');
      // Turn on scanning.
      // Set up a callback to get notified when when devices show up.
      dso.refreshList(cxn.devices);
      dso.watch = cxn.connectionChanged.subscribe(dso.refreshList);
      cxn.startScanning();
    }
    dso.configBtnScan(cxn.scanning);
  };

  // refreshList() -- rebuilds the UI list bases on devices the
  // connection manager knows about.
  dso.refreshList = function (bots) {
    dso.devices.removeAll();
    var cxnSelectedBot = '-?-';
    for (var key in bots) {
      var selected = bots[key].status === cxn.statusEnum.CONNECTED;
      if (selected) {
          cxnSelectedBot = key;
      }
      if (bots.hasOwnProperty(key)) {
          var item = ko.observable({
            name: key, //+ faBlueTooth,
            selected: ko.observable(selected)
          });
          dso.devices.unshift(item);
      }
    }
    // If scanning has stopped update the button.
    if (!cxn.scanning) {
      dso.configBtnScan(false);
    }
    dso.updateScreenName(cxnSelectedBot);
  };

  return dso;
}();
