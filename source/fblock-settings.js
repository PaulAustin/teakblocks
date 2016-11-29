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

var interact = require('interact.js');
var svgb = require('./svgbuilder.js');
var pb = svgb.pathBuilder;
var b = {};

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
  }
  return def;
};

b.unknownBlock = {
  svg: function(root, block) {
    //var group = svgb.createGroup('', 10, 10);
    //root.appendChild(group);
    var text = svgb.createText('function-text svg-clear', 10, 40, block.name);
    root.appendChild(text);
    return root;
  }
};

// Use CSS clases for LED lit state.
function setPicturePixel(svgPixel, state) {
  if (svgPixel === undefined) {
    return;
  }
  if (state === 1) {
    svgPixel.setAttribute('class', 'svg-clear block-picture-led-on');
  } else {
    svgPixel.setAttribute('class', 'svg-clear block-picture-led-off');
  }
}

function pictureEventToIndex(event) {
  // Offset is experimental not supported on all browsers.
  // var x = Math.floor(event.offsetX / 35);
  // var y = Math.floor(event.offsetY / 35);
  var bb = event.target.parentNode.getBoundingClientRect();
  var x = Math.floor((event.pageX - bb.left) / 35);
  var y = Math.floor((event.pageY - bb.top) / 35);
  if (x>4 || y>4) {
    return -1;
  } else {
    return (y * 5) + x;
  }
}

// Picture block made up of a 5x5 LED display
b.pictureBlock = {
  pictSmile: [0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0],
  svg: function(svg) {
    var data = b.pictureBlock.pictSmile;
    var group = svgb.createGroup('svg-clear', 24, 15);
    var box = svgb.createRect('svg-clear block-picture-board', -8, -8, 48, 48, 4);
    group.appendChild(box);
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        var style = '';
        if (data[ix + (iy*5)] === 0) {
          style = 'svg-clear block-picture-led-off';
        } else {
          style = 'svg-clear block-picture-led-on';
        }
        var led = svgb.createCircle(style, (ix*8), (iy*8), 3);
        group.appendChild(led);
      }
    }
    svg.appendChild(group);
  },
  // Inject the HTML for the controllers editor.
  // TODO: pass in the controller. That might all move our of this class.
  configurator: function(div) {
    div.innerHTML =
        `<div id='pictureEditorDiv'>
          <svg id='pictureEditor' width='175px' height='175px' xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' width=175px height=175px rx=10 ry='10' class='pix-editor block-picture-board'/>
            </svg>
        </div>`;

    var svg = document.getElementById('pictureEditor');

    // Create a editor state object for the interactions to work with.
    var pixEditorState = {
      pixOn:0,
      data:b.pictureBlock.pictSmile
    };

    var dindex = 0;
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        // Create each LED and initialize its lit state.
        var led = svgb.createCircle('', 17.5+(ix*35), 17.5+(iy*35), 13);
        setPicturePixel(led, pixEditorState.data[dindex]);
        svg.appendChild(led);
        dindex += 1;
      }
    }

    interact('.pix-editor', {context:svg})
      .on('down', function (event) {
        // Flip brush state based on pixel clicked on, then paint.
        var i = pictureEventToIndex(event);
        if (i >= 0) {
          if (pixEditorState.data[i] === 0) {
            pixEditorState.pixOn = 1;
          } else {
            pixEditorState.pixOn = 0;
          }
        }
        pixEditorState.data[i] = pixEditorState.pixOn;
        setPicturePixel(event.target.parentNode.children[i+1], pixEditorState.data[i]);
        // update block image.
      })
      .on('move', function(event) {
        // Paint pixel based on brush state.
        if (event.interaction.pointerIsDown) {
          var i = pictureEventToIndex(event);
          if (i >= 0) {
            pixEditorState.data[i] = pixEditorState.pixOn;
            setPicturePixel(event.target.parentNode.children[i+1], pixEditorState.data[i]);
          }
        }
        // update block image.
      });
    return;
  },
  // Add a list of contorllers valid for the picture actor.
  controllers: function(div) {
    div.innerHTML = `
    <div><button id="data-picture" class="block-settings-tab tab-selected" style="border-radius:0px 0px 0px 10px";>
        <i class="fa fa-smile-o" aria-hidden="true"></i>
      </button><button id="data-text" class="block-settings-tab" style="border-radius:0px">
        abc
      </button><button id="data-movie" class="block-settings-tab" style="border-radius:0px">
        <i class="fa fa-film" aria-hidden="true"></i>
      </button><button id="data-dynamic" class="block-settings-tab" style="border-radius:0px 0px 10px 0px">
        <i class="fa fa-tachometer" aria-hidden="true"></i>
      </button>
      </div>
    `;
  }
};
// - SVG element construcio.
// - HTML sub parts
// - property serialization
// - animation?

// LED color
b.ledColorStripBlock = {
  svg: function(root) {
    return root;
  }
};

// Start block is a work in progress, might not be needed. Might be
// for naming seperate targets.
b.startBlock = {
  svg: function(root) {
    var pathd = '';
    pathd =  pb.move(31, 21);
    pathd += pb.hline(18);
    pathd += pb.arc(9, 180, 0, 1, 0, 18);
    pathd += pb.hline(-18);
    pathd += pb.arc(9, 180, 0, 1, 0, -18);
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 31, 30, 2));
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 49, 30, 2));
  }
};

// Single motor
b.motorBlock = {
  svg: function(root) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    root.appendChild(shaft);
    return root;
  }
};

// Two motors. Sometimes its just better to control two at once.
b.twoMotorBlock = {
  svg: function(root) {
    // Motor 1
    var motor = svgb.createCircle('svg-clear block-motor-body', 27, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 27, 30, 4);
    root.appendChild(shaft);
    motor = svgb.createCircle('svg-clear block-motor-body', 53, 30, 20);
    root.appendChild(motor);
    shaft = svgb.createCircle('svg-clear block-motor-shaft', 53, 30, 4);
    root.appendChild(shaft);
    return root;
  }
};

// Micro servo block
b.microServoBlock = {
  svg: function(root) {
    // servo body
    var box = svgb.createRect('svg-clear block-micro-servo-body', 18, 20, 44, 24, 2.5);
    root.appendChild(box);

    // simple servo arm
    var pathd = '';
    pathd =  pb.move(45, 32);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);
    return root;
  }
};

b.digitalWriteBlock = {
  svg: function(root) {
    // TODO
    return root;
  }
};

b.analogWriteBlock = {
  // TODO
};

b.serialWriteBlock = {
  // TODO
};

b.I2CWriteBlock = {
  // TODO
};

// Sound block to make a joyful noise.
b.soundBlock = {
  svg: function(root) {
    var pathd = '';
    pathd =  pb.move(20, 25);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);
    return root;
  }
};

// Wait block - wait until something happens, such as time passing.
b.waitBlock = {
  svg: function(root) {
    var pathd = '';
    pathd =  pb.move(40, 19);
    pathd += pb.vline(-7);
    pathd += pb.arc(19, 340, 1, 1, -12, 4);
    pathd +=  pb.move(10.6, 16.5);
    pathd +=  pb.arc(1.3, 300, 0, 0, 2.2, -0.8);
    pathd +=  pb.line(-7.8, -10.5);
    pathd +=  pb.close();
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    return root;
  }
};

// Calculator
b.calculatorBlock = {
  svg: function(root) {
    return root;
  }
};

// Loop
b.loop = {
  svg: function(root) {
    return root;
  }
};

// Binding sources are things that provide values that can be connected to
// actors. Much still TODO :)
b.musicNoteValue = {
  // TODO
};

b.constantValue = {
  // TODO
};

b.rangeValue = {
  // TODO
};

b.acceleromoterValue = {
  // TODO
};

b.timeValue = {
   // TODO
};

b.compassValue = {
  // TODO
};

b.temperatureValue = {
  // TODO
};

b.funcionValue = {
  // TODO
};

b.messageValue = {
  // TODO
// May be globals on the device, or across a mesh.
};

return b;
}();
