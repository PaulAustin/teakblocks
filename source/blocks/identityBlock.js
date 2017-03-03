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
  var bleCon = require('./../bleConnections.js');
  var ko = require('knockout');

  var pb = svgb.pathBuilder;
  var identityBlock = {};

  // Items for selecting a device from a list.
  identityBlock.devices = ko.observableArray([]);
  identityBlock.selectedDevice = null;
  //identityBlock.selectedDevice = ko.observable();
  identityBlock.deviceName = {};

  identityBlock.connect = function(device) {

    if (device === null)
      return;

    // Mark selected, so data-binding will select the item.
    device.selected(true);
    // Mark time stamp 0 so it wont be removed from the list.
    // TODO, once connected the ts will be updated after
    // each communication with the target. If it stop responding
    // then it may stay in the list but be 'greyed out'
    device.ts = 0;

  };

  identityBlock.onDeviceClick = function() {
    // Ah JavaScript... 'this' is NOT identityBlock.
    // It is the knockout item in the observable array.

    var name = this.name;
    if (typeof name === 'string') {
      identityBlock.selectedDevice = this;

      // Find the current item and make sure it is unselected.
      var block = identityBlock.activeBlock;
      var currentName = block.controllerSettings.data.deviceName;

      // Look for an item in the list that matches the blocks name.
      // If it is there then mark the item as selected. This selection
      // is UX only. BT selection happens (XXXXXX else where)
      var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
        return (item().name === currentName);
      });
      if (match) {
        match().selected(false);
      }

      // Move the selected name into the object
      block.controllerSettings.data.deviceName = name;
      block.updateSvg();
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
      status:0,
    };
  };

  identityBlock.configurator = function(div, block) {
    identityBlock.activeBlock = block;
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
    bleCon.startObserving(identityBlock.foundDevice);
  };

  identityBlock.configuratorClose = function(div) {
    bleCon.stopObserving();
    identityBlock.activeBlock = null;
    ko.cleanNode(div);
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

    // Add identity name
    var botName = block.controllerSettings.data.deviceName;
    var text = svgb.createText('block-identity-text svg-clear', 40, 50, botName);
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);

    if (botName !== '-?-') {
      // Connection status dot
      var statusClass = 'block-bot-not-found';
      if (block.controllerSettings.connected > 0 ) {
        statusClass = 'block-bot-connected';
      } else if (block.controllerSettings.connected < 0 ) {
        // Connected but with protocol errors. Might be wrong FW
        // or not really a teakblocks device.
        statusClass = 'block-bot-connection-error';
      }
      root.appendChild(svgb.createCircle('svg-clear ' + statusClass, 40, 65, 5));
    }
  };

  identityBlock.foundDevice = function (bleDeviceInfo) {

    // It the item found matches the block name mark the UX as selected.
    // until that that happens the block should indicate that it is not connected.

    // Does it look like real device?
    if (bleDeviceInfo.name !== undefined) {
      var hwType = '';
      if (bleDeviceInfo.name.startsWith('BBC micro:bit [')) {
        var str = bleDeviceInfo.name.split('[', 2)[1].split(']',1)[0];
        // Over writing name, not a good idea.
        bleDeviceInfo.name = str;
        hwType = 'micro:bit';
      } else {
        // arduino, other...
        hwType = 'unknown';
      }

      var now = Date.now();

      // See if that item already exists, if not, add it.
      var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
        return (item().name === bleDeviceInfo.name);
      });
      if (!match) {
        identityBlock.addItem(bleDeviceInfo, Date.now(), hwType);
      } else {
        match().ts = now;
      }
    }
  };

  identityBlock.addItem = function (hwDescription, timeStamp) {

    var block = identityBlock.activeBlock;
    if (block !== null) {
      var targetName = block.controllerSettings.data.deviceName;
      var item = ko.observable({
        name: hwDescription.name,
        hwDescription: hwDescription,
        selected: ko.observable(name === targetName),
        ts: timeStamp
      });
      identityBlock.devices.unshift(item);
    }
  };

  return identityBlock;
  }();
