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
  var ble = require('./../bleConnections.js');
  var ko = require('knockout');

  var pb = svgb.pathBuilder;
  var identityBlock = {};

  // Items for selecting a device from a list.
  identityBlock.devices = ko.observableArray([]);

  identityBlock.onDeviceClick = function() {
    // Ah JavaScript... 'this' is NOT identityBlock.
    // It is the knockout item in the observable array.

    var newBotName = this.name;

    if (typeof name === 'string') {

      var block = identityBlock.activeBlock;
      var currentBotName = block.controllerSettings.data.deviceName;
      if (currentBotName !== newBotName) {
        // Find the current item, and mark it as unslelected.
        var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
          return (item().name === currentBotName);
        });
        if (match) {
          match().selected(false);
        }
        // select the itme that was clicked on.
        this.selected(true);
      }
      // Move the selected name into the object
      block.controllerSettings.data.deviceName = newBotName;
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

  identityBlock.configuratorOpen = function(div, block) {
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

    identityBlock.refreshList(ble.devices);
    ble.observeDevices(identityBlock.refreshList);
    ble.startObserving();
  };

  identityBlock.refreshList = function (bots) {
    // TODO, might be able to use data binding to do this as well.
    identityBlock.devices.removeAll();
    for (var key in bots) {
      if (bots.hasOwnProperty(key)) {
        identityBlock.addItem(key);
      }
    }
    if (identityBlock.activeBlock) {
      identityBlock.activeBlock.updateSvg();
    }
  };

  identityBlock.configuratorClose = function(div) {
    ble.observeDevices(null);
    ble.stopObserving();
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
      var statusClass = 0;
      // Connection status dot
      if (block.controllerSettings.status === 0 ) {
        statusClass = 'block-bot-not-found';
      } else if (block.controllerSettings.status === 1 ) {
        statusClass = 'block-bot-visible';
      } else if (block.controllerSettings.status === 2 ) {
        statusClass = 'block-bot-connecting';
      } else if (block.controllerSettings.status === 3 ) {
        statusClass = 'block-bot-connected';
      } else if (block.controllerSettings.status < 0 ) {
        // Connected but with protocol errors. Might be wrong FW
        // or not really a teakblocks device.
        statusClass = 'block-bot-connection-error';
      }
      root.appendChild(svgb.createCircle('svg-clear ' + statusClass, 40, 65, 5));
    }
  };

  identityBlock.addItem = function (botName) {

    var block = identityBlock.activeBlock;
    if (block !== null) {
      var targetName = block.controllerSettings.data.deviceName;
      var item = ko.observable({
        name: botName,
        selected: ko.observable(botName === targetName)
      });
      identityBlock.devices.unshift(item);
    }
  };

  return identityBlock;
  }();
