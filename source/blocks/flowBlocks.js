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
  // var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var flowBlockHead = {};
  var flowBlockTail = {};
  var flowBlockWidth = 50;

  // List of HTML snippets used for controller tabs.
  // flow block uses text labels for now.
  flowBlockHead.tabs= {
    // Simple interation count based for loop
    'forLoop' : 'for',
    // Loop while something is true
    //'whileLoop'  : 'while',
    // Skip body if condition not true
    'ifThen'   : 'if'
  };

  flowBlockHead.keyPadValue = ko.observable(0+" times");

  flowBlockHead.svg = function (root, block) {
    var loop = svgb.createText('svg-clear block-flowhead-loop', 10, 40, '\uf021');
    root.appendChild(loop);
    var data = block.controllerSettings.data.count;
    var count = svgb.createText('svg-clears block-flowhead-count block-stencil-fill', 25, 65, data); //
    count.setAttribute('text-anchor', 'middle');
    root.appendChild(count);
    return root;
  };


  // Initial setting for blocks of this type.
  flowBlockHead.defaultSettings= function() {
    // return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data: {count:5},
      // Indicate what controller is active. This may affect the data format.
      controller: 'forLoop',
      // Width of the block
      width: flowBlockWidth
    };
  };
  flowBlockTail.defaultSettings = flowBlockHead.defaultSettings;

  flowBlockTail.calculateEnclosedScopeDepth = function(blockTail) {
    // walk back from end of a loop to its front and determine the deepest
    // number of scopes it contains. That depth determines how far out
    // the flowBar needs to be.
    var nesting = 0;
    var maxDepth = 0;
    var b = blockTail.prev;
    // Null should not be hit.
    while ((b !== null) && (b !== blockTail.flowHead)) {
      if (b.flowHead !== null) {
        nesting += 1;
        if (nesting > maxDepth) {
          maxDepth = nesting;
        }
      } else if (b.flowTail !== null) {
        nesting -= 1;
      }
      // Walk back looking for head.
      b = b.prev;
    }
    return maxDepth;
  };

  flowBlockTail.svg = function() {
  };

  flowBlockTail.crossBlockSvg = function(block) {
    // Remove old cross block graphic.
    var scb = block.svgCrossBlock;
    if (scb !== undefined) {
      block.svgGroup.removeChild(scb);
    }

    // Make a new one.
    var depth = this.calculateEnclosedScopeDepth(block) + 1;
    // The tail of the flow block does the flow-bar rendering.
    var left = (flowBlockWidth / 2) - (block.left - block.flowHead.left);
    var width = block.right - block.flowHead.left - flowBlockWidth;
    var hieght = (8 * depth);
    var dxBar = 4 * depth;
    var radius = 8;

    var pb = svgb.pathBuilder;
    var pathd = '';
    pathd =  pb.move(left, 0);
    pathd += pb.line(dxBar, -hieght);
    pathd += pb.arc(radius , 60, 0, 1, (radius * 0.9), -(radius * 0.7));
    pathd += pb.hline(width - (2*radius) - (2*dxBar));
    pathd += pb.arc(radius, 60, 0, 1, (radius*0.9), (radius*0.7));
    pathd += pb.line(dxBar, hieght);
    scb = svgb.createPath('flow-path svg-clear', pathd);
    block.svgGroup.insertBefore(scb, block.svgRect);
    block.svgCrossBlock = scb;
  };
  flowBlockHead.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.count; },
      'setValue': function(count) { block.controllerSettings.data.count = count; },
      'type':flowBlockHead,
      'div': div,
      'block': block,
      'min':0,
      'max':100,
      'suffix':" times",
      'numArray': ["1", "2", "3", "4", "5","6", "7", "8", "9", "0", "<-"],
      'calcLayout': 'complex'
    });
  };
  flowBlockHead.configuratorClose = function(div) {
    keypad.closeTabs({'div': div});
  };

  return {flowBlockHead:flowBlockHead, flowBlockTail:flowBlockTail};
}();
