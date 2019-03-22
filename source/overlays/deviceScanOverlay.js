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

    var newBotName = this.name;

    if (typeof name === 'string') {

      var currentBotName = dso.deviceName;
      if (currentBotName !== newBotName) {
        // Find the current item, and mark it as unselected.
        var match = ko.utils.arrayFirst(dso.devices(), function(item) {
          return (item().name === currentBotName);
        });
        if (match) {
          match().selected(false);
        }
        // Select the item that was clicked.
        this.selected(true);
      }
      // Move the selected name into the object.
      dso.deviceName = newBotName;
      dso.updateScreenName();
    }
  };

  dso.updateScreenName = function() {
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
      // Indicate what controller is active. This may affect the data format.
      controller:'target-bt',
      status:0,
    };
  };

  // External function for putting it all together.
  dso.start = function () {

    // Construct the DOM for the overlay.
    overlays.overlayDom.innerHTML = `
      <div id='overlayRoot'
        <div id='dsoOverlay'>
            <div class='dso-list-box-shell'>
                <ul class='dso-list-box' data-bind='foreach: devices'>
                  <li data-bind= "css:{'dso-list-item-selected':selected()}">
                    <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
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
      console.log('disconnect block');

    if (cxn.scannning) {
      dso.toggleBtScan();
    }
    ko.cleanNode(overlays.overlayDom);
  };

  dso.handleScanButton = function() {
    if (cxn.scanning) {
      console.log('disconnect block');
      var currentBotName = dso.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        log.trace('disconnect from current mac', mac);
        cxn.disconnect(mac, currentBotName);
      }
    } else {
      console.log('go to toggleBtScan');
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

  // Update the list of devices in the configuration box
  dso.refreshList = function (bots) {
    // TODO, might be able to use data binding to do this as well.
    dso.devices.removeAll();
    for (var key in bots) {
      if (bots.hasOwnProperty(key)) {
        dso.addItem(key);
      }
    }
    // If scanning has stopped update the button.
    if (!cxn.scanning) {
      dso.configBtnScan(false);
    }
  };

  dso.addItem = function (botName) {
    var targetName = dso.deviceName;
    var item = ko.observable({
      name: botName, //+ faBlueTooth,
      selected: ko.observable(botName === targetName)
    });
    dso.devices.unshift(item);
  };

  return dso;
}();
