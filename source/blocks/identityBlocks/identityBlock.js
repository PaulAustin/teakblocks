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
  var svgb = require('./../../svgbuilder.js');
  var fastr = require('./../../fastr.js');
  var ko = require('knockout');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var pb = svgb.pathBuilder;
  var identityBlock = {};

  // Initial settings for blocks of this type.
  identityBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What triggers this chain, mouse click, button, message,...
        start:true,
      },
    };
  };

  identityBlock.configuratorOpen = function(div, block) {
    identityBlock.activeBlock = block;
    div.innerHTML =
      `<div class='group-div'>
        <div class='svg-clear'>Play upon program run<div/>
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(identityBlock, div);
  };

  // Close the identity blocks and clean up hooks related to it.
  identityBlock.configuratorClose = function(div) {
    identityBlock.activeBlock = null;
    ko.cleanNode(div);
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityBlock.svg = function(root, block) {
    var arrowHead = svgb.createText('fa fas svg-clear block-identity-text', 40, 55, fastr.play);
    var arrowBody = svgb.createRect('svg-clear block-identity-text', 10, 35, 40, 10, 5);
    root.appendChild(arrowHead);
    root.appendChild(arrowBody);
  };

  return identityBlock;
  }();
