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
//var teak = require('teak');
var tf = require('./teak-forms.js');
var teakText = require('./teaktext.js');
var svgb = require('./svgbuilder.js');
var svglog = require('./svglog.js');
var trashBlocks = require('./physics.js');
var fblocks = require('./fblock-settings.js');
var save = require('./save.js');

var tbe = {};

tbe.fblocks = fblocks;
tbe.diagramBlocks = {};
tbe.paletteBlocks = {};
tbe.blockIdSequence = 100;
tbe.currentDoc = 'docA';

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

tbe.loadDoc = function(docName) {

  // First, save the current document.
  var currentDocText = teakText.blocksToText(tbe.forEachDiagramChain);
  console.log('save text is', currentDocText);
  save.saveFile(docName, currentDocText);//document.getElementById('teakCode').innerHTML);

  // Second if they are acrualy switching the load the new one.
  if (tbe.currentDoc !== docName) {
    tbe.clearStates();
    tbe.clearDiagramBlocks();
    tbe.currentDoc = docName;
    var loadedDocText = save.loadFile(docName);
    console.log("loaded text is:", loadedDocText);
  }
};

tbe.nextBlockId = function(prefix) {
  var blockId = prefix + String(tbe.blockIdSequence);
  tbe.blockIdSequence += 1;
  return blockId;
};

/* may be used for loading
tbe.addBlock = function(x, y, name) {
   var block = new this.FunctionBlock(x, y, name);
   block.isPaletteBlock = false;
   block.interactId = tbe.nextBlockId('d:');
   this.diagramBlocks[block.interactId] = block.interactId;
   return block;
};
*/

tbe.addPaletteBlock = function(x, y, name) {
   var block = new this.FunctionBlock(x, y, name);
   block.isPaletteBlock = true;
   block.interactId = tbe.nextBlockId('p:');
   this.paletteBlocks[block.interactId] = block;
   return block;
};

// delete -- delete a chunk of blocs (typically one)
tbe.deleteChunk = function(block, endBlock){

  this.clearStates();

  //Remember any tail so it can be slid over.
  var tail = endBlock.next;

  // Disconnect the chunk from its surroundings.
  if (block.prev !== null) {
    block.prev.next = endBlock.next;
  }
  if (endBlock.next !== null) {
    endBlock.next.prev = block.prev;
  }
  block.prev = null;
  endBlock.next = null;

  // Now that the chunk has been disconnected, measure it.
  var deleteWidth = block.chainWidth;

  // Delete the chunk.
  while(block !== null){

    // remove map entry for the block.
    delete tbe.diagramBlocks[block.interactId];

    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;

    block = block.next;
  }

  // Slide any remaining blocks over to the left
  // the links have already been fixed.
  if (tail !== null) {
    var frameCount = 10;
    var animationState = {
        adx: -deleteWidth / frameCount,
        ady: 0,
        frame: frameCount,
        chunkStart: tail,
        chunkEnd: tail.last,
      };
    tbe.animateMove(animationState);
  }
};

// Copy a chunk, or the rest of the chain, return the copy.
// the section specififed should not have links to parts out side.
tbe.replicateChunk = function(chain, endBlock) {

  this.clearStates(); //???

  var stopPoint = null;
  if (endBlock !== undefined && endBlock !== null) {
    // this might be null as well.
    stopPoint = endBlock.next;
  }

  var newChain = null;
  var newBlock = null;
  var b = null;

  // Copy the chain of blocks and set the newBlock field.
  b = chain;
  while (b !== stopPoint) {
    newBlock = new this.FunctionBlock(b.rect.left, b.rect.top, b.name);
    b.newBlock = newBlock;
    if (newChain === null) {
      newChain = newBlock;
    }

    // TODO can params and contorller settings be combined?
    //newBlock.params = JSON.parse(JSON.stringify(b.params));
    newBlock.controllerSettings = JSON.parse(JSON.stringify(b.controllerSettings));
    newBlock.isPaletteBlock = false;
    newBlock.interactId = tbe.nextBlockId('d:');
    this.diagramBlocks[newBlock.interactId] = newBlock;
    b = b.next;
  }
  // Fix up pointers in the new chain.
  b = chain;
  while (b !== stopPoint) {
    newBlock = b.newBlock;
    newBlock.next = b.mapToNewBlock(b.next);
    newBlock.prev = b.mapToNewBlock(b.prev);
    newBlock.flowHead = b.mapToNewBlock(b.flowHead);
    newBlock.flowTail = b.mapToNewBlock(b.flowTail);
    b = b.next;
  }
  // Clear out the newBlock field, and fix up svg as needed.
  b = chain;
  while (b !== stopPoint) {
    var temp = b.newBlock;
    b.newBlock = null;
    b = b.next;
    temp.fixupChainCrossBlockSvg();
  }

  // Update images in the new chain
  b = newChain;
  while (b !== null) {
    b.updateSvg();
    b = b.next;
  }

  // Return pointer to head of new chain.
  return newChain;
};

//------------------------------------------------------------------------------
// FunctionBlock -- Constructor for FunctionBlock object.
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
  this.funcs = fblocks.bind(blockName);
  if (typeof this.funcs.defaultSettings === 'function' ) {
    this.controllerSettings = this.funcs.defaultSettings();
  } else {
    this.controllerSettings = {controller:'none', data:0 };
  }

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;
  this.flowHead = null;
  this.flowTail = null;
  // Blocks at the top leve have a nesting of 0
  this.nesting = 0;
  this.newBlock = null;

  // Dragging state information.
  this.dragging = false;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.snapAction = null;   // append, prepend, replace, ...
  this.targetShadow = null; // Svg element to hilite target location

  this.svgGroup = svgb.createGroup('drag-group', 0, 0);

  // Create the actual SVG object. Its a group of two pieces:
  // a rounded rect and a group that holds the custom graphics for the block.
  this.svgRect = svgb.createRect('function-block', 0, 0, 80, 80, 10);
  this.svgGroup.appendChild(this.svgRect);
  this.svgCustomGroup = null; // see updateSvg()

  this.dmove(x, y, true);
  this.updateSvg();

  // Add block to the editor tree. This makes it visible.
  tbe.svg.appendChild(this.svgGroup);
};

// Create an image fothe block base on its type.
tbe.FunctionBlock.prototype.updateSvg = function() {
  // Remove the old custom image if they exist.
  if (this.svgCustomGroup !== null) {
    this.svgGroup.removeChild(this.svgCustomGroup);
  }

  // Build custom image for this block.
  this.svgCustomGroup = svgb.createGroup('', 0, 0);
  if (typeof this.funcs.svg === 'function' ) {
    this.funcs.svg(this.svgCustomGroup, this);
  }
  this.svgGroup.appendChild(this.svgCustomGroup);
};

tbe.FunctionBlock.prototype.refreshNesting = function() {
  var nesting = 0;
  var b = this.first;
  while (b !== null) {
    if (b.flowTail !== null) {
      b.nesting = nesting;
      nesting += 1;
    } else if (b.flowHead !== null) {
      nesting -= 1;
      b.nesting = nesting;
    } else {
      b.nesting = nesting;
    }
    b = b.next;
  }
};

// Scan down the chain and allow any block that has cross block graphics
// to update them
tbe.FunctionBlock.prototype.fixupChainCrossBlockSvg = function() {
  // TODO, only refresh nesting when the links actually change.
  // no need to do it during each animation step.
  this.refreshNesting();
  var b = this;
  while (b !== null) {
    if (typeof b.funcs.crossBlockSvg === 'function' ) {
      b.funcs.crossBlockSvg(b);
    }
    b = b.next;
  }
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

// mapToNewBlock -- used by replicateChunk to fix up pointers in a
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
    if (self.rect.left <= (target.rect.left)) {
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
  var targx = 0;
  var frameCount = 10;

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
        frame: frameCount,
        adx: width / frameCount,
        ady: 0,
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
      frame: frameCount,
      adx: dx / frameCount,
      ady: dy / frameCount,
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
// TODO, need ease in/out
tbe.animateMove = function animateMove(state) {
  var frame = state.frame;
  state.chunkStart.dmove(state.adx, state.ady, (frame === 1), state.chunkEnd);
  state.chunkStart.fixupChainCrossBlockSvg();
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
    block.svgCustomGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;
  });
  tbe.diagramBlocks = {};
  tbe.diagramChanged();
};

// Starting at a block that was clicked on find the logical range that
// should be selected, typically that is the selected block to the end.
// But for flow blocks it more subtle.
tbe.findChunkStart = function findChunkStart(clickedBlock) {

  // Scan to end see if a flow tail is found.
  var chunkStart = clickedBlock;
  var b = clickedBlock;
  while (b !== null) {
    // If tail found inlcude the whole flow block.
    if (b.flowHead !== null) {
      chunkStart = b.flowHead;
    }
    // If at the top its a clean place to break the chain.
    if (b.nesting === 0) {
      break;
    }
    b = b.next;
  }
  return chunkStart;
};

// Attach these interactions properties based on the class property of the DOM elements
tbe.configInteractions = function configInteractions() {
  var thisTbe = tbe;

  // Most edit transaction start from code dispatched from this code.
  // know it well and edit with caution. There are subtle interaction states
  // managed in these event handlers.
  interact('.drag-delete')
    .on('down', function () {
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      thisTbe.clearStates();
      thisTbe.deleteChunk(block, block.last);
    });

  interact('.action-dot')
  .on('down', function (event) {
    event.currentTarget.classList.toggle('switch-bg');
  })
  .on('up', function (event) {
    var cmd = event.currentTarget.getAttribute('command');
    var cmdFunction = tbe.commands[cmd];
    if (typeof cmdFunction === 'function') {
      cmdFunction();
    }
    event.currentTarget.classList.toggle('switch-bg');
  });

  // Pointer events to the background go here. Might make sure the even is not
  // right next to a block, e.g. allow some safe zones.
  interact('.editor-background')
    .on('down', function () {
      thisTbe.clearStates();
    });

  // Event directed to function blocks (SVG objects with class 'drag-group')
  // There come in two main types. Pointer events(mouse, track, and touch) and
  // drag events. Drag events start manually, if the semantics of the pointer
  // event inndicate that makes sense. Note that the object at the root of the
  // drag event may different than the object the pointer event came to.
  // For example, dragging may use the head of a flow block, not the tail that was
  // clicked on or that chain dragged might be a copy of the block clicked on.
  //
  // After making change test on FF, Safari, Chrome, desktop and tablet. Most
  // browser breaking behaviour differences have been in this code.

  interact('.drag-group')
    // Pointer events.
    .on('down', function (event) {
      tbe.pointerDownObject = event.target;
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
       event.interaction.stop();
       if (block.isPaletteBlock) {
         // Hold on palette item, any special behaviour here?
         // not for now.
         return;
       }
       // bring up config, dont let drag start
       thisTbe.components.blockSettings.tap(block);
    })
    .on('move', function(event) {
      var interaction = event.interaction;
      // If the pointer was moved while being held down
      // and an interaction hasn't started yet
      if (interaction.pointerIsDown && !interaction.interacting()) {
        if (tbe.pointerDownObject === event.target) {
          var block = thisTbe.elementToBlock(event.target);
          block = tbe.findChunkStart(block);
          var targetToDrag = block.svgGroup;

          // If coming from pallette, or if coming from shift drag
          if (block.isPaletteBlock || event.shiftKey) {
            block = thisTbe.replicateChunk(block);
            targetToDrag = block.svgGroup;
          }

          // Start a drag interaction targeting the clone
          tbe.clearStates();
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
      onstart: function() {
      },
      onend: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if(block.dragging) {
          // If snap happens in coastin-move
          // the chain will no longer be dragging.
          block.moveToPossibleTarget();
          block.setDraggingState(false);
          svglog.clearLog();
        }

        // Serialize after all moving has settled.
        // TODO clean this up, canoverlap next transaction
        setTimeout(thisTbe.diagramChanged(), 500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go.

        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (!block.dragging) {
          // If snap happens in coasting-move
          // the chain will no longer be dragging.
          return;
        }

        // Move the chain to the new location based on deltas.
        block.dmove(event.dx, event.dy, true);

        // Then see if there is a possbile target, a place to snap to.
        var target = block.hilitePossibleTarget();

        // If thre is a target and its in the coasting phase then redirect
        // the coasting to the target.
        if (target !== null) {
          var iStatus = event.interaction.inertiaStatus;
          if ((iStatus !== undefined && iStatus !== null) && iStatus.active) {
            // Its in the coasting state, just move it to the snapping place.
            block.moveToPossibleTarget();
            block.setDraggingState(false);
            svglog.clearLog();
          }
        }
      }
    });
};

tbe.stage1deletion = function(fastr){
  tbe.deleteRay[0].setAttribute('command', 'trashSecond');
  tbe.deleteRay[1].innerHTML = fastr.trashFull;
};
tbe.stage2deletion = function(fastr){
  tbe.clearAllBlocks();
  tbe.deleteRay[0].setAttribute('command', 'trashFirst');
  tbe.deleteRay[1].innerHTML = fastr.trashEmpty;
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

// Action buttons are circle with icons that are at the top.
// icons can be Font-awesome, or ?? (png, svg) will start with FA icons.
/*tbe.addActionButton = function(position, str, command, tweakx) {
  var dx = 0;
  if (tweakx !== undefined) {
    dx = tweakx;
  }
  var group = svgb.createGroup('buttonGroup', 0, 0);
  var circle = svgb.createCircle('action-dot', (40 * (position * 2)), 40, 33);

  circle.setAttribute('command', command);
  var text = svgb.createText('action-dot-text', (45 * (position * 2)) + dx, 57, str);

//infoGroup.append("text").attr("class", "svg-icon").text("\uf005");

  group.setAttribute('buttonCommand', command);

  group.appendChild(circle);
  group.appendChild(text);

  tbe.svg.appendChild(group);

  return group;
  //tbe.svg.appendChild(text);
};*/
tbe.addActionButtons = function(buttons) {
  var position = null;
  var alignment = null;
  var command = '';
  var tweakx = 0;
  var label = '';
  var notFound = true;
  var numMiddle = 0;
  var toReturn = null;
  //var scale = window.innerWidth/80;

  var group = null;
  var circle = null;
  var text = null;

  var dx = 0;
  if (tweakx !== undefined) {
    dx = tweakx;
  }

  // Determine how many buttons are inthe middle
  for (var k = 0; k < buttons.length; k++) {
    if (buttons[k].alignment === 'M' && buttons[k].position > numMiddle) {
      numMiddle = buttons[k].position;
    }
  }

  for (var i = buttons.length - 1; i >= 0; i--) {
    position = buttons[i].position;
    alignment = buttons[i].alignment;
    command = buttons[i].command;
    tweakx = buttons[i].tweakx;
    label = buttons[i].label;

    if (alignment === 'L') {
      group = svgb.createGroup('buttonGroup', 0, 0);
      circle = svgb.createCircle('action-dot', ((0.1 * window.innerWidth) * (position)), 40, 33);

      circle.setAttribute('command', command);
      text = svgb.createText('action-dot-text', ((0.1 * window.innerWidth) * (position)) + dx, 53, label);

      group.appendChild(circle);
      group.appendChild(text);

      tbe.svg.appendChild(group);
      console.log("done");
    } else if(alignment === 'M') { // TODO make seperate loop to find biggest then DEBUG
      if (notFound) {
        numMiddle = position;
        notFound = false;
      }
      var half = window.innerWidth/2;
      group = svgb.createGroup('buttonGroup', 0, 0);
      circle = svgb.createCircle('action-dot', half - (0.05*window.innerWidth), 40, 33);
      //circle = svgb.createCircle('action-dot', half - 0.05, 40, 33);
      //circle = svgb.createCircle('action-dot', (half - (((0.1 * numMiddle)/2)*window.innerWidth)) + ((0.1 * window.innerWidth) * (position)), 40, 33);//middle - (bw x mbc)/2 = left
      circle = svgb.createCircle('action-dot', (half - (((numMiddle + 1) * 0.05)*window.innerWidth)) + ((0.1 * window.innerWidth) * (position)), 40, 33);//middle - (bw x mbc)/2 = left
      console.log("pos:", (half - (((0.1 * numMiddle)/2)*window.innerWidth)) + ((0.1 * window.innerWidth) * (position)), "position:", position, "numMiddle:", numMiddle, "(0.1 * numMiddle)/2", (0.1 * numMiddle)/2);
      circle.setAttribute('command', command);
      text = svgb.createText('action-dot-text', (half - (((numMiddle + 1) * 0.05)*window.innerWidth)) + ((0.1 * window.innerWidth) * (position)) + dx, 53, label);

      group.appendChild(circle);
      group.appendChild(text);

      tbe.svg.appendChild(group);
      if(buttons[i].command === 'trashFirst'){
        toReturn = [circle, text];
      }
    } else if (alignment === 'R') {
      group = svgb.createGroup('buttonGroup', 0, 0);
      circle = svgb.createCircle('action-dot', window.innerWidth - ((0.1 * window.innerWidth) * (position)), 40, 33);

      circle.setAttribute('command', command);
      text = svgb.createText('action-dot-text', window.innerWidth - ((0.1 * window.innerWidth) * (position)) + dx, 53, label);

      group.appendChild(circle);
      group.appendChild(text);

      if (buttons[i].command === 'copyToClipboard') {
        group.setAttribute('class', 'copy-button');
      }

      tbe.svg.appendChild(group);
    }
  }

  return toReturn;
  //infoGroup.append("text").attr("class", "svg-icon").text("\uf005");

  //return group;
  //tbe.svg.appendChild(text);
};

tbe.addPalette = function addPalette(palette) {

  /* Using a single row so palette tabs not needed */
  /*
  var tab = svgb.createGroup("",0, 0);
  var tabblock = svgb.createRect('tab-block', 0, 0, 40, 25, 5);
  var text = svgb.createText('tab-text', 10, 20, palette.name);
  var tabIndex = this.tabs.length;
  tab.appendChild(tabblock);
  tab.appendChild(text);
  tab.setAttribute('transform', 'translate(20, ' + (5 + (30 * tabIndex)) + ')');
  tab.setAttribute('letter', palette.name);
  tbe.dropAreaGroup.appendChild(tab);
  */
  this.tabs.push(palette);

  var indent = 10;
  var blocks = palette.blocks;
  var blockTop = window.innerHeight - 90;
  for (var key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      var block = this.addPaletteBlock(indent, blockTop, key, {});
      if (key === 'loop') {
        var blockTail = this.addPaletteBlock(block.rect.right, blockTop, 'tail', {});
        block.next = blockTail;
        blockTail.prev = block;
        // A flow block set has direct pointers between the two end points.
        block.flowTail = blockTail;
        blockTail.flowHead = block;
        blockTail.fixupChainCrossBlockSvg();
      }
      indent += block.chainWidth + 10;
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
