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
  var fastr = require('./../fastr.js');
  var cxn = require('./../cxn.js');
  var overlays = require('./overlays.js');
  var ko = require('knockout');
  var deviceScanOverlay = {};
  var dso = deviceScanOverlay;

  dso.devices = ko.observableArray([]);
  dso.nonName = '-?-';
  dso.deviceName = dso.nonName;

  dso.onDeviceClick = function() {
      // Ah JavaScript... 'this' is NOT the deviceScanOverlay.
      // It is the knockout item in the observable array.
      cxn.connect(this.name);
      dso.selectDevice(this.name);
  };

  dso.selectDevice = function(newBotName) {
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
            <div>
                <button id='dsoScan' class='fa fas dso-button'>
                LABEL SET BASED ON STATE
                </button>
                <button id='dsoDisconnect' class='fa fas dso-button' style='float:right'>
                Disconnect
                </button>
            </div>
        </div>
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(dso, overlays.overlayDom);

    if (!cxn.scanUsesHostDialog()) {
      dso.watch = cxn.connectionChanged.subscribe(dso.refreshList);
      cxn.startScanning();
    }
    dso.scanButton = document.getElementById('dsoScan');
    dso.scanButton.onclick = dso.onScanButton;

    dso.disconnectButton = document.getElementById('dsoDisconnect');
    dso.disconnectButton.onclick = dso.onDisconnectButton;

    dso.deviceNameLabel = document.getElementById('device-name-label');
    dso.updateLabel();
    dso.updateScreenName(dso.deviceName);
  };

  // Close the overlay.
  dso.exit = function() {

    if (cxn.scanning) {
      cxn.stopScanning();
      dso.watch.dispose();
      dso.watch = null;
    }
    ko.cleanNode(overlays.overlayDom);
  };

  dso.onScanButton = function() {
    console.log('onSCanButton pressed');
    if (cxn.scanUsesHostDialog()) {
      if (cxn.scanning) {
        cxn.stopScanning();
        dso.watch.dispose();
        dso.watch = null;
      } else {
        dso.refreshList(cxn.devices);
        dso.watch = cxn.connectionChanged.subscribe(dso.refreshList);
        cxn.startScanning();
      }
    }
  };

  dso.onDisconnectButton = function() {
      var currentBotName = dso.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        cxn.disconnect(mac, currentBotName);
      }
  };

  // refreshList() -- rebuilds the UI list bases on devices the
  // connection manager knows about.
  dso.refreshList = function (bots) {
    dso.devices.removeAll();
    var cxnSelectedBot = dso.nonName;
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
    dso.updateLabel();
    dso.updateScreenName(cxnSelectedBot);
  };

  return dso;
}();
