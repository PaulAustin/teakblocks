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

module.exports = function () {
  var svgb = require('./../svgbuilder.js');
  require('./../evothings/easyble.dist.js');
  var ko = require('knockout');

  var pb = svgb.pathBuilder;
  var identityBlock = {};

  // Items for selecting a device from a list.
  identityBlock.devices = ko.observableArray([]);
  identityBlock.selectedDevice = ko.observable();
  identityBlock.deviceName = {};
  identityBlock.cullTimer = null;

  identityBlock.koDiv = null;

  identityBlock.onDeviceClick = function() {
    var name = this.name;
    if (typeof name === 'string') {
      // Mark this item as selected.
      this.selected(true);

      // Find the current item and make sure it is unselected.
      var block = identityBlock.activeBlock;
      var currentname = block.controllerSettings.data.deviceName;
      var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
        return (item().name === currentname);
      });
      if (match) {
        match().selected(false);
      }

      // Move the selected name into the object
      block.controllerSettings.data.deviceName = name;
      block.updateSvg();

      // TODO set hwType icon, connecting status as well.
    }
  };

  // Start block is a work in progress, might not be needed. Might be
  // for naming seperate targets.
  identityBlock.tabs = {
    'event': '<i class="fa fa-bolt" aria-hidden="true"></i>',
    'target-bt': '<i class="fa fa-bluetooth-b" aria-hidden="true"></i>',
    'target-usb': '<i class="fa fa-usb" aria-hidden="true"></i>',
  };

  // Initial setting for blocks of this type.
  identityBlock.defaultSettings = function() {
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
    };
  };

  identityBlock.configurator = function(div, block) {
    identityBlock.activeBlock = block;
    identityBlock.koDiv = div;
    div.innerHTML =
      `<div class='list-box-shell'>
          <ul class='list-box' data-bind='foreach: devices'>
            <li data-bind= "css:{'list-item-selected':selected()}">
              <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
            </li>
          </ul>
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(identityBlock, div);

    // Need to be smart about aging out old items.
    // and filtering
    identityBlock.devices.removeAll();
    identityBlock.startScan();
  };

  identityBlock.configuratorClose = function() {
    identityBlock.stopScan();
    identityBlock.activeBlock = null;
    ko.cleanNode(identityBlock.koDiv);
  };

  identityBlock.svg = function(root, block) {
    var pathd = '';
    pathd =  pb.move(31, 11);
    pathd += pb.hline(18);
    pathd += pb.arc(9, 180, 0, 1, 0, 18);
    pathd += pb.hline(-18);
    pathd += pb.arc(9, 180, 0, 1, 0, -18);
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 31, 20, 2));
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 49, 20, 2));

    var name = block.controllerSettings.data.deviceName;
    var text = svgb.createText('block-start-text svg-clear', 40, 50, name);
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);
  };

  identityBlock.foundDevice = function (device) {
    // Does it look like real device?
    if (device.name !== undefined) {
      var hwType = '';
      if (device.name.startsWith('BBC micro:bit [')) {
        var str = device.name.split('[', 2)[1].split(']',1)[0];
        device.name = str;
        hwType = 'micro:bit';
      } else {
        // arduino, other...
        hwType = 'unknown';
      }

      var now = Date.now();

      // See if that item already exists.
      var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
        return (item().name === device.name);
      });
      if (!match) {
        identityBlock.addItem(device.name, Date.now(), hwType);
      } else {
        match().ts = now;
      }
    }
  };

  identityBlock.addItem = function (name, timeStamp) {

    var block = identityBlock.activeBlock;
    var targetName = block.controllerSettings.data.deviceName;
    var item = ko.observable({
      name: name,
      selected: ko.observable(name === targetName),
      ts: timeStamp
    });
    identityBlock.devices.unshift(item);
  };

  identityBlock.cullDevices = function () {
    // for testing on desktop,
    // identityBlock.foundDevice({name:'BBC micro:bit [gato]'});
    var now = Date.now();
    identityBlock.devices.remove(function(item) {
      if (item().ts === 0) {
        return false;
      }
      return ((now - item().ts) > 2500);
    });
    identityBlock.cullTimer = setTimeout(identityBlock.cullDevices, 1000);
  };

  identityBlock.startScan = function () {
    // Put empty  rows so the cell don't stretch to fill the table.
    identityBlock.devices.removeAll();

    // Start up scanning, or add fake ones.
    var ble = window.evothings.ble;
    if (ble === undefined) {
      identityBlock.addItem('rowbin', (Date.now()+500) );
      identityBlock.addItem('zorgav', (Date.now()+1000) );
      identityBlock.addItem('vargon', (Date.now()+2000) );
      identityBlock.addItem('vigot',  0 );
      identityBlock.addItem('rimbor', (Date.now()+3000) );
    } else {
      var self = this;
      ble.stopScan();
      ble.startScan(
        function(device) { self.foundDevice(device); },
        function(errorCode) {
          console.log('error:' + errorCode);
        });
    }
    // Periodically remove old items.
    identityBlock.cullDevices();
  };

  identityBlock.stopScan = function () {
    var ble = window.evothings.ble;
    if (ble === undefined) {
      return;
    } else {
      ble.stopScan();
    }
    if (identityBlock.cullTimer !== null) {
      clearTimeout(identityBlock.cullTimer);
      identityBlock.cullTimer = null;
    }
  };

  return identityBlock;
  }();
