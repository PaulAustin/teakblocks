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
  startBlock.deviceInfos = {};

  startBlock.koDiv = null;
  startBlock.onDeviceClick = function() {
    var block = startBlock.activeBlock;
    block.controllerSettings.data.deviceName = this.name;
    block.updateSvg();
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
      `<div id='scannerDiv' width=185 hieght=185>
        <div class="scroll-div">
          <table id="device-table" class='tf-table' width='100%'>
          <tbody data-bind="foreach: devices">
              <tr data-bind="click: $parent.onDeviceClick;">
                <td data-bind="text: name"></td>
              </tr>
          </tbody>
          </table>
        </div>
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(startBlock, div);

    // Need to be smart about aging out old items.
    // and filetring
    startBlock.devices.removeAll();
    startBlock.startScan();
  };

  startBlock.configuratorClose = function() {
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
    if ((device.name !== undefined) &&
        (startBlock.deviceInfos[device.name] === undefined)) {
      // Add new devices to the list.
      startBlock.devices.push({ name: device.name });
      startBlock.deviceInfos[device.name] = {
        name:device.name,
        device:device,
        selected: false,
        timeStamp: Date.now()
      };
    }
  };

  startBlock.startScan = function () {
    var ble = window.evothings.ble;
    if (ble === undefined) {
      startBlock.devices.removeAll();
      startBlock.devices.push({ name: 'rowbin' });
      startBlock.devices.push({ name: 'zorgav' });
      startBlock.devices.push({ name: 'vargon' });
      startBlock.devices.push({ name: 'rimbor' });
      // Add extra rows so the cell don't stretch to fill the table.
      startBlock.devices.push({ name: '' });
      return;
    } else {
      var self = this;
      ble.stopScan();
      ble.startScan(
        function(device) { self.foundDevice(device); },
        function(errorCode) {
          console.log('error:' + errorCode);
        });
    }
  };

  startBlock.stopScan = function () {
    var ble = window.evothings.ble;
    if (ble === undefined) {
      return;
    } else {
      ble.stopScan();
    }
  };

  return startBlock;
  }();
