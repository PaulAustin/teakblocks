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
/*
dmoveRect = function dmoveRect(rect, dx, dy) {
  rect.left += dx;
  rect.top += dy;
  rect.right += dx;
  rect.bottom += dy;
};
*/

module.exports = function (){

interact = require('interact.js');
teakText = require('./teaktext.js');

tbe = {};

tbe.svgns = 'http://www.w3.org/2000/svg';
tbe.diagramBlocks = [];
tbe.paletteBlocks = [];

tbe.init = function init(svg, text) {
  this.svg = svg;
  this.teakCode = text;
  this.initInteactJS();
  interact.maxInteractions(Infinity);
  return this;
};

tbe.elementToBlock = function(el) {
    var text = el.getAttribute('interact-id');

    if (text === null)
      return null;
    values = text.split(':');
    if (values[0] === 'd') {
      return this.diagramBlocks[values[1]];
    } else if (values[0] === 'p') {
      return this.paletteBlocks[values[1]];
    } else {
      return null;
    }
};

tbe.addBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = false;
   block.interactId = 'd:' + this.diagramBlocks.length;
   this.diagramBlocks.push(block);
};

tbe.addPaletteBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = true;
   block.interactId = 'p:' + this.paletteBlocks.length;
   this.paletteBlocks.push(block);
};

tbe.popPaletteItem = function(block){
  var index = this.paletteBlocks.indexOf(block);
  if (index !== -1) {
      // The new palette block has the same location, name, and id.
      var npb = new this.FunctionBlock(block.rect.left, block.rect.top, block.name);
      npb.params = JSON.parse(JSON.stringify(block.params));
      npb.isPaletteBlock = true;
      npb.interactId = block.interactId;
      this.paletteBlocks[index] = npb;
  }
  // Now change the block to a diagramBlock.
  block.isPaletteBlock = false;
  block.interactId = 'd:' + this.diagramBlocks.length;
  this.diagramBlocks.push(block);
};

tbe.FunctionBlock = function FunctionBlock (x, y, blockName) {
  // Make an JS object that wraps an SVG object
  this.rect  = {
      left:   0,
      top:    0,
      right:  80,
      bottom: 80,
  };

  this.name = blockName;

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;

  // Dragging state information.
  this.dragging = false;
  this.coasting = 0;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.snapAction = null;   // append, prepend, replace, ...
  this.targetShadow = null; // Svg element to hilite target location

  var group = document.createElementNS(tbe.svgns, 'g');
  group.setAttribute('class', 'drag-group');

  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)

  var rect = document.createElementNS(tbe.svgns, 'rect');
  rect.setAttribute('class', 'function-block');
  // For safari 8/14/2016 rx or ry must be explicitly set other wise rx/ry
  // values in css will be ignored. Perhasp a more optimized rect is used.
  rect.setAttribute('rx', 1);

  var text = document.createElementNS(tbe.svgns, 'text');
  text.setAttribute('class', 'function-text');
  text.setAttribute('x', '10');
  text.setAttribute('y', '45');
  text.textContent = blockName;

  group.appendChild(rect);
  // group.appendChild(createBranchPath());
  group.appendChild(text);

  this.svgGroup = group;
  this.svgRect= rect;
  this.dmove(x, y, true);
  tbe.svg.appendChild(group);
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
    block.hilite(state);
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
    block.svgGroup.setAttribute ('transform', 'translate (' +  r.left + ' ' + r.top + ')');

    if (block === endBlock) {
      break;
    }
    block = block.next;
  }
};

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
  var thisBlock = this;
  var target = null;
  var overlap = 0;
  var bestOverlap = 0;
  var action = null;
  var rect = null;
  var chainWidth = this.chainWidth;
  // look at every diagram block taking into consideration
  // weather or not it is in  chain.

  // For insert it could snap after the previous block or before the next block
  // which make the most sense?
  tbe.diagramBlocks.forEach(function(entry) {
    if (entry !== thisBlock  && !entry.dragging) {
      rect = {
        left:entry.rect.left,
        top:entry.rect.top,
        right:entry.rect.right,
        bottom:entry.rect.bottom,
      };
      if (entry.next === null) {
        rect.right += 50;
      }
      if (entry.prev === null) {
        rect.left -= 80;
      }
      overlap = tbe.intersectingArea(thisBlock.rect, rect);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        target = entry;
      }
    }
  });

  // Refine the action based on geometery.
  if (target !== null) {
    if (thisBlock.rect.left < target.first.rect.left) {
      action = 'prepend';
      target = target.first;
    } else {
      action = 'append';
      target = target.last;
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

// Show the socket where 'this' block will be put once dragging is complete.
tbe.FunctionBlock.prototype.insertTargetShadows = function(target, action) {
  var block = this;
  var append = (action === 'append');
  var x = append ? target.rect.right : (target.rect.left - this.chainWidth);
  var shadow = null;
  while (block !== null) {
    shadow = document.createElementNS(tbe.svgns, 'rect');
    shadow.setAttribute('class', 'shadow-block');
    shadow.setAttribute('rx', 1);
    shadow.style.x = x;
    shadow.style.y = target.rect.top;
    tbe.svg.insertBefore(shadow, tbe.svg.firstChild);
    block.targetShadow = shadow;
    x += 80;
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
  var endBlock = null;
  if (this.snapTarget !==  null && this.targetShadow !== null) {

    // TODO:assert that chain we have has clean prev/next links
    // Append/Prepend the block(chain) to the list
    if(this.snapAction === 'append') {
      this.prev = this.snapTarget;
      this.snapTarget.next = this;
      // slide down post blocks if insert
      // logically here, in annimation bellow
    } else if (this.snapAction === 'prepend') {
      thisLast = this.last;
      thisLast.next = this.snapTarget;
      this.snapTarget.prev = thisLast;
      endBlock = thisLast;
    } // TODO: insert

    // Set up an animation to move the block
    var dx = parseFloat(this.targetShadow.style.x) - this.rect.left;
    var dy = parseFloat(this.targetShadow.style.y) - this.rect.top;

    var frameCount  = 10;
      // TODO:base frame count on distance to final location.
      // The model snaps directly to the target location
      // but the view eases to it.
    this.animateState = {
      adx: dx / frameCount,
      ady: dy / frameCount,
      frame: frameCount,
    };
    tbe.easeToTarget(0, this, endBlock);
  }
  this.hilite(false);
  this.snapTarget = null;
  this.snapAction = null;
};

tbe.easeToTarget = function easeToTarget(timeStamp, block, endBlock) {
  var frame = block.animateState.frame;
  block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), endBlock);
  if (frame > 1) {
    block.animateState.frame = frame - 1;
    requestAnimationFrame(function(timestamp) { easeToTarget(timestamp, block, endBlock); });
  } else {
    // Once animation is over shadows are covered, remove them.
    block.removeTargetShadows();
  }
};

// Attach these interactions properties based on the class property of the DOM elements
tbe.initInteactJS = function initInteactJS() {
  var thisTbe = tbe;
  interact('.drag-group')
    .on('down', function (event) {
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      block.coasting = 0;
    })
    .on('up', function (event) {
      // Mark the chain as coastin. if it finds a target
      // it will snap to it.
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      block.coasting = 1;
    })
    .on('hold', function(event) {
      var block = thisTbe.elementToBlock(event.target);
      // TODO press and hold...
    })
    .draggable({
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
        if (block === null)
          return;

      if (block.isPaletteBlock) {
        // Turn the palette block into a diagram block.
        thisTbe.popPaletteItem(block);
      }
      block.setDraggingState(true);
      },
      onend: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.coasting > 0) {
          block.coasting = 0;
          block.moveToPossibleTarget();
          block.setDraggingState(false);
        }
        // Serialize after all moving has settled. TODO clean this up.
        setTimeout(thisTbe.diagramChanged(), 500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go. If a target is found
        // in the coasting state, start the animation to the target.
        // dont wait to coas to a stop.
        var block =  thisTbe.elementToBlock(event.target);
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
  this.teakCode.value = teakText.blocksToText(tbe.diagramBlocks);
};

return tbe;
}();
