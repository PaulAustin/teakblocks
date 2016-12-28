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
var b = {};
var interact = require('interact.js');
var ko = require('knockout');

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
    console.log('cant find style for ', key);
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

b.identityBlock = require('./blocks/identityBlock.js');
b.pictureBlock = require('./blocks/pictureBlock.js');
b.soundBlock = require('./blocks/soundBlock.js');
b.servoBlock = require('./blocks/servoBlock.js');
b.waitBlock = require('./blocks/waitBlock.js');
b.colorStripBlock = require('./blocks/colorStripBlock.js');
var flowBlocks = require('./blocks/flowBlocks.js');
b.loopBlock = flowBlocks.flowBlockHead;  // TODO name change
b.tailBlock = flowBlocks.flowBlockTail;  // TODO name change

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

  configuratorClose: function(div) {
    ko.cleanNode(div);
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

// Calculator
b.calculatorBlock = {
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
