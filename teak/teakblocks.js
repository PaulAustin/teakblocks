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
module.tbe = {};
var tbe = module.tbe;

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
      npb.isPaletteBlock = true;
      npb.interactId = block.interactId;
      this.paletteBlocks[index] = npb;
  }
  // Now change the block to a diagramBlock.
  block.isPaletteBlock = false;
  block.interactId = 'd:' + this.diagramBlocks.length;
  this.diagramBlocks.push(block);
};

//TODO change this to a left, right, over, nowhere-near reply
tbe.inSnapRegion = function inSnapRegion(dragRect, r2) {
  return !(r2.left > dragRect.right ||
           r2.right < dragRect.left - 50 ||
           r2.top > (dragRect.bottom - 10) ||
           r2.bottom < (dragRect.top + 10));
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
  this.oldPrev = null; // To help avoid snap back.

  // Dragging state information.
  this.dragging = false;
  this.coasting = 0;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.targetShadow = null; // Svg element to hilite target location

  var group = document.createElementNS(svgns, 'g');
  group.setAttribute('class', 'drag-group');

  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)

  var rect = document.createElementNS(svgns, 'rect');
  rect.setAttribute('class', 'function-block');
  // For safari 8/14/2016 rx or ry must be explicitly set other wise rx/ry
  // values in css will be ignored. Perhasp a more optimized rect is used.
  rect.setAttribute('rx', 1);

  var text = document.createElementNS(svgns, 'text');
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

tbe.FunctionBlock.prototype.setDraggingState = function (state) {
  // If this block is in a chain, disconnect it from blocks in front.
  if (state && (this.prev !== null)) {
    this.prev.next = null;
    this.oldPrev = this.prev;
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

tbe.FunctionBlock.prototype.dmove = function (dx, dy, snapToInt) {
  var block = this;
  while (block !== null) {
    var r = block.rect;
    r.left += dx;
    r.top += dy;
    r.right += dx;
    r.bottom += dy;
    if (snapToInt) {
      r.top = Math.round(r.top);
      r.left = Math.round(r.left);
      r.bottom = Math.round(r.bottom);
      r.right = Math.round(r.right);
    }
    block.svgGroup.setAttribute ('transform', 'translate (' +  r.left + ' ' + r.top + ')');
    block = block.next;
  }
};

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

tbe.FunctionBlock.prototype.hilitePossibleTarget = function() {
  var thisBlock = this;
  var target = null;
  tbe.diagramBlocks.forEach(function(entry) {
    if (entry !== thisBlock  && !entry.dragging && (entry.next === null)) {
      if (tbe.inSnapRegion(thisBlock.rect, entry.rect)) {
        target = entry;
      }
    }
  });
  // Update shadows as needed.
  if (this.snapTarget !== target) {
    if (this.snapTarget !== null) {
      this.removeTargetShadows();
    }
    this.snapTarget = target;
    if (target !== null) {
      this.insertTargetShadows(target);
    }
  }
  return target;
};

// Show the socket this block will be put in when dragging stops.
tbe.FunctionBlock.prototype.insertTargetShadows = function(target) {
  var block = this;
  var x = target.rect.right;
  var shadow = null;
  while (block !== null) {
    shadow = document.createElementNS(svgns, 'rect');
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
  if (this.snapTarget !==  null && this.targetShadow !== null) {
    // Insert the block in the list
    if(true /* after */) {
      this.prev = this.snapTarget;
      this.oldPRev = null;
      this.snapTarget.next = this;
      // slide down post blocks if insert
      // logically here, in annimation bellow
    }

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
    tbe.easeToTarget(0, this);
//    this.removeTargetShadows();
  }
  this.hilite(false);
  this.snapTarget = null;
};

tbe.easeToTarget = function easeToTarget(timeStamp, block) {
  var frame = block.animateState.frame;
  block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1));
  if (frame > 1) {
    block.animateState.frame = frame - 1;
    requestAnimationFrame(function(timestamp) { easeToTarget(timestamp, block); });
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
          block.coasting = -1;
          block.moveToPossibleTarget();
          block.setDraggingState(false);
        }
        // Serialize after all moving has settled. TODO clean this up.
        setTimeout(thisTbe.blocksToText(),500);
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
              (block.coasting > 0) &&
              (target != block.oldPrev)) {
            block.coasting = -1; // ignore further coasting.
            block.moveToPossibleTarget();
            block.setDraggingState(false);
          }
        }
      }
    });
};

tbe.blocksToText = function() {
  var teakText = '(\n';
  this.diagramBlocks.forEach(function(entry) {
    if (entry.prev === null) {
       teakText += '  (chain\n';
      var block = entry;
      while (block !== null) {
        teakText += '    (' + block.name;
        if (block.prev === null) {
          teakText += ' x:' + block.rect.left + ' y:' +  block.rect.top;
        }
        if (block.params !== null) {
          teakText += tbe.blockParamsToText(block.params);
        }
        if (block.targetShadow !== null) {
          // For debugging, this ocassionally happens since
          // compile is asynchronous. TODO fixit.
          teakText += ' shadow:true';
        }
        teakText += ')\n';
        block = block.next;
      }
      teakText += '  )\n';
    }
  });
  teakText += ')\n';
  this.teakCode.value = teakText;
};

tbe.blockParamsToText = function blockParamsToText(params) {
  var text = '';
  for(var propertyName in params) {
    text += ' ' + propertyName + ':' + params[propertyName];
  }
  return text;
};
