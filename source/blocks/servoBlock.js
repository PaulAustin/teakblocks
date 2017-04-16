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
  //var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;
  var servoBlock = {};
  var interact = require('interact.js');
  var ko = require('knockout');

  servoBlock.keyPadValueServo = ko.observable(90);
  // Initial setting for blocks of this type.
  servoBlock.defaultSettings = function() {
    // return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data:{
        pos:90
      },
      // Indicate what controller is active. This may affect the data format.
      //controller:'pos',
    };
  };

  servoBlock.numArray = ["1", "2", "3", "4", "5","6", "7", "8", "9", "+/-", "0", "<-"];

  servoBlock.svg = function (root) {
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

    servoBlock.testExpression(root);
    return root;
  };

  servoBlock.testExpression = function(root) {

    var pathd = '';
    pathd =  pb.move(24, 52);
    pathd += pb.line(-9, 0);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 0);
    var path = svgb.createPath('svg-clear block-sensor-stencil', pathd);
    root.appendChild(path);

    var circle = svgb.createCircle('svg-clear block-sensor-stencil-value', 19.5, 62, 4);
    root.appendChild(circle);

    circle = svgb.createCircle('svg-clear', 19.5, 62, 1);
    root.appendChild(circle);

    return root;
  };

  servoBlock.configuratorOpen = function(div) {
    div.innerHTML =
        `<div id='servoEditorDiv'>
            <div id="servo-numeric-display" class = "numeric-display" width='80px' height='80px' data-bind='text: keyPadValueServo'>

            </div>
            <svg id="servo-calc" class='area' width='225px' height='167.5px' xmlns='http://www.w3.org/2000/svg'></svg>
            </svg>
        </div>`;


    ko.applyBindings(servoBlock, div);
    var svg = document.getElementById('pictureEditor');
    var display = document.getElementById("servo-numeric-display");
    var calcArea = document.getElementById('servo-calc');
    var num = "0";
    var strNum = "";

    // Create a editor state object for the interactions to work with.

    for (var iy = 0; iy < 4; iy++) {
      for (var ix = 0; ix < 3; ix++) {
        // Create each LED and initialize its lit state.
        var button = svgb.createGroup('', 0, 0);
        var box = svgb.createRect('calcButtonsServo calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
        var text = svgb.createText('svg-clear', 32.5+((ix)*75), 27.5+(iy*35), servoBlock.numArray[((iy)*3) + ix]);

        // add setAttribute to the seperate blocks
        button.appendChild(box);
        button.appendChild(text);

        box.setAttribute('name', servoBlock.numArray[((iy)*3) + ix]);

        calcArea.appendChild(button);
      }
    }

    // Interact on calcButtons
    // do on tap
    // Take event, make event.target
    // get characteristic of dom element

    interact('.calcButtonsServo', {context:svg})
      .on('tap', function (event) {

          strNum = event.target.getAttribute('name');
          if(strNum === "<-"){
            num = "0";
            display.classList.remove("error");
          } else if(strNum === "+/-" && num !== "0"){
            display.classList.remove("error");
            if(num.substring(0, 1) === "-"){
              num = num.substring(1);
            } else{
              num = "-" + num;
            }
          } else if(num === "0" && strNum !== "+/-"){
            display.classList.remove("error");
            num = strNum;
          } else if((num.includes("-") && num.length < 3) || (num.length < 2 && strNum !== "+/-")){
            display.classList.remove("error");
            num += strNum;
          } else if(strNum !== "+/-"){
            display.classList.add("error");
          }

          servoBlock.keyPadValueServo(num.toString());


      });

    return;

  };
  servoBlock.configuratorClose = function(div) {
    ko.cleanNode(div);
  };

  return servoBlock;
}();
