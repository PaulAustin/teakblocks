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
  var interact = require('interact.js');
  var tbe = require('./teakblocks.js');
  var conductor = require('./conductor.js');

  // Set of propoerties that can be bound to.
  var blockSettings = {
    visible: ko.observable(true),
    activeBlock:null
  };

  blockSettings.insert = function(domRoot) {
    // Create a div shell that will be positioned and scaled as needed.
    var commonDiv = document.createElement("div");
    var groupDiv = document.createElement("div");
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
        <!--div id="block-controller-tabs"></div-->
    </div>`;//TABS - uncomment html
    groupDiv.innerHTML =
    `<div id="block-settings" class="block-config-form blockform">
        <div class="block-settings-editops"><button id="block-run">
            <i class="fa fa-step-forward" aria-hidden="true"></i>
          </button><button id="block-clone">
            <i class="fa fa-clone" aria-hidden="true"></i>
          </button><button id="block-clear">
            <i class="fa fa-trash-o" aria-hidden="true"></i>
          </button></div>
    </div>`;
    domRoot.appendChild(commonDiv);
    domRoot.appendChild(groupDiv);
    blockSettings.commonDiv = commonDiv;
    blockSettings.groupDiv = groupDiv;

    // Add step/run button handler.
    document.getElementById('block-run').onclick = function() {
      conductor.playOne(blockSettings.activeBlock);
    };

    // Add delete button handler.
    document.getElementById('block-clone').onclick = function() {
      // TODO grab whole loop if necessary
      if (blockSettings.activeBlock !== null) {
        // Back up start if necessary for clone to be logical.
        var startBlock = blockSettings.activeBlock;
        if (startBlock.flowHead !== null) {
          startBlock = startBlock.flowHead;
        }
        // Extend end if necessary for clone to be logical.
        var endBlock = startBlock;
        if (endBlock.flowTail !== null) {
          endBlock = endBlock.flowTail;
        }
        var clone = tbe.replicateChunk(startBlock, endBlock);

        // move it to some open space
        // TODO use more logic to find a good place to put the block.
        var dy = -140;
        if (clone.rect.top < 140) {
          dy = 140;
        }
        var animateClone = {
          frame: 20,
          adx: 0,
          ady: dy / 20,
          chunkStart: clone,
          chunkEnd: clone.last
        };
        tbe.animateMove(animateClone);
        //clone.dmove(0, -140, true);
      }
    };

    // Add delete button handler.
    document.getElementById('block-clear').onclick = function() {
      // TODO grab whole loop if necessary
      if (blockSettings.activeBlock !== null) {
        // Delete the block.
        var block1 = blockSettings.activeBlock;
        var block2 = null;

        // If ends of a flow block remove both parts,
        // delete the tail first, since it owns the graphics.
        if (block1.flowHead !== null) {
          block2 = block1.flowHead;
        } else if (block1.flowTail !== null) {
          block2 = block1;
          block1 = block1.flowTail;
        }
        tbe.deleteChunk(block1, block1);
        if (block2 !== null) {
          tbe.deleteChunk(block2, block2);
        }
      }
    };

    // Get a reference to the div that is customized for each block.
    blockSettings.customDiv = document.getElementById('block-settings-custom');

    // Get a reference to the div that lists controllers.
    //blockSettings.controllersDiv = document.getElementById('block-controller-tabs');//TABS - uncomment
  };

  blockSettings.hide = function(exceptBlock, diagram) {

    var diagramChanger = true;
    var isSelectedBlock = false;

    if(this.activeBlock !== null && this.activeBlock.isSelected()){
      isSelectedBlock = true;
    }

    // If the form is actally associated with a block, hide it.
    if (this.activeBlock !== null && this.activeBlock !== exceptBlock) {
      if (this.activeBlock.funcs.configuratorClose !== undefined) {
        this.activeBlock.funcs.configuratorClose(this.customDiv, this.activeBlock);
        // TODO too aggresive, but works
      }
      this.activeBlock = null;

      var div = null;

      // Start animation to hide the form.
      if(isSelectedBlock){
        div = this.groupDiv;
      } else{
        div = this.commonDiv;
      }
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.transform = 'scale(0.33, 0.0)';
      div.style.pointerEvents = 'all';

      // Clear out the custom part of the form
      this.customDiv.innerHTML = '';

      this.tabNames = [];
      this.tabButtons = [];
    }
    // Catch the clear states from the redo button
    if(diagram !== undefined){
      diagramChanger = diagram;
    }

    if(diagramChanger){
      tbe.diagramChanged();
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
      setTimeout(function() { blockSettings.showActive(); }, 400);
//      this.addEventListener(this.showActive, 500);
    } else {
      // Nothing showing, make it popop up.
      this.activeBlock = block;
      this.showActive(null);
    }
  };

  // Build the row of tabs one for each controller editor that canbe used
  // by the actor.
  blockSettings.buildControllerTabs = function() {
    // Clear out old tabs.
    //blockSettings.controllersDiv.innerHTML = '';//TABS - uncomment

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
        //tabsDiv.appendChild(button);//TABS - uncomment

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
      //this.controllersDiv.appendChild(tabsDiv);//TABS - uncomment

      // Select the initial tab
      this.selectActiveTab(this.activeBlock.controllerSettings.controller);
    } else {
      // Add controller tabs at the bottom.
      var controllers = this.activeBlock.funcs.controllers;
      if (typeof controllers === "function") {
        // OLD way, delete once other code merged
        //controllers(blockSettings.controllersDiv);//TABS - uncomment
      } else {
        //blockSettings.controllersDiv.innerHTML = '';//TABS - uncomment
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
    var isSelectedBlock = false;

    if(this.activeBlock !== null && this.activeBlock.isSelected()){
      isSelectedBlock = true;
    }
    if (event !== null) {
    //  this.removeEventListener('transitionend', this.showActive);
    }
    if (this.activeBlock === null) {
      return; // Nothing to show.
    }

    this.buildController();
    this.buildControllerTabs();

    // Start animation to show settings form.
    var x = this.activeBlock.rect.left;
    var y = this.activeBlock.rect.bottom;
    var div = null;
    if(isSelectedBlock){
      div = blockSettings.groupDiv;
    } else{
      div = blockSettings.commonDiv;
    }
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

  blockSettings.sliderInteract = function sliderInteract(domElt) {
    interact('.slider', {context:domElt})
      .origin('self')
      .restrict({drag: 'self'})
      .inertia(true)
      .draggable({
        max: Infinity
      })
      .on('dragmove', function (event) {  // call this function on every move
        var sliderWidth = interact.getElementRect(event.target.parentNode).width;
        var thumbX = event.pageX;
        var thO = 25.0 / 2.0;
        if (thumbX < thO) {
          // thumbX = thO;
        } else if (thumbX > (sliderWidth - (2*thO))) {
          thumbX = sliderWidth - (2*thO);
        }
        var value = event.pageX / sliderWidth;
        console.log('slider move', sliderWidth, event.pageX);
        event.target.style.paddingLeft = thumbX + 'px';
        //event.target.style.paddingLeft = (value * 100) + '%';
        event.target.setAttribute('data-value', value.toFixed(2));
      });
    // interact.maxInteractions(Infinity);
  };

  return blockSettings;
}();
