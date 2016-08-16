// Copyright (c) 2016 Paul Austin - SDG
editor = {
  blocks: [],
  svg: document.getElementById('editorCanvas'),
  teakCode: document.getElementById('teakCode'),
  lastSnapSocket: null,
  elementToBlock: function(el) {
      var blockId = el.getAttribute('block-id');
      // TODO If none found log error and substitute fake block
      return this.blocks[blockId];
  },
};

editor.teakCode.value = "(comment 'still in early development')";

function dmoveRect(rect, dx, dy) {
  rect.left += dx;
  rect.top += dy;
  rect.right += dx;
  rect.bottom += dy;
}

//TODO change this to a left, right, over, nowhere-near reply
function intersectRect(dragRect, r2) {
  return !(r2.left > dragRect.right ||
           r2.right < dragRect.left-60 ||
           r2.top > dragRect.bottom ||
           r2.bottom < dragRect.top);
 }

function FunctionBlock (x, y, blockName) {
  // Make an JS object that wraps an SVG object
  this.rect  = {
      left:   0,
      top:    0,
      right:  80,
      bottom: 80,
  };

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;
  this.dragging = false;

  // Drag state information
  this.snapTarget = null;   // Object to append, prepend, replace
  this.targetShadow = null; // Svg element to hilite target location

  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'function-block');
  // For safari 8/14/2016 rx or ry must be explicitly set other wise rx/ry
  // values in css will be ignored. Perhasp a more optimized rect is used.
  rect.setAttribute('rx', 1);
  rect.setAttribute('block-id', editor.blocks.length);

  var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('class', 'function-text');
  text.setAttribute('x', '10');
  text.setAttribute('y', '45');
  text.textContent = blockName;

  group.appendChild(rect);
  group.appendChild(text);

  this.el = group;
  this.dmove(x, y);
  editor.svg.appendChild(group);
};

FunctionBlock.prototype.setDraggingState = function (state) {

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
}

FunctionBlock.prototype.dmove = function (dx, dy) {
  var block = this;
  while (block !== null) {
   //hack(
    dmoveRect(block.rect, dx, dy);
    block.el.setAttribute ('transform', 'translate (' +  block.rect.left + ' ' + block.rect.top + ')');
   // block.el.children(0).style.x = block.rect.left;
   // block.el.children(0).style.y = block.rect.top;
    block = block.next;
  }
}

FunctionBlock.prototype.hilite = function(state) {
  if (state) {
    // bring hilite block to top. block dont normally overlap
    // but ones that are being dragged need to.
    editor.svg.appendChild(this.el);
    this.el.style.fill = 'blue';
//    this.el.style.filter = 'url(#dropshadow)';
  } else {
    this.el.style.fill = 'purple';
//    this.el.style.filter = null;
  }
}

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

  if (this.snapTarget !== target) {
    this.snapTarget = target;
    this.removeTargetShadow();
    if (target !== null) {
      this.insertTargetShadow(target);
    }
  }
};

// Show the socket this block will be put in when dragging stops.
FunctionBlock.prototype.insertTargetShadow = function(target) {
  var block = this;
  var x = target.rect.right;
  while (block !== null) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.setAttribute('class', 'shadow-block');
    el.setAttribute('rx', 1);
    el.style.x = x;
    el.style.y = target.rect.top;
    editor.svg.insertBefore(el, editor.svg.firstChild);
    block.targetShadow = el;
    x += 80;
    block = block.next;
  }
}

FunctionBlock.prototype.removeTargetShadow = function() {
  var block = this;
  while (block !== null) {
    if (block.targetShadow !== null) {
      editor.svg.removeChild(block.targetShadow);
      block.targetShadow = null;
    }
    block = block.next;
  }
}

FunctionBlock.prototype.moveToPossibleTarget = function() {
  if (this.snapTarget !==  null && this.targetShadow !== null) {
    // Insert the block in the list
    if(true /* after */) {
      this.prev = this.snapTarget;
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
  }
  this.hilite(false);
  this.removeTargetShadow();
  this.snapTarget = null;
}

function easeToTarget(timeStamp, block) {
  var frame = block.animateState.frame;
  block.dmove(block.animateState.adx, block.animateState.ady);
  if (frame > 1) {
    block.animateState.frame = frame - 1;
    requestAnimationFrame(function(timestamp) { easeToTarget(timestamp, block); });
  }
}

// Attach these interactions properties based on the class property of the DOM elements
interact('.function-block')
  .rectChecker(function (element) {
    // Find the rectangle based on the model, not the SVG element itself
    var block = editor.elementToBlock(element);
    return {
      left  : block.x,
      top   : block.y,
      right : block.x + block.w,
      bottom: block.y + block.h
    };
  })
  .on('hold', function (event) {
  //    editor.elementToBlock(event.target).hilite(true);
  })
  .on('up', function (event) {
    //  editor.elementToBlock(event.target).hilite(false);
  })
  .draggable({
  /*
  restrict: {
      restriction: 'parent',
      endOnly: true,
      elementRect: { left: 0.25, right: 0.75, top: 0.25, bottom: 0.75 },
    },

    */
    inertia: true,
    max: Infinity,
    onstart: function(event) {
      var block = editor.elementToBlock(event.target);
      block.setDraggingState(true);
    },
    onend: function(event) {
      var block = editor.elementToBlock(event.target);
      block.moveToPossibleTarget();
      block.setDraggingState(false);
    },
    onmove: function (event) {
      var block =  editor.elementToBlock(event.target);
      block.dmove(event.dx, event.dy);
      block.hilitePossibleTarget();
      // TODO: if in inertia state (touch is up) and there is a target
      // redirect to it. dont wait for it to coast to 0. That just looks
      // odd.
    }
  });

(function() {
interact.maxInteractions(Infinity);

editor.blocks.push(new FunctionBlock(100,  20, 'cat'));
editor.blocks.push(new FunctionBlock(100, 120, 'dog'));
editor.blocks.push(new FunctionBlock(100, 220, 'fish'));
editor.blocks.push(new FunctionBlock(100, 320, 'bird'));
}());
