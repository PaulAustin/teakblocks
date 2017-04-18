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
    var keypad = {};

    keypad.openTabs = function(object){
      var div = object.div;
      var block = object.block;
      var min = object.min;
      var max = object.max;
      var suffix = object.suffix;
      var blockType = object.type;
      div.innerHTML =
          `<div id='servoEditorDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display" width='80px' height='80px' data-bind='text: keyPadValue'>

              </div>
              <svg id="calc" class='area' width='225px' height='167.5px' xmlns='http://www.w3.org/2000/svg'></svg>
              </svg>
          </div>`;


      ko.applyBindings(blockType, div);
      var svg = document.getElementById('pictureEditor');
      var display = document.getElementById("numeric-display");
      var calcArea = document.getElementById('calc');
      //console.log(block);
      //var num = blockType.getData(block).toString();
      console.log(block);
      var num = object.getValue().toString();
      console.log(num);
      blockType.keyPadValue(num.toString() + suffix);
      var strNum = "";

      // Create a editor state object for the interactions to work with.

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each LED and initialize its lit state.
          var button = svgb.createGroup('', 0, 0);
          var box = svgb.createRect('calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
          var text = svgb.createText('svg-clear', 32.5+((ix)*75), 27.5+(iy*35), blockType.numArray[((iy)*3) + ix]);

          // add setAttribute to the seperate blocks
          button.appendChild(box);
          button.appendChild(text);

          box.setAttribute('name', blockType.numArray[((iy)*3) + ix]);

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
            } else if(parseInt(num + strNum, 10) < max && parseInt(num + strNum, 10) > min){ //(num.includes("-") && num.length < 3) || (num.length < 2 && strNum !== "+/-")){
              display.classList.remove("error");
              num += strNum;
            } else if(strNum !== "+/-"){
              display.classList.add("error");
            }

            blockType.keyPadValue(num.toString() + suffix);
            object.setValue(num);
            //block.updateSvg();


        });

      return;
    };
    keypad.closeTabs = function createKeyPad(object){
      ko.cleanNode(object.div);
    };
    return keypad;
}();
