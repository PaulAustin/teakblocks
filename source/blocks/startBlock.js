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
  var startBlock = {};

  // Items for selecting a device from a list.
  startBlock.devices = ko.observableArray([]);
  startBlock.selectedDevice = ko.observable();
  startBlock.deviceName = {};
  startBlock.cullTimer = null;

  startBlock.koDiv = null;

  startBlock.onDeviceClick = function() {
    var name = this.selectedDevice();
    if (typeof name === 'string') {
      var block = startBlock.activeBlock;
      block.controllerSettings.data.deviceName = name;
      block.updateSvg();
    }
  };

  // Start block is a work in progress, might not be needed. Might be
  // for naming seperate targets.
  startBlock.tabs = {
    'event': '<i class="fa fa-bolt" aria-hidden="true"></i>',
    'target-bt': '<i class="fa fa-bluetooth-b" aria-hidden="true"></i>',
    'target-usb': '<i class="fa fa-usb" aria-hidden="true"></i>',
  };

  // Initial setting for blocks of this type.
  startBlock.defaultSettings = function() {
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

  startBlock.configurator = function(div, block) {
    startBlock.activeBlock = block;
    startBlock.koDiv = div;
    div.innerHTML =
      `<div id='scannerDiv' class='list-box' width=185 hieght=185>
        <select multiple='multiple' size='6'
          data-bind="
            options:devices,
            optionsText:'name',
            optionsValue:'name',
            value:selectedDevice,
            click:onDeviceClick
            ">
        </select>
      </div>`;

//, selectedOptions:selectedItems
    // Connect the dataBinding.
    ko.applyBindings(startBlock, div);

    // Need to be smart about aging out old items.
    // and filtering
    startBlock.devices.removeAll();
    startBlock.startScan();
  };

  startBlock.configuratorClose = function() {
    startBlock.stopScan();
    startBlock.activeBlock = null;
    ko.cleanNode(startBlock.koDiv);
  };

  startBlock.svg = function(root, block) {
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

  startBlock.foundDevice = function (device) {
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
      var match = ko.utils.arrayFirst(startBlock.devices(), function(item) {
        return (item.name === device.name);
      });
      if (!match) {
        startBlock.devices.unshift({
          name: device.name,
          hwType: hwType,
          device: device,
          selected: false,
          ts: now
        });
      } else {
        match.ts = now;
      }
    }
  };

  startBlock.cullDevices = function () {
    // for testing on desktop,
    // startBlock.foundDevice({name:'BBC micro:bit [gato]'});
    var now = Date.now();
    startBlock.devices.remove(function(item) {
      if (item.ts === 0) {
        return false;
      }
      return ((now - item.ts) > 2500);
    });
    startBlock.cullTimer = setTimeout(startBlock.cullDevices, 1000);
  };

  startBlock.startScan = function () {
    // Put empty  rows so the cell don't stretch to fill the table.
    startBlock.devices.removeAll();

    // Start up scanning, or add fake ones.
    var ble = window.evothings.ble;
    if (ble === undefined) {
      startBlock.devices.unshift({ name: 'rowbin', selected:false, ts: 0});
      startBlock.devices.unshift({ name: 'zorgav', selected:false, ts: (Date.now()+1500)});
      startBlock.devices.unshift({ name: 'vargon', selected:false, ts: (Date.now()+3000)});
      startBlock.devices.unshift({ name: 'rimbor', selected:false, ts: 0});
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
    startBlock.cullDevices();
  };

  startBlock.stopScan = function () {
    var ble = window.evothings.ble;
    if (ble === undefined) {
      return;
    } else {
      ble.stopScan();
    }
    if (startBlock.cullTimer !== null) {
      clearTimeout(startBlock.cullTimer);
      startBlock.cullTimer = null;
    }
  };

  return startBlock;
  }();
