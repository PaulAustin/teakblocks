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
  var log = require('./../log.js');
  var cxn = require('./../cxn.js');
  var ko = require('knockout');

  var cxnButton =  {};

  cxnButton.devices = ko.observableArray([]);
  cxnButton.deviceName = '-?-';

  cxnButton.onDeviceClick = function() {
    // Ah JavaScript... 'this' is NOT identityBlock.
    // It is the knockout item in the observable array.

    var newBotName = this.name;

    if (typeof name === 'string') {

      var currentBotName = cxnButton.deviceName;
      if (currentBotName !== newBotName) {
        // Find the current item, and mark it as unselected.
        var match = ko.utils.arrayFirst(cxnButton.devices(), function(item) {
          return (item().name === currentBotName);
        });
        if (match) {
          match().selected(false);
        }
        // Select the item that was clicked.
        this.selected(true);
      }
      // Move the selected name into the object.
      cxnButton.deviceName = newBotName;
      cxnButton.updateScreenName();
    }
  };

  cxnButton.updateScreenName = function() {
    var txt = document.getElementById('device-name-label');
    txt.innerHTML = "bot: " + cxnButton.deviceName;
  };

  // Initial settings for blocks of this type.
  cxnButton.defaultSettings = function() {
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

  cxnButton.configuratorOpen = function(button, tbe) {
    if(document.getElementById('bot-search-overlay') !== null){
      return;
    }
    var div = document.createElement('div');
    div.innerHTML =
      `<div class='group-div'>
        <div class='list-box-shell'>
            <ul class='list-box' data-bind='foreach: devices'>
              <li data-bind= "css:{'list-item-selected':selected()}">
                <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
              </li>
            </ul>
        </div>
        <button id='bt-scan' class='width-twothirds searching-button'>
        </button>
        <button class='width-third cxnButton-x' id="cxnButton-x">
          <i class="fa fa-check" class="svg-clear"></i>
        </button>
      </div>`;

    div.setAttribute('style', 'transition: all 0.2s ease;left: 42%; top:35%;position: absolute;width: 240px;transform: scale(3.0, 3.0);pointer-events: all;');
    div.setAttribute('class', 'block-config-form blockform');
    div.setAttribute('id', 'bot-search-overlay');

    //

    var tbeForms = document.getElementById('tbe-forms');
    tbeForms.appendChild(div);

    var xButton = document.getElementById('cxnButton-x');
    xButton.addEventListener('click', function(){
        cxnButton.configuratorClose(div);
    });

    // Connect the dataBinding.
    ko.applyBindings(cxnButton, div);

    cxnButton.scanButton = document.getElementById('bt-scan');
    cxnButton.scanButton.onclick = cxnButton.handleScanButton;

    // If currently connected then disconnect and let them choose the same again
    // or pick another.
    var currentBotName = cxnButton.deviceName;
    log.trace('currently connected to', currentBotName);
    /*
    var dev = cxn.devices[currentBotName];
    if (dev !== undefined) {
      var mac = cxn.devices[currentBotName].mac;
      log.trace('current mac', mac);
      cxn.disconnect(mac, currentBotName);
    }
    */
    if (!cxn.scanUsesHostDialog && !cxn.scannning) {
      // If scanning is unobtrusive, start it when the form is shown.
      cxnButton.toggleBtScan();
    } else {
      // Otherwise at least fix up the button label.
      cxnButton.configBtnScan(false);
    }
  };

  cxnButton.handleScanButton = function() {
    if(cxn.scanning){
      console.log('disconnect block');
      var currentBotName = cxnButton.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        log.trace('disconnect from current mac', mac);
        cxn.disconnect(mac, currentBotName);
      }
    } else{
      console.log('go to toggleBtScan');
      cxnButton.toggleBtScan();
    }
  };

  // Turn on Scanning
  cxnButton.configBtnScan = function(scanning) {
    log.trace('config scaning button', scanning);
    var button= cxnButton.scanButton;
    if (scanning) {
      // Turn on scanning.
      button.innerHTML =
      "<span>Looking for bots <i class='fa fa-spinner fa-pulse fa-fw'></i></span>";
    } else {
      // Turn off back scanning
      button.innerHTML = "<span>Look for bots </span>";
    }
  };

  cxnButton.toggleBtScan = function() {
    if (cxn.scannning) {
      // Turn off back scanning
      cxn.stopScanning();
      cxnButton.watch.dispose();
      cxnButton.watch = null;
    } else {
      console.log('in theory start scanning');
      // Turn on scanning.
      // Set up a callback to get notified when when devices show up.
      cxnButton.refreshList(cxn.devices);
      cxnButton.watch = cxn.connectionChanged.subscribe(cxnButton.refreshList);
      cxn.startScanning();
    }
    cxnButton.configBtnScan(cxn.scanning);
  };

  // Update the list of devices in the configuration box
  cxnButton.refreshList = function (bots) {
    // TODO, might be able to use data binding to do this as well.
    cxnButton.devices.removeAll();
    for (var key in bots) {
      if (bots.hasOwnProperty(key)) {
        cxnButton.addItem(key);
      }
    }

    // If scanning has stopped update the button.
    if (!cxn.scanning) {
      cxnButton.configBtnScan(false);
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  cxnButton.configuratorClose = function(div) {
    // Stop looking for visible devices.

    if (cxn.scannning) {
      cxnButton.toggleBtScan();
    }
    ko.cleanNode(div);
    div.parentNode.removeChild(div);
  };

  cxnButton.addItem = function (botName) {
    var targetName = cxnButton.deviceName;
    var item = ko.observable({
      name: botName, //+ faBlueTooth,
      selected: ko.observable(botName === targetName)
    });
    cxnButton.devices.unshift(item);
  };

  return cxnButton;
}();
