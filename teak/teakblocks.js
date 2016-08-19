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

function initTeakBlockEditor(svg, text) {
    // TODO: move editor from global to constructed object.
    // TODO have caller add items to palette.
    editor.init(svg, text);
    return editor;
}

editor = {
  init: function (svg, text) {
    this.blocks = [];
    this.palette = [];
    this.svg = svg;
    this.teakCode = text;
    initInteactJS();
    initPalettes();
  },

  elementToBlock: function(el) {
      var text = el.getAttribute('block-id');
      values = text.split(':');
      if (values[0] === 'e') {
        return this.blocks[values[1]];
      } else if (values[0] === 'p') {
        return this.palette[values[1]];
      } else {
        return null;
      }
  },
  addBlock: function(x, y, name, params) {
     var block = new FunctionBlock(x, y, name, 'e:' + editor.blocks.length);
     block.params = params;
     block.paletteBlock = false;
     editor.blocks.push(block);
  },
  addPaletteBlock: function(x, y, name, params) {
     var block = new FunctionBlock(x, y, name, 'p:' + editor.palette.length);
     block.params = params;
     block.paletteBlock = true;
     editor.palette.push(block);
  },
  popPaletteItem: function(block, y, x, name, id, newId){
      var index = editor.palette.indexOf(block); 
    if (index !== -1) {

        editor.palette[index] = new FunctionBlock(x, y, name, id);
        editor.palette[index].paletteBlock = true;
    }
    block.paletteBlock = false;
    block.setBlockAttribute(block);
    editor.blocks.push(block);
  }

};

function dmoveRect(rect, dx, dy) {
  rect.left += dx;
  rect.top += dy;
  rect.right += dx;
  rect.bottom += dy;
}

//TODO change this to a left, right, over, nowhere-near reply
function intersectRect(dragRect, r2) {
  return !(r2.left > dragRect.right ||
           r2.right < dragRect.left - 50 ||
           r2.top > (dragRect.bottom - 10) ||
           r2.bottom < (dragRect.top + 10));
 }

function FunctionBlock (x, y, blockName, svg_id) {
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

  this.id = svg_id;

  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'function-block');

  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'function-block');
  // For safari 8/14/2016 rx or ry must be explicitly set other wise rx/ry
  // values in css will be ignored. Perhasp a more optimized rect is used.
  rect.setAttribute('rx', 1);
  rect.setAttribute('block-id', svg_id);

  var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('class', 'function-text');
  text.setAttribute('x', '10');
  text.setAttribute('y', '45');
  text.textContent = blockName;

  group.appendChild(rect);
  group.appendChild(text);

  this.el = group;
  this.rrect= rect;

  this.dmove(x, y, true);
  editor.svg.appendChild(group);
}

FunctionBlock.prototype.setDraggingState = function (state) {
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

FunctionBlock.prototype.setBlockAttribute = function(event){
  event.id = 'e:' + editor.blocks.length;
  event.rrect.setAttribute('block-id', 'e:' + editor.blocks.length);
};


FunctionBlock.prototype.dmove = function (dx, dy, snapToInt) {
  var block = this;
  while (block !== null) {
    var r = block.rect;
    dmoveRect(r, dx, dy);
    if (snapToInt) {
      r.top = Math.round(r.top);
      r.left = Math.round(r.left);
      r.bottom = Math.round(r.bottom);
      r.right = Math.round(r.right);
    }
    block.el.setAttribute ('transform', 'translate (' +  r.left + ' ' + r.top + ')');
    block = block.next;
  }
};

FunctionBlock.prototype.hilite = function(state) {
  if (state) {
    // bring hilite block to top. block dont normally overlap
    // but ones that are being dragged need to.
    editor.svg.appendChild(this.el);
    this.rrect.setAttribute('class', 'function-block-dragging');
  } else {
    this.rrect.setAttribute('class', 'function-block');
  }
};

FunctionBlock.prototype.hilitePossibleTarget = function() {
  var thisBlock = this;
  var target = null;
  editor.blocks.forEach(function(entry) {
    if (entry !== thisBlock  && !entry.dragging && (entry.next === null)) {
      if (intersectRect(thisBlock.rect, entry.rect)) {
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
FunctionBlock.prototype.insertTargetShadows = function(target) {
  var block = this;
  var x = target.rect.right;
  var shadow = null;
  while (block !== null) {
    shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shadow.setAttribute('class', 'shadow-block');
    shadow.setAttribute('rx', 1);
    shadow.style.x = x;
    shadow.style.y = target.rect.top;
    editor.svg.insertBefore(shadow, editor.svg.firstChild);
    block.targetShadow = shadow;
    x += 80;
    block = block.next;
  }
};

FunctionBlock.prototype.removeTargetShadows = function() {
  var block = this;
  var shadowsToRemove = [];
  while (block !== null) {
    var shadow = block.targetShadow;
    if (shadow !== null) {
      shadowsToRemove.push(shadow);
      shadow.setAttribute('class', 'shadow-block-leave');
      // editor.svg.removeChild(block.targetShadow);
      block.targetShadow = null;
    }
    block = block.next;
  }
  // Give some time for the animation to complete, then remove.
  setTimeout(function() {
    shadowsToRemove.forEach( function(elt) {
      editor.svg.removeChild(elt);
      });
    },
    1000);
};

FunctionBlock.prototype.moveToPossibleTarget = function() {
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
    easeToTarget(0, this);
//    this.removeTargetShadows();
  }
  this.hilite(false);
  this.snapTarget = null;
};

function easeToTarget(timeStamp, block) {
  var frame = block.animateState.frame;
  block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1));
  if (frame > 1) {
    block.animateState.frame = frame - 1;
    requestAnimationFrame(function(timestamp) { easeToTarget(timestamp, block); });
  } else {
    // Once animation is over shadows are covered, remove them.
    block.removeTargetShadows();
  }
}

// Attach these interactions properties based on the class property of the DOM elements
function initInteactJS() {
  interact('.function-block')
    .on('down', function (event) {
      var block = editor.elementToBlock(event.target);
      console.log('on down', block.name);
      block.coasting = 0;
    //    editor.elementToBlock(event.target).hilite(true);
    })
    .on('up', function (event) {
        // Mark the chain as coastin. if it finds a target
        // it will snap to it.
        var block = editor.elementToBlock(event.target);
        console.log('on up', block.name);
        block.coasting = 1;
    })
    .on('hold', function(event) {
      var block = editor.elementToBlock(event.target);
      // TODO press and hold...
    })
    .draggable({
      restrict: {
          restriction: editor.svg,
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
        var block = editor.elementToBlock(event.target);

      if (block.paletteBlock) {
        id = block.id;
        id = id.split(':');

        editor.popPaletteItem(block, block.rect.top, block.rect.left, block.name, block.id, 'e:' + editor.blocks.length);  
      }
      block.setDraggingState(true);
      },
      onend: function(event) {
        var block = editor.elementToBlock(event.target);

        if (block.coasting > 0) {
          block.coasting = -1;
          block.moveToPossibleTarget();
          block.setDraggingState(false);
        }
        // Serialize after all moving has settled. TODO clean this up.
        setTimeout(editor.blocksToText(),500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go. If a target is found
        // in the coasting state, start the animation to the target.
        // dont wait to coas to a stop.
        var block =  editor.elementToBlock(event.target);

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
}

editor.blocksToText = function() {
  var teakText = '(\n';
  editor.blocks.forEach(function(entry) {
    if (entry.prev === null) {
       teakText += '  (chain\n';
      var block = entry;
      while (block !== null) {
        teakText += '    (' + block.name;
        if (block.prev === null) {
          teakText += ' x:' + block.rect.left + ' y:' +  block.rect.top;
        }
        if (block.params !== null) {
          teakText += blockParamsToText(block.params);
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
  editor.teakCode.value = teakText;
};

function blockParamsToText(params) {
  var text = '';
  for(var propertyName in params) {
    text += ' ' + propertyName + ':' + params[propertyName];
  }
  return text;
}

function initPalettes() {
  interact.maxInteractions(Infinity);

  editor.addPaletteBlock(400,  20, 'motor', {port:'a','power':50,'time':'2.5s'});
  editor.addPaletteBlock(100, 120, 'wait',  {time:'2.5s'});
  editor.addPaletteBlock(100, 220, 'light', {color:'blue'});
  editor.addPaletteBlock(100, 320, 'sound', {note:'C5'});
  editor.addPaletteBlock(100, 420, 'start', {when:'dio1-rising'});
  editor.addPaletteBlock(100, 420, 'quark', {flavor:'charmed'});
  //editor.addPaletteBlock(200, 420, 'zebra');

  editor.blocksToText();
}
