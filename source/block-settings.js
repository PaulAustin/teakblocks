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
  var ko = require('knockout');
  var tbe = require('./teakblocks.js');

  // Set of propoerties that can be bound to.
  var blockSettings = {
    visible: ko.observable(true),
    activeBlock:null
  };

  blockSettings.insert = function(domRoot) {
    // Create a div shell that will be positioned and scaled as needed.
    var commonDiv = document.createElement("div");
    commonDiv.innerHTML =
    `<div id="block-settings" class="block-config-form blockform">
        <div class="block-settings-editops">
          <button id="block-run">
            <i class="fa fa-step-forward" aria-hidden="true"></i>
          </button>
          <button id="block-clone">
            <i class="fa fa-clone" aria-hidden="true"></i>
          </button>
          <button id="block-clear">
            <i class="fa fa-trash-o" aria-hidden="true"></i>
          </button>
        </div>
        <div id="block-settings-custom"></div>
        <div id="block-settings-controllers" class="block-controllers"></div>
    </div>`;
    domRoot.appendChild(commonDiv);
    blockSettings.commonDiv = commonDiv;

    // Add delete button handler.
    document.getElementById('block-clear').onclick = function() {
      if (blockSettings.activeBlock !== null) {
        tbe.deleteChunk(blockSettings.activeBlock, blockSettings.activeBlock);
      }
    };

    // Get a reference to the div that is customized for each block.
    blockSettings.customDiv = document.getElementById('block-settings-custom');

    // Get a reference to the div that lists controllers.
    blockSettings.controllersDiv = document.getElementById('block-settings-controllers');
  };

  blockSettings.hide = function(exceptBlock) {
    // If the form is actally associated with a block, hide it.
    if (this.activeBlock !== null && this.activeBlock !== exceptBlock) {
      this.activeBlock = null;

      // Start animation to hide the form.
      var div = blockSettings.commonDiv;
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.transform = 'scale(0.33, 0.0)';
      div.style.pointerEvents = 'all';

      // Clear out the custom part of the form
      blockSettings.customDiv.innerHTML = '';
    }
  };

  // A block has been  tapped on, the gesture for the config page.
  // bring it up, toggle or move as apppropriate.
  blockSettings.tap = function(block) {
    if (this.activeBlock === block) {
      // Clicked on the same block make it go away.
      this.hide();
    } else if (this.activeBlock !== null) {
      // Clicked on another block, but one is showing, make it go away.
      // Then show the new one once the hide transition is done.
      this.hide();
      this.activeBlock = block;
      this.addEventListener('transitionend', this.showActive);
    } else {
      // Nothing showing, make it popop up.
      this.activeBlock = block;
      this.showActive(null);
    }
  };

  blockSettings.defaultContents = function(div) {
    // For initial testing.
    div.innerHTML =
    `<div>
        <br>
        <label><input type="checkbox" id="show-code" data-bind="checked:visible">
          <span class="label-text">Power</span>
        </label>
    </div>`;
  //  ko.applyBindings(blockSettings, div);
  };

  // Internal method to show the form.
  blockSettings.showActive = function (event) {
    if (event !== null) {
      this.removeEventListener('transitionend', this.showActive);
    }

    // Allow block to customize bottom part of form.
    var congfigurator = this.activeBlock.funcs.configurator;
    if (typeof congfigurator === "function") {
      congfigurator(blockSettings.customDiv);
    } else {
      blockSettings.defaultContents(blockSettings.customDiv);
    }

    // Add controller tabs at the bottom.
    var controllers = this.activeBlock.funcs.controllers;
    if (typeof controllers === "function") {
      controllers(blockSettings.controllersDiv);
    } else {
      blockSettings.controllersDiv.innerHTML = '';
    }

    // Start animation to show settings form.
    var x = this.activeBlock.rect.left;
    var y = this.activeBlock.rect.bottom;
    var div = blockSettings.commonDiv;
    div.style.transition = 'all 0.0s ease';
    div.style.left = (x-80) + 'px';
    div.style.right = (x+80) + 'px';
    div.style.top = (y+5) + 'px';
    // Second step has to be done in callback in order to allow
    // animation to work.
    setTimeout(function() {
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.width= '240px';
      div.style.transform = 'scale(1.0, 1.0)';
      div.style.pointerEvents = 'all';
    }, 10);
  };

  return blockSettings;
}();
