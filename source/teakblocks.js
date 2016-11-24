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

module.exports = function (){

var assert = require('assert');
var interact = require('interact.js');
//zzz6 var teak = require('teak');
var tf = require('./teak-forms.js');
var teakText = require('./teaktext.js');
var svgb = require('./svgbuilder.js');
var svglog = require('./svglog.js');
var trashBlocks = require('./physics.js');
var fblocks = require('./fblock-settings.js');


var tbe = {};

tbe.diagramBlocks = {};
tbe.paletteBlocks = {};
tbe.blockIdSequence = 100;

tbe.forEachDiagramBlock = function (callBack) {
  for (var key in tbe.diagramBlocks) {
    if (tbe.diagramBlocks.hasOwnProperty(key)) {
      var block = tbe.diagramBlocks[key];
      if (typeof block === 'object') {
        callBack(block);
      }
    }
  }
};

tbe.forEachPalette = function (callBack) {
  for (var key in tbe.paletteBlocks) {
    if (tbe.paletteBlocks.hasOwnProperty(key)) {
      var block = tbe.paletteBlocks[key];
      if (typeof block === 'object') {
        callBack(block);
      }
    }
  }
};

tbe.forEachDiagramChain = function (callBack) {
  tbe.forEachDiagramBlock(function(block) {
    if (block.prev === null) {
      callBack(block);
    }
  });
};

tbe.clearStates = function clearStates(block) {
  // clear any showing forms or multi step state.
  // If the user has interacted with a general part of the editor.
  tf.hideOpenForm();
  this.components.blockSettings.hide(block);
};

tbe.init = function init(svg, text) {
  this.svg = svg;
  this.teakCode = text;
  this.background = svgb.createRect('editor-background', 0, 0, 20, 20, 0);
  this.svg.appendChild(this.background);
  this.configInteractions();
  interact.maxInteractions(Infinity);
  this.initPaletteBox();
  return this;
};

tbe.elementToBlock = function(el) {
    var text = el.getAttribute('interact-id');
    if (text === null) {
      console.log('svg elt had no id:', el);
      return null;
    }
    var values = text.split(':');
    var obj = null;
    if (values[0] === 'd') {
      obj = this.diagramBlocks[text];
    } else if (values[0] === 'p') {
      obj = this.paletteBlocks[text];
    }
    if (obj === null)  {
      console.log('block not found, id was <', text, '>');
    }
    return obj;
};

tbe.clearAllBlocks = function() {
  tbe.clearStates();
  trashBlocks(tbe);
};

tbe.nextBlockId = function(prefix) {
  var blockId = prefix + String(tbe.blockIdSequence);
  tbe.blockIdSequence += 1;
  return blockId;
};

tbe.addBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = false;
   block.interactId = tbe.nextBlockId('d:');
   this.diagramBlocks[block.interactId] = block.interactId;
   return block;
};

tbe.addPaletteBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = true;
   block.interactId = tbe.nextBlockId('p:');
   this.paletteBlocks[block.interactId] = block;
   return block;
};

tbe.delete = function(block, endBlock){
  // if this.prev, unlink this.prev.next
  // unlink prev

  while(block !== null){
    //settings.hide();
    //console.log(settings);
    this.clearStates();
    delete tbe.diagramBlocks[block.interactId];
    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;

    if(block === endBlock){
        break;
    }
    block = block.next;
  }
};

tbe.replicate = function(chain){
    var newChain = null;
    var newBlock = null;
    var b = null;

    // Copy the chain of blocks and set the newBlock field.
    b = chain;
    while (b !== null) {
      newBlock = new this.FunctionBlock(b.rect.left, b.rect.top, b.name);
      b.newBlock = newBlock;
      if (newChain === null) {
        newChain = newBlock;
      }

      newBlock.params = JSON.parse(JSON.stringify(b.params));
      newBlock.isPaletteBlock = false;
      newBlock.interactId = tbe.nextBlockId('d:');
      this.diagramBlocks[newBlock.interactId] = newBlock;
      b = b.next;
    }

    // Fix up pointers in the new chain.
    b = chain;
    while (b !== null) {
      newBlock = b.newBlock;
      newBlock.next = b.mapToNewBlock(b.next);
      newBlock.prev = b.mapToNewBlock(b.prev);
      newBlock.loopHead = b.mapToNewBlock(b.loopHead);
      newBlock.loopTail = b.mapToNewBlock(b.loopTail);
      b = b.next;
    }
    // Clear out the newBlock field, and fix up svg as needed.
    b = chain;
    while (b !== null) {
      b.newBlock.fixupCrossBlockSvg();
      b.newBlock = null;
      b = b.next;
    }

    // Return pointer to head of new chain.
    return newChain;
};

//------------------------------------------------------------------------------
// FunctionBlock -- Constructor for FunctionBlock object.
//
//
//      *-- svgGroup
//        |
//        *--- custom graphics for bloc (clear to pointer)
//        |
//        *--- svgRect framing rec common to all blocks
//        |
//        *--- [svgCrossBlock] option behind block region graphics
//
tbe.FunctionBlock = function FunctionBlock (x, y, blockName) {
  // Make a editor modle object that holds onto JS object and wraps
  // the SVG object
  this.rect  = {
      left:   0,
      top:    0,
      right:  80,
      bottom: 80,
  };

  this.name = blockName;
  var funcs = fblocks.bind(blockName);

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;
  this.loopHead = null;
  this.loopTail = null;
  this.nesting = 0;

  // Dragging state information.
  this.dragging = false;
  this.coasting = 0;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.snapAction = null;   // append, prepend, replace, ...
  this.targetShadow = null; // Svg element to hilite target location

  var group = svgb.createGroup('drag-group', 0, 0);
  this.svgGroup = group;

  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)
  var rect = svgb.createRect('function-block', 0, 0, 80, 80, 10);
  this.svgRect= rect;
  group.appendChild(rect);

  // build custom svg elements for this block.
  funcs.svg(group, this);

  this.dmove(x, y, true);
  tbe.svg.appendChild(group);

  // if the block is loop ( or blockopen) then make a block end to go with it.
  // This could be turned insode out so that fblock code does this.
};

tbe.FunctionBlock.prototype.fixupChainSvg = function() {

  var nesting = 0;
  var maxNesting = 0;

  var b = this.first;
  while (b !== null) {
    if (b.loopTail !== null) {
      nesting += 1;
      if (nesting > maxNesting) {
        maxNesting = nesting;
      }
    } else if (b.loopHead !== null) {
      nesting -= 1;
      b.nesting = nesting;
    }
    b = b.next;
  }

  // Fixing blocks down stream will catch all tails.
  // loop graphics are don by the tail, so this should work fine.
  b = this;
  while (b !== null) {
    b.fixupCrossBlockSvg();
    b = b.next;
  }
};

// fixupCrossBlockSvg
// initialize cross block graphics
// cross block graphics are regions or arrows that CONNECTION
// a range of blocks
tbe.FunctionBlock.prototype.fixupCrossBlockSvg = function() {
  if (this.loopHead === null) {
    return;     // A bit of a hack for now.
  }

  var left = 40 - (this.rect.left - this.loopHead.rect.left);
  var width = this.rect.right - this.loopHead.rect.left - 80;
  var radius = 10;

  var scb = this.svgCrossBlock;
  if (scb !== undefined) {
    this.svgGroup.removeChild(scb);
  }

  var pb = svgb.pathBuilder;
  var pathd = '';
  pathd =  pb.move(left, 0);
  pathd += pb.arc(radius, 90, 0, 1, radius, (-radius * (this.nesting + 1)));
  pathd += pb.hline(width - (2 * radius));
  pathd += pb.arc(radius, 90, 0, 1, radius, (radius  * (this.nesting + 1)));
  scb = svgb.createPath('loop-region svg-clear', pathd);
  this.svgGroup.insertBefore(scb, this.svgRect);
  this.svgCrossBlock = scb;
};

Object.defineProperty(tbe.FunctionBlock.prototype, 'first', {
  get: function() {
    var block = this;
    while (block.prev !== null)  {
      block = block.prev;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'last', {
  get: function() {
    var block = this;
    while (block.next !== null)  {
      block = block.next;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'chainWidth', {
  get: function() {
    var block = this;
    var width = 0;
    while (block !== null)  {
      width  += block.rect.right - block.rect.left;
      block = block.next;
    }
    return width;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'blockWidth', {
  get: function() {
    return this.rect.right - this.rect.left;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'blockHeight', {
  get: function() {
    return this.rect.bottom - this.rect.top;
  }});

// Example of an object property added with defineProperty with an accessor property descriptor
Object.defineProperty(tbe.FunctionBlock.prototype, 'interactId', {
  get: function() {
    return this.svgRect.getAttribute('interact-id');
  },
  set: function(id) {
    this.svgGroup.setAttribute('interact-id', id);
    this.svgRect.setAttribute('interact-id', id);
  },
});

// mapToNewBlock -- used by replicate to fix up pointers in a
// copied chain.
tbe.FunctionBlock.prototype.mapToNewBlock = function (object) {
  if (object === undefined || object === null) {
    return null;
  } else {
    return object.newBlock;
  }
};

// Mark all block in the chain starting with 'this' block as being dragged.
// Disconnect from the previous part of the chain.
tbe.FunctionBlock.prototype.setDraggingState = function (state) {
  // If this block is in a chain, disconnect it from blocks in front.
  if (state && (this.prev !== null)) {
    this.prev.next = null;
    this.prev = null;
  }
  // Set the state of all blocks down the chain.
  var block = this;
  while (block !== null) {
    block.dragging = state;
  // block.hilite(state);
    block = block.next;
  }
};

// Change the element class to trigger CSS changes.
tbe.FunctionBlock.prototype.hilite = function(state) {
  if (state) {
    // Bring hilited block to top. Blocks don't normally
    // overlap, so z plane is not important. But blocks
    // that are being dragged need to float above one on
    // the diagram.
    tbe.svg.appendChild(this.svgGroup);
    this.svgRect.setAttribute('class', 'function-block-dragging');
  } else {
    this.svgRect.setAttribute('class', 'function-block');
  }
};

// Move a section of a chain a delta x, y (from this to endBlock)
tbe.FunctionBlock.prototype.dmove = function (dx, dy, snapToInt, endBlock) {
  var block = this;
  if (endBlock === undefined) {
   endBlock = null;
  }

  while (block !== null) {
    var r = block.rect;
    r.left += dx;
    r.top += dy;
    r.right += dx;
    r.bottom += dy;
    if (snapToInt) {
      // Final locations are forced to integers for clean serialization.
      r.top = Math.round(r.top);
      r.left = Math.round(r.left);
      r.bottom = Math.round(r.bottom);
      r.right = Math.round(r.right);
    }

    if (block.svgGroup) {
      block.svgGroup.setAttribute ('transform', 'translate (' +  r.left + ' ' + r.top + ')');
    }

    if (block === endBlock) {
      break;
    }
    block = block.next;
  }
};

//------------------------------------------------------------------------------
// Calculate the intersecting area of two rectangles.
tbe.intersectingArea = function intersectingArea(r1, r2) {
    var x = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
    if (x < 0 )
      return 0;
    var y = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
    if (y < 0) {
      return 0;
    }
    return x * y;
};

tbe.FunctionBlock.prototype.hilitePossibleTarget = function() {
  var self = this;
  var target = null;
  var overlap = 0;
  var bestOverlap = 0;
  var bestRect = null;
  var action = null;
  var rect = null;
  var thisWidth = this.blockWidth;

  // Look at every diagram block taking into consideration
  // weather or not it is in the chain.
  tbe.forEachDiagramBlock(function (entry) {
    if (entry !== self  && !entry.dragging) {
      rect = {
        top:    entry.rect.top,
        bottom: entry.rect.bottom,
        left:   entry.rect.left - (thisWidth * 0.5),
        right:  entry.rect.right - (thisWidth * 0.5),
      };
      if (entry.prev === null) {
        // For left edge, increase gravity field
        rect.left -= thisWidth * 0.5;
      }
      if (entry.next === null) {
        // For right edge, increase gravity field
        rect.right += thisWidth * 1.5;
      }

      overlap = tbe.intersectingArea(self.rect, rect);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestRect = rect;
        target = entry;
      }
    }
  });

  // Refine the action based on geometery.
  if (target !== null) {
    if (self.rect.left < (target.rect.left)) {
      if (target.prev !== null) {
        action = 'insert';
      } else {
        action = 'prepend';
      }
    } else {
      action = 'append';
    }
    if (tbe.components.appSettings.editorXRay()) {
      svglog.logRect(tbe.svg, bestRect, action + ' ' + target.name);
    }
  }

  // Update shadows as needed.
  if (this.snapTarget !== target || this.snapAction !== action) {
    if (this.snapTarget !== null) {
      this.removeTargetShadows();
    }
    this.snapTarget = target;
    this.snapAction = action;
    if (target !== null) {
      this.insertTargetShadows(target, action);
    }
  }
  return target;
};

// Show the shadow blocks to indicate where the blocks will end up if placed
// in the current location.
tbe.FunctionBlock.prototype.insertTargetShadows = function(target, action) {
  var block = this;
  var x = 0;
  var y = target.rect.top;
  if (action === 'prepend') {
    x = target.rect.left - this.chainWidth;
  } else if (action === 'insert') {
    // The shadows will be covered up, and not going to move the
    // down stream blocks until the move is committed.
    // so offset them a bit.
    // TODO show abovw OR based on wherr draggin block are coming from.
    x = target.rect.left - 20;
    y -= 25;
  } else if (action === 'append') {
    x = target.rect.right;
  } else {
    return;
  }
  var shadow = null;
  while (block !== null) {
    shadow = svgb.createRect('shadow-block', x, y, 80, 80, 10);
    tbe.svg.insertBefore(shadow, tbe.background.nextSibling);
    block.targetShadow = shadow;
    x += block.blockWidth;
    block = block.next;
  }
};

tbe.FunctionBlock.prototype.removeTargetShadows = function() {
  var block = this;
  var shadowsToRemove = [];
  while (block !== null) {
    var shadow = block.targetShadow;
    if (shadow !== null) {
      shadowsToRemove.push(shadow);
      shadow.setAttribute('class', 'shadow-block-leave');
      block.targetShadow = null;
    }
    block = block.next;
  }
  // Give some time for the animation to complete, then remove.
  setTimeout(function() {
    shadowsToRemove.forEach( function(elt) {
      tbe.svg.removeChild(elt);
      });
    },
    1000);
};

tbe.FunctionBlock.prototype.moveToPossibleTarget = function() {
  var thisLast = this.last;
  var frameCount = 10;
  var targx = 0;

  assert(this.prev === null);
  assert(thisLast.next === null);

  if (this.snapTarget !==  null && this.targetShadow !== null) {
    // TODO:assert that chain we have has clean prev/next links
    // Append/Prepend the block(chain) to the list
    if(this.snapAction === 'prepend') {
      assert(this.snapTarget.prev === null);
      targx =  this.snapTarget.rect.left - this.chainWidth;
      thisLast.next = this.snapTarget;
      this.snapTarget.prev = thisLast;
    } else if (this.snapAction === 'append') {
      assert(this.snapTarget.next === null);
      targx =  this.snapTarget.rect.right;
      this.prev = this.snapTarget;
      this.snapTarget.next = this;
      // slide down post blocks if insert
      // logically here, in annimation bellow
    } else if (this.snapAction === 'insert') {
      assert(this.snapTarget.prev !== null);
      targx =  this.snapTarget.rect.left;
      // Determin space needed for new segment
      // before its spliced in.
      var width = this.chainWidth;

      thisLast.next = this.snapTarget;
      this.prev = this.snapTarget.prev;
      this.snapTarget.prev.next = this;
      this.snapTarget.prev = thisLast;

      // Set up animation to slide down old blocks.
      var animateInsert = {
        adx: width / frameCount,
        ady: 0,
        frame: frameCount,
        chunkStart: this.snapTarget,
        chunkEnd: this.snapTarget.last
      };
      tbe.animateMove(animateInsert);
    }

    // Set up an animation to move the dragging blocks to new location.
    var dx = targx - this.rect.left;
    var dy = this.snapTarget.rect.top - this.rect.top;

      // TODO:base frame count on distance to final location.
      // The model snaps directly to the target location
      // but the view eases to it.
    var animateSlideDown = {
      adx: dx / frameCount,
      ady: dy / frameCount,
      frame: frameCount,
      chunkStart: this,
      chunkEnd: thisLast
    };
    tbe.animateMove(animateSlideDown);
  } else {
    // Nothing to snap to so leave it where is ended up.
    // still need sound though
    // tbe.audio.drop.play();
  }
  this.hilite(false);
  this.snapTarget = null;
  this.snapAction = null;
};

// animateMove -- move a chunk of block to its new location. The prev and next
// links should already be set up for the final location.
tbe.animateMove = function animateMove(state) {
  var frame = state.frame;
  state.chunkStart.dmove(state.adx, state.ady, (frame === 1), state.chunkEnd);
  state.chunkStart.fixupChainSvg();
  if (frame > 1) {
    state.frame = frame - 1;
    requestAnimationFrame(function() { animateMove(state); });
  } else {
    // Once animation is over shadows are covered, remove them.
    tbe.audio.playSound(tbe.audio.shortClick);
    state.chunkStart.removeTargetShadows();
  }
};

tbe.clearDiagramBlocks = function clearDiagramBlocks() {
  tbe.forEachDiagramBlock(function (block) {
    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;
  });
  tbe.diagramBlocks = {};
  tbe.diagramChanged();
};

// Starting at a block that was clicked on find the logical range that
// should be selected, typically that is the selected block to the end.
// But for loops it more subtle.
tbe.findChunkStart = function findChunkStart(clickedBlock) {
  // If the tail of the loop is selected
  // Scan to end see if a loop tail is found.
  var chunkStart = clickedBlock;
  var b = clickedBlock;
  while (b !== null) {
    if (b.loopTail !== null) {
      chunkStart = b;
    }
    b = b.prev;
  }
  return chunkStart;
};

// Attach these interactions properties based on the class property of the DOM elements
tbe.configInteractions = function configInteractions() {
  var thisTbe = tbe;

  interact('.drag-delete')
    .on('down', function () {
      var block = thisTbe.elementToBlock(event.target);
      thisTbe.clearStates();
      thisTbe.delete(block);
    });

  interact('.drag-delete').dropzone({
  });

  interact('.editor-background')
    .on('down', function () {
      thisTbe.clearStates();
    });

  interact('.drag-group')
    .on('down', function (event) {
      tbe.pointerDownObject = event.target;
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      tbe.clearStates(block);
      block.coasting = 0;
    })
    .on('up', function (event) {
      // Mark the chain as coasting. if it finds a target
      // it will snap to it.
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      block.coasting = 1;
    })
    .on('tap', function(event) {
      var block = thisTbe.elementToBlock(event.target);
      if (block.isPaletteBlock) {
        return;
      }
      thisTbe.components.blockSettings.tap(block);
    })
    .on('hold', function(event) {
       var block = thisTbe.elementToBlock(event.target);

       if (block.isPaletteBlock) {
         return;
       }
       // bring up config, dont let drag start
       event.interaction.stop();
       thisTbe.components.blockSettings.tap(block);
    })
    .on('move', function(event) {
      var interaction = event.interaction;
      // if the pointer was moved while being held down
      // and an interaction hasn't started yet
      if (interaction.pointerIsDown && !interaction.interacting()) {
        if (tbe.pointerDownObject === event.target) {
          var block = thisTbe.elementToBlock(event.target);
          block = tbe.findChunkStart(block);
          var targetToDrag = block.svgGroup;

          // if coming from pallette, or if coming from shift drag
          if (block.isPaletteBlock || event.shiftKey) {
            block = thisTbe.replicate(block);
            targetToDrag = block.svgGroup;
          }

          // Start a drag interaction targeting the clone
          block.setDraggingState(true);
          interaction.start({ name: 'drag' },
                            event.interactable,
                            targetToDrag);
        }
      } else {
        tbe.pointerDownObject = null;
      }
    })
    .draggable({
      manualStart: true, // Drag wont start until initiated by code.
      restrict: {
          restriction: thisTbe.svg,
          endOnly: true,
          // Restrictions, by default, are for the point not the whole object
          // so R and B are 1.x to inlcude the width and height of the object.
          // 'Coordinates' are percent of width and height.
          elementRect: { left: -0.2, top: -0.2, right: 1.2, bottom: 1.2 },
        },
      inertia: {
        resistance: 20,
        minSpeed: 50,
        endSpeed: 1
      },
      max: Infinity,
      onstart: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null) {
          return;
        }
      },
      onend: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.coasting > 0) {
          block.coasting = 0;
          block.moveToPossibleTarget();
        }
        block.setDraggingState(false);

        svglog.clearLog();
        // Serialize after all moving has settled.
        // TODO clean this up, canoverlap next transaction
        setTimeout(thisTbe.diagramChanged(), 500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go. If a target is found
        // in the coasting state, start the animation to the target.
        // dont wait to coas to a stop.

        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.dragging) {
          block.dmove(event.dx, event.dy, true);
        }

        if (block.coasting >= 0) {
          var target = block.hilitePossibleTarget();
          // If target found while coasting, then snap to it.
          // other wise just show the shadows.
          if ((target !== null) &&
              (block.coasting > 0)) {
            block.coasting = -1; // ignore further coasting.
            block.moveToPossibleTarget();
            block.setDraggingState(false);
          }
        }
      }
    });
};

tbe.diagramChanged = function diagramChanged() {
  if (teakText) {
    this.teakCode.value = teakText.blocksToText(tbe.forEachDiagramChain);
  }
};

tbe.buildSvgTabs = function buildSvgTabs() {
};

tbe.sizePaletteToWindow = function sizePaletteToWindow () {
  var w = window.innerWidth;
  var h = window.innerHeight;

  tbe.dropAreaGroup.setAttribute ('transform', 'translate (' +  0 + ' ' + (h - 100) + ')');
  svgb.resizeRect(tbe.dropArea, w, 100);
  svgb.resizeRect(tbe.background, w, h);

  tbe.windowRect = { left:0, top:0, right:w, bottom:h };
  var top = h - 90;

  tbe.forEachPalette(function(block) {
    block.dmove(0, top - block.rect.top, true);
  });
};

tbe.initPaletteBox = function initPaletteBox() {
  document.body.onresize = this.sizePaletteToWindow;
  this.dropAreaGroup = svgb.createGroup("", 0, 0);
  this.dropArea = svgb.createRect('dropArea', 0, 0, window.innerWidth, 100, 0);
  this.dropAreaGroup.appendChild(this.dropArea);
  this.svg.appendChild(this.dropAreaGroup);

  this.tabs = [];
  this.sizePaletteToWindow();
};

tbe.addPalette = function addPalette(palette) {

  var tab = svgb.createGroup("",0, 0);
  var tabblock = svgb.createRect('tab-block', 0, 0, 40, 25, 5);
  var text = svgb.createText('tab-text', 10, 20, palette.name);

  var tabIndex = this.tabs.length;
  this.tabs.push(palette);
  tab.appendChild(tabblock);
  tab.appendChild(text);
  tab.setAttribute('transform', 'translate(20, ' + (5 + (30 * tabIndex)) + ')');
  tab.setAttribute('letter', palette.name);
  tbe.dropAreaGroup.appendChild(tab);

  var blocks = palette.blocks;
  var i = 0;
  var blockTop = window.innerHeight - 90;
  for (var key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      var block = this.addPaletteBlock(80 + (90 * i), blockTop, key, {});
      if (key === 'loop') {
        var blockTail = this.addPaletteBlock(block.rect.right, blockTop, 'tail', {});
        block.next = blockTail;
        blockTail.prev = block;
        // A loop set has direct pointers between the two end points.
        block.loopTail = blockTail;
        blockTail.loopHead = block;
        blockTail.fixupCrossBlockSvg();
        i += 1; // Not quite right, base insertion point on chain length sum.
      }
      i += 1;
    }
  }
};

tbe.initPalettes =  function initPalettes(palettes) {

  document.body.onresize = this.sizePaletteToWindow;
  this.blockObject = palettes;

  this.dropAreaGroup = svgb.createGroup("", 0, 0);
  this.dropArea = svgb.createRect('dropArea', 0, 0, window.innerWidth, 100, 0);
  this.dropAreaGroup.appendChild(this.dropArea);

  this.tabs = [];
  for (var tabIndex = 0; tabIndex < this.blockObject.tabs.length; tabIndex++){

    var tab = svgb.createGroup("",0, 0);
    var tabblock = svgb.createRect('tab-block', 0, 0, 40, 25, 5);
    var tabName = this.blockObject.tabs[tabIndex];
    var text = svgb.createText('tab-text', 10, 20, tabName);

    tab.appendChild(tabblock);
    tab.appendChild(text);

    var letpath = '';
    switch (tabIndex) {
      case 0:
        letpath = 'A';
        break;
      case 1:
        letpath = 'B';
        break;
      case 2:
        letpath = 'C';
        break;
      case 3:
        letpath = 'D';
        break;
      case 4:
        letpath = 'E';
        break;
    }

    tab.setAttribute('transform', 'translate(20, ' + (5 + (30 * tabIndex)) + ')');
    tab.setAttribute('letter', letpath);

    tab.addEventListener('click', function() {
      tbe.clearStates();
      var path = null;
      switch(this.getAttribute('letter')) {
          case 'A':
            path = tbe.blockObject.A;
            break;
          case 'B':
            path = tbe.blockObject.B;
            break;
          case 'C':
            path = tbe.blockObject.C;
            break;
          case 'D':
            path = tbe.blockObject.D;
            break;
          case 'E':
            path = tbe.blockObject.E;
            break;
        }

      for(var i = 0; i < tbe.blockObject.A.length; i++) {
        //find letter inside tag
        // move the palettes to the front.
        // TODO Just move palettes, no need to make new ones.
        tbe.addPaletteBlock(80 + (90 * i), tbe.windowRect.bottom - 90,  path[i],{ });
      }
    });
    tbe.dropAreaGroup.appendChild(tab);
  }
  this.svg.appendChild(this.dropAreaGroup);

  for(var i = 0; i < this.blockObject.A.length; i++) {
    this.addPaletteBlock(80 + (90 * i), 0, this.blockObject.A[i], {port:'a','power':50,'time':'2.5s'});
  }

  this.sizePaletteToWindow();
};

return tbe;
}();
