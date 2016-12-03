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
  var interact = require('interact.js');

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
        <div class="block-settings-editops"><button id="block-run">
            <i class="fa fa-step-forward" aria-hidden="true"></i>
          </button><button id="block-clone">
            <i class="fa fa-clone" aria-hidden="true"></i>
          </button><button id="block-clear">
            <i class="fa fa-trash-o" aria-hidden="true"></i>
          </button></div>
        <div id="block-settings-custom"></div>
        <div id="block-controller-tabs"></div>
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
    blockSettings.controllersDiv = document.getElementById('block-controller-tabs');
  };

  blockSettings.hide = function(exceptBlock) {
    // If the form is actally associated with a block, hide it.
    if (this.activeBlock !== null && this.activeBlock !== exceptBlock) {
      if (this.activeBlock.funcs.configuratorClose !== undefined) {
        this.activeBlock.funcs.configuratorClose(this.customDiv, this.activeBlock);
      }
      this.activeBlock = null;

      // Start animation to hide the form.
      var div = this.commonDiv;
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.transform = 'scale(0.33, 0.0)';
      div.style.pointerEvents = 'all';

      // Clear out the custom part of the form
      this.customDiv.innerHTML = '';

      this.tabNames = [];
      this.tabButtons = [];
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

  // Build the tow of tabs one for each controller editor that canbe used
  // by the actor.
  blockSettings.buildControllerTabs = function() {
    // Clear out old tabs.
    blockSettings.controllersDiv.innerHTML = '';

    // Get the list of tabs wiht HTML snippets
    var tabs = this.activeBlock.funcs.tabs;
    this.tabButtons = [];
    if (tabs !== undefined) {
      this.tabNames = Object.keys(tabs);

      // Build some SOM for the buttons
      var tabCount = this.tabNames.length;
      var tabsDiv = document.createElement('div');
      var width = (100 / tabCount) + '%';

      for (var i = 0; i < tabCount; i++) {
        // Create the button
        var button = document.createElement('button');
        var name = this.tabNames[i];
        blockSettings.tabButtons.push(button);
        tabsDiv.appendChild(button);

        // Configure all its settings.
        button.id = name;
        button.className = 'block-settings-tab';
        button.style.width = width;
        // tweak the curved edges based on position.
        if (i===0) {
          button.style.borderRadius='0px 0px 0px 10px';
        } else if (i === (tabCount-1)) {
          button.style.borderRadius='0px 0px 10px 0px';
        } else {
          button.style.borderRadius='0px';
        }

        // Inject the HTML snippet
        button.innerHTML = tabs[name];
        button.onclick = blockSettings.onClickTab;
      }
      // Add the row of tabs to the view.
      this.controllersDiv.appendChild(tabsDiv);

      // Select the initial tab
      this.selectActiveTab(this.activeBlock.controllerSettings.controller);
    } else {
      // Add controller tabs at the bottom.
      var controllers = this.activeBlock.funcs.controllers;
      if (typeof controllers === "function") {
        // OLD way, delete once other code merged
        controllers(blockSettings.controllersDiv);
      } else {
        blockSettings.controllersDiv.innerHTML = '';
      }
    }
  };

  blockSettings.onClickTab = function() {
    // Since its DOM event, 'this' will be the button.
    blockSettings.selectActiveTab(this.id);
  };

  blockSettings.selectActiveTab = function(name) {
    var count = this.tabNames.length;
    for ( var i = 0; i < count; i++) {
      if (this.tabNames[i] === name) {
        this.tabButtons[i].classList.add('tab-selected');
      } else {
        this.tabButtons[i].classList.remove('tab-selected');
      }
    }
  };

  // Build the middle from part, the controllers editor.
  blockSettings.buildController = function() {
    // Allow block to customize bottom part of form.
    var congfigurator = this.activeBlock.funcs.configurator;
    if (typeof congfigurator === "function") {
      congfigurator(blockSettings.customDiv, this.activeBlock);
    } else {
      blockSettings.customDiv.innerHTML =
      `<div>
          <label><input type="checkbox">
            <span class="label-text">Power</span>
          </label>
      </div>`;
    }
  };

  // Internal method to show the form.
  blockSettings.showActive = function (event) {
    if (event !== null) {
      this.removeEventListener('transitionend', this.showActive);
    }

    this.buildController();
    this.buildControllerTabs();

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
