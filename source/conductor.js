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
  var conductor = {};

  conductor.ble = require('./bleConnections.js');
  conductor.tbe = null;
  conductor.hbTimer = 0;

  // Once the conductor system is connected to editor, it will ping the target
  // device to determine its current state.

  // Scan the editor looking for identity blocks
  // For each id block. determine if it is currently connected.
  // and still responding.

  // Give some time for the animation to complete, then remove.

  conductor.activeBits = [];

  conductor.attachToScoreEditor = function(tbe) {
    conductor.tbe = tbe;
    conductor.hbTimer = setTimeout(function() { conductor.linkHeartBeat(); }, 3000);
    conductor.ble.startObserving(conductor.foundBot);
  };

  conductor.foundBot = function(bleDeviceInfo) {
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
    }
    console.log('found device', bleDeviceInfo, hwType);
  };

  conductor.linkHeartBeat = function() {
    console.log('heartBeat');

    // See what replies we have seen in last window
    // Visit all chains and see if any have chained connection state
    // or need to checked during the next heart beat.
    // May look at async notifications from the target that let the editor indicate
    // what part of the score the targets are at.
    conductor.checkAllIdentityBlocks();

    conductor.hbTimer = setTimeout(function() { conductor.linkHeartBeat(); }, 3000);
  };

  conductor.checkAllIdentityBlocks = function() {
    // var currentDocText = teakText.blocksToText(tbe.forEachDiagramChain);
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      // Ignore chains that dont start with an identity block.

      if (chainStart.name === 'identity') {
        var botName = chainStart.controllerSettings.data.deviceName;
        var status = conductor.ble.checkDeviceStatus(botName);
        if (chainStart.controllerSettings.status !== status) {
          chainStart.controllerSettings.status = status;
          chainStart.updateSvg();
        }
      }
    });
  };

  conductor.playAll = function() {
    console.log('play all');
    // The conductor starts the whole band on the whole score
  };

  conductor.stopAll = function() {
    console.log('stop all');
    // Single step, find target and head of chain and run the single block.
  };

  conductor.playOne = function(block) {
    console.log('play single block', block.name);
    // Single step, find target and head of chain and run the single block.
  };

  conductor.playSingleChain = function() {
    console.log('play single chain');
    // The conductor starts one chain (part of the score)
  };


  return conductor;
}();
