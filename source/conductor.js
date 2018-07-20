/*
Copyright (c) 2018 Trashbots - SDG

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
  var log = require('./log.js');
  var conductor = {};
  var cxnButton = require('./cxnButton.js');
  var cxn = require('./cxn.js');

  conductor.cxn = require('./cxn.js');
  conductor.tbe = null;
  conductor.hbTimer = 0;
  conductor.sensorTimer = 0;
  conductor.runningBlocks = [];
  conductor.count = null;
  conductor.defaultPix = '0000000000';

  // Once the conductor system is connected to the editor,
  // it will ping the target device to determine
  // its current state.

  // Scan the editor looking for identity blocks
  // For each id block,
  // determine if it is currently connected and still responding.

  // Give some time for the animation to complete, then remove.

  conductor.activeBits = [];

  conductor.attachToScoreEditor = function(tbe) {
    log.trace('attached to ', tbe);
    conductor.tbe = tbe;
    conductor.linkHeartBeat();
    conductor.cxn.connectionChanged.subscribe(conductor.updateIndentityBlocks);
  };

  // If there is a change in connections update teh indentity blocks
  // TODO this linkage is ver much a bit of a hack.
  conductor.updateIndentityBlocks = function() {
    log.trace(' updating identity blocks');
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      if (chainStart.name === 'identity' || chainStart.name === 'identityAccelerometer') {
        var botName = cxnButton.deviceName;
        var status = conductor.cxn.connectionStatus(botName);
        if (status === conductor.cxn.statusEnum.BEACON) {
          // Try to connect ot it.
          conductor.cxn.connect(botName);
        }
        chainStart.updateSvg();
      }
    });
  };

  conductor.linkHeartBeat = function() {
    conductor.hbTimer = 0;

    // Visit all chains and see if any have changed connection states.
    // conductor.checkAllIdentityBlocks();

    // Set all of the blocks to a regular state.
    conductor.tbe.forEachDiagramBlock(function(b){
      b.svgRect.classList.remove('running-block');
    });

    if (conductor.runningBlocks.length > 0) {
      for (var i = 0; i < conductor.runningBlocks.length; i++) {
        var block = conductor.runningBlocks[i];
        if (block !== null) {
          if(conductor.loopCount === undefined && block.isLoopHead()){
            conductor.loopCount = block.controllerSettings.data.duration;
          }

          if (block.name === 'tail' && conductor.loopCount > 1) {
            block = block.flowHead;
            conductor.loopCount -= 1;
          } else if (block.name === 'tail' && conductor.loopCount === 1) {
            conductor.loopCount = undefined;
            if (block.next !== null) {
              block = block.next;
            } else {
              conductor.stopAll();
            }
          }

          if (block !== null && block.name === 'loop') {
            block = block.next;
          }
          // If this is a new block, get its duration
          if (conductor.count === null) {
            conductor.count = block.controllerSettings.data.duration;
          }

          // If it does not have a duration or it has a duration of 0
          // then set its duration to 1
          if (conductor.count === undefined || conductor.count === '0') {
            conductor.count = 1;
          }
          log.trace(conductor.count);

          if (block !== null) {
            conductor.count = parseInt(conductor.count, 10);

            // Mark the current block as running
            var id = block.first;
            if (id.name === 'identity' || id.name === 'identityAccelerometer') { // && !block.isCommented()
              conductor.tbe.svg.appendChild(block.svgGroup);
              block.svgRect.classList.add('running-block');
            }

            // If the block has not played for its entire duration,
            // continue playing the block.
            // Otherwise, get the next block ready and set count to null.
            conductor.playOne(block);
            if (conductor.count > 1) {
              conductor.count -= 1;
            } else {
              conductor.runningBlocks[i] = block.next;
              conductor.count = null;
            }
          }
        }
      }
    }
    conductor.hbTimer = setTimeout(function() { conductor.linkHeartBeat(); }, 1000);
  };

  // Find all start all blocks and start them running.
  conductor.playAll = function() {
    conductor.runningBlocks = [];
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      // Ignore chains that don't start with an identity block.
      if (chainStart.name === 'identity') {
        conductor.runningBlocks.push(chainStart.next);
      } else if(chainStart.name === 'identityAccelerometer') {
        chainStart.controllerSettings.data.run = "yes";
        conductor.checkSensorIdentity(chainStart);
      }
    });
  };

  conductor.satisfiesStart = function(big, small, block) {
    if(block.controllerSettings.data.comparison === '<'){
      // small is less than value
      return small < parseInt(block.controllerSettings.data.value, 10);
    } else if(block.controllerSettings.data.comparison === '>'){
      return big > parseInt(block.controllerSettings.data.value, 10);
    } else if(block.controllerSettings.data.comparison === '='){
      return (small < parseInt(block.controllerSettings.data.value, 10) && big > parseInt(block.controllerSettings.data.value, 10) );
    }
    return null;
  };

  conductor.checkSensorIdentity = function(block) {
    conductor.sensorTimer = 0;
    var data = block.controllerSettings.data;
    conductor.cxn.write(cxnButton.deviceName, '(accel);');

    if(block.name === 'identityAccelerometer' && cxn.accelerometerBig !== null && cxn.accelerometerSmall !== null) {
      var big = cxn.accelerometerBig;
      var small = cxn.accelerometerSmall;
      console.log("Accelerometer Range", big, small);
      if(conductor.satisfiesStart(big, small, block) && data.run === "yes"){
        conductor.runningBlocks.push(block.next);
        data.run = "no";
      }
    }
    conductor.sensorTimer = setTimeout(function() { conductor.checkSensorIdentity(block); }, 500);
  };

  // Stop all running chains.
  conductor.stopAll = function() {
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    var botName = '';
    var message = '(m:(1 2) d:0);';
    var message2 = '(px:' + conductor.defaultPix + ');';
    blockChainIterator(function(chainStart) {
      chainStart.svgRect.classList.remove('running-block');
      // Ignore chains that don't start with an identity block.
      if (chainStart.name === 'identity' || chainStart.name === 'identityAccelerometer') {
        botName = cxnButton.deviceName;
        conductor.cxn.write(botName, message);
        conductor.cxn.write(botName, message2);
      }
    });
    conductor.count = null;
    conductor.runningBlocks = [];
    log.trace('stop all');
    // Single step, find target and head of chain, and run the single block.
  };

  conductor.playOne = function(block) {
    var first = block.first;

    if (first.name === 'identity' || first.name === 'identityAccelerometer') {
      var botName = cxnButton.deviceName;
      var message = '';
      var d = block.controllerSettings.data;
      if (block.name === 'picture') {
        var imageData = d.pix;
        var pixStr = conductor.packPix(imageData);
        message = '(px:' + pixStr + ':' + 1 + ');';
      } else if (block.name === 'servo') {
        message = '(sr:' + 50 + ');';
      } else if (block.name === 'motor') {
        message = '(m:'+ d.motor + ' d:' + d.speed +' b:' + d.duration + ');';
      } else if (block.name === 'twoMotor') {
        message = '(m:(1 2) d:' + d.speed + ');'; // +' b:' + d.duration
      } else if (block.name === 'sound') {
        // pass the Solfege index
        message = '(nt:' + d.s.split(" ")[0] + ');';
        console.log('message', message);
      } else if (block.name === 'wait') {
        message = '';
      }
      conductor.cxn.write(botName, message);
    }
    // Single step, find target and head of chain and run the single block.
  };

  conductor.playSingleChain = function() {
    log.trace('play single chain');
    // The conductor starts one chain (part of the score).
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
      pixStr += str;
    }
    return pixStr;
  };
  return conductor;
}();
