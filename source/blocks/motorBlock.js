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
  var svgb = require('./../svgbuilder.js');
  var interact = require('interact.js');
  var ko = require('knockout');
  //var formTools = require('./../block-settings.js');
  //var pb = svgb.pathBuilder;
  var motorBlock = {};
  motorBlock.tabs = {
    'speed': '<i class="fa fa-tachometer" aria-hidden="true"></i>',
    'duration': '<i class="fa fa-clock-o" aria-hidden="true"></i>',
  };
  motorBlock.keyPadValue = ko.observable(50);
  // Initial setting for blocks of this type.
  motorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 50,
        duration: 0,
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  motorBlock.numArray = ["1", "2", "3", "4", "5","6", "7", "8", "9", "+/-", "0", "<-"];
  // Wait block - Wait until something happens, it can wait for things other
  // than time, but it is given that time pasing is part of the function.
  motorBlock.svg = function(root) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    root.appendChild(shaft);
    return root;
  };

  motorBlock.configuratorOpen = function(div) {
    div.innerHTML =
        `<div id='motorEditorDiv'>
            <div id="numeric-display" width='80px' height='80px' data-bind='text: keyPadValue'>

            </div>
            <svg id="calc" class='area' width='225px' height='167.5px' xmlns='http://www.w3.org/2000/svg'></svg>
            </svg>
        </div>`;


    ko.applyBindings(motorBlock, div);
    var svg = document.getElementById('pictureEditor');
    var display = document.getElementById("numeric-display");
    var calcArea = document.getElementById('calc');
    var num = "0";
    var strNum = "";
    //var textToDisplay = svgb.createText('', 10, 80, num);


    // Create a editor state object for the interactions to work with.

    for (var iy = 0; iy < 4; iy++) {
      for (var ix = 0; ix < 3; ix++) {
        // Create each LED and initialize its lit state.
        var button = svgb.createGroup('', 0, 0);
        var box = svgb.createRect('calcButtons', 10+((ix)*70), 22.5+(iy*30), 65, 25, 6);
        var text = svgb.createText('svg-clear', 37.5+((ix)*70), 42.5+(iy*30), motorBlock.numArray[((iy)*3) + ix]);

        // add setAttribute to the seperate blocks
        button.appendChild(box);
        button.appendChild(text);

        box.setAttribute('name', motorBlock.numArray[((iy)*3) + ix]);

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
          if(strNum === "<-"){
            num = "0";
            display.removeAttribute("class", "error");
          } else if(strNum === "+/-" && num !== "0"){
            display.removeAttribute("class", "error");
            if(num.substring(0, 1) === "-"){
              num = num.substring(1);
            } else{
              num = "-" + num;
            }
          } else if(num === "0" && strNum !== "+/-"){
            display.removeAttribute("class", "error");
            num = strNum;
          } else if((num.includes("-") && num.length < 3) || (num.length < 2 && strNum !== "+/-")){
            display.removeAttribute("class", "error");
            num += strNum;
          } else if(strNum !== "+/-"){
            display.setAttribute("class", display.getAttribute + " error");
          }

          motorBlock.keyPadValue(num.toString());


      });

    return;

  };
  motorBlock.configuratorClose = function(div) {
    ko.cleanNode(div);
  };

  return motorBlock;
}();
