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

var svgb = require('./svgbuilder.js');
var pb = svgb.pathBuilder;
var b = {};
var interact = require('interact.js');
var ko = require('knockout');


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

b.startBlock = require('./blocks/startBlock.js');
b.pictureBlock = require('./blocks/pictureBlock.js');

// LED color
b.ledColorStripBlock = {
  svg: function(root) {
    return root;
  }
};

// Single motor
b.motorBlock = {
  // Some experimental tabs
  tabs : {
    'speed': '<i class="fa fa-tachometer" aria-hidden="true"></i>',
    'duration': '<i class="fa fa-clock-o" aria-hidden="true"></i>',
  },
  keyPadValue : ko.observable(50),
  defaultSettings : function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 50,
        duration: 0,
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  },

  numArray: ["1", "2", "3", "4", "5","6", "7", "8", "9", ".", "0", "<-"],
  svg: function(root) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    root.appendChild(shaft);
    return root;
  },
  configurator: function(div){
    div.innerHTML =
        `<div id='motorEditorDiv'>
            <span id="numeric-display" width='100px' height='50px' data-bind='text: keyPadValue'>
              
            </span>
            <svg id="calc" class='area' width='225px' height='167.5px' xmlns='http://www.w3.org/2000/svg'></svg>
            </svg>
        </div>`;


    ko.applyBindings(b.motorBlock, div);
    var svg = document.getElementById('pictureEditor');
    var calcArea = document.getElementById('calc');
    var output = document.getElementById('output');
    var num = 0.00;
    var strNum = "";
    var mult = true;
    var decimalOne = true;
    var decimalTwo = true;
    var decimalThree = true;
    var decimalFour = true;
    //var textToDisplay = svgb.createText('', 10, 80, num);


    // Create a editor state object for the interactions to work with.

    for (var iy = 0; iy < 4; iy++) {
      for (var ix = 0; ix < 3; ix++) {
        // Create each LED and initialize its lit state.
        var button = svgb.createGroup('', 0, 0);
        var box = svgb.createRect('calcButtons', ((ix)*70), 22.5+(iy*30), 60, 25, 6);
        var text = svgb.createText('svg-clear', 25+((ix)*70), 42.5+(iy*30), b.motorBlock.numArray[((iy)*3) + ix]);

        // add setAttribute to the seperate blocks

        button.appendChild(box);
        button.appendChild(text);
        
        box.setAttribute('name', b.motorBlock.numArray[((iy)*3) + ix]);

        calcArea.appendChild(button);
      }
    }
    
    // Interact on calcButtons
    // do on tap
    // Take event, make event.target
    // get characteristic of dom element

    interact('.calcButtons', {context:svg})
      .on('tap', function (event) {

          strNum = event.target.getAttribute('name');

          if(strNum === "."){
            if(typeof num != "string" && (num*10) % 1 == 0) num = num.toFixed(1);
            mult = false;
          }
          else if(strNum === "<-"){
            num = 0.00;
            strNum = "";
            mult = true;
            decimalOne = true;
            decimalTwo = true;
            decimalThree = true;
            decimalFour = true;
          }
          else{

              if(typeof num === "string"){
                if(decimalOne){
                  num = parseInt(num) + parseFloat(strNum , 10)/10;
                  decimalOne = false;
                }
                else if(decimalTwo){
                  num = parseFloat(num) + parseFloat(strNum , 10)/100;
                  decimalTwo = false;
                }

                mult = false;
              }
              else{

                  if(num % 1 > 0 && decimalThree){
                    num = parseFloat(num) + parseFloat(strNum , 10)/100;
                    decimalThree = false;
                  }
                  else if(decimalFour){
                    if(num < 10){
                      if((num*10) % 1 !== 0){
                        decimalFour = false;
                      }
                      else{
                        num += parseFloat(strNum , 10)/10;

                      }
                    }
                    else{
                      mult = false;
                    }

                  }
              }
          }
          if(mult){
            num *= 10;
          }
          if(num.toString().length > 5 && typeof num === "number") {
            //num = num.parseFloat(num.toFixed(2));
            num = Math.round(100 * num)/100;

          }

        if(strNum === "<-"){
          num = 0;
        }

          console.log("num:", num, strNum, typeof num, typeof strNum);

          b.motorBlock.keyPadValue(num.toString());


      });

    return;

  },
  controllers: function(div){

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
