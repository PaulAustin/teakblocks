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
  conductor.runningBlocks = [];

  // Once the conductor system is connected to editor, it will ping the target
  // device to determine its current state.

  // Scan the editor looking for identity blocks
  // For each id block. determine if it is currently connected.
  // and still responding.

  // Give some time for the animation to complete, then remove.

  conductor.activeBits = [];

  conductor.attachToScoreEditor = function(tbe) {
    conductor.tbe = tbe;
    conductor.linkHeartBeat();
  };

  conductor.linkHeartBeat = function() {
    conductor.hbTimer = 0;

    // See what replies we have seen in last window
    // Visit all chains and see if any have chained connection state
    // or need to checked during the next heart beat.
    // May look at async notifications from the target that let the editor indicate
    // what part of the score the targets are at.
    conductor.checkAllIdentityBlocks();

    if (conductor.runningBlocks.length > 0) {
      for (var i = 0; i < conductor.runningBlocks.length; i++) {
        var block = conductor.runningBlocks[i];
        if (block !== null) {
          if (block.name === 'tail') {
            block = block.flowHead;
          }
          if (block !== null && block.name === 'loop') {
            block = block.next;
          }
          if (block !== null) {
            console.log(block.name);
            conductor.playOne(block);
            conductor.runningBlocks[i] = block.next;
          }
        }
      }
    }
    conductor.hbTimer = setTimeout(function() { conductor.linkHeartBeat(); }, 1000);
  };

  conductor.checkAllIdentityBlocks = function() {

    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      var botsToConnect = [];
      // Ignore chains that don't start with an identity block.
      if (chainStart.name === 'identity') {
        var botName = chainStart.controllerSettings.data.deviceName;
        var status = conductor.ble.checkDeviceStatus(botName);
        if (chainStart.controllerSettings.status !== status) {
          chainStart.controllerSettings.status = status;
          chainStart.updateSvg();
        }
        if (status === 1) {
          botsToConnect.push(botName);
        }
      }
      // If any found that are not yet connected, connected
      // if connected ones exists that are not still needed, disconnect.
      for (var i = 0; i < botsToConnect.length; i++) {
        conductor.ble.connect(botsToConnect[i]);
      }
    });
  };

  conductor.playAll = function() {
    conductor.runningBlocks = [];
    console.log('play all');
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      // Ignore chains that don't start with an identity block.
      if (chainStart.name === 'identity') {
        conductor.runningBlocks.push(chainStart.next);
      }
    });

    console.log('blocks to run', conductor.runningBlocks);
  };

  conductor.stopAll = function() {
    conductor.runningBlocks = [];
    console.log('stop all');
    // Single step, find target and head of chain and run the single block.
  };

  conductor.playOne = function(block) {
    var first = block.first;
    // Ah the SXSWedu mega hack. Ti took longer to get BLE working
    // due to terminaology mixup with the ubit. os no on device execution system
    // so execution it in the app.

    if (first.name === 'identity') {
      var botName = first.controllerSettings.data.deviceName;
      var message = '';
      if (block.name === 'picture') {
        var imageData = block.controllerSettings.data.pix;
        var pixStr = conductor.packPix(imageData);
        message = '(px:' + pixStr + ');';
      } else if (block.name === 'servo') {
        message = '(sr:' + 50 + ');';
      } else if (block.name === 'motor') {
        message = '(mo:' + 45 + ');';
      }

      if (message !== '') {
        console.log ('block message', message);
        conductor.ble.write(botName, message);
      }

    }
    // Single step, find target and head of chain and run the single block.
  };

  conductor.playSingleChain = function() {
    console.log('play single chain');
    // The conductor starts one chain (part of the score)
  };

  conductor.packPix = function(imageData) {
    var pixStr = '';
    for (var i = 0; i < 5; i++) {
      var value = 0;
      for(var j = 0; j < 5; j++) {
        value *= 2;
        if (imageData[(i*5) + j] !== 0) {
          value += 1;
        }
      }
      var str = value.toString(16);
      if (str.length===1) {
        str = '0' + str;
      }
      pixStr = pixStr + str;
    //  console.log('image in hex',value,str);
    }
    return pixStr;
  };
  return conductor;
}();
