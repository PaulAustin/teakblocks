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
      // Get all the data from the parameter
      var div = object.div;
      var block = object.block;
      var min = object.min;
      var max = object.max;
      var suffix = object.suffix;
      var blockType = object.type;
      var setValue = object.setValue;
      var getValue = object.getValue;
      var numArray = object.numArray;
      var calcLayout = object.calcLayout;
      div.innerHTML =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display" width='80px' height='80px' data-bind='text: keyPadValue'>

              </div>
              <svg id="keypadSvg" class='area' width='225px' height='167.5px' xmlns='http://www.w3.org/2000/svg'></svg>
              </svg>
          </div>`;


      ko.applyBindings(blockType, div);
      var display = document.getElementById("numeric-display");
      var keypadSvg = document.getElementById('keypadSvg');

      // Show the current data on the config panel
      var num = getValue().toString();
      blockType.keyPadValue(num.toString() + suffix);
      var strNum = "";

      // Create a editor state object for the interactions to work with.

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('', 0, 0);
            var box = svgb.createRect('calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 32.5+((ix)*75), 27.5+(iy*35), numArray[((iy)*3) + ix]);

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            keypadSvg.appendChild(button);
          }
        }
      }

      // Interact on calcButtons
      // do on tap
      // Take event, make event.target
      // get characteristic of dom element

      interact('.calcButtons', {context:keypadSvg})
        .on('tap', function (event) {
            // Get the clicked on button name
            strNum = event.target.getAttribute('name');

            if(calcLayout === "simple"){ // If the layout is a simple layout
              var increment = "";
              display.classList.remove("error");

              if(strNum.substring(0,1) === "+" ||strNum.substring(0,1) === "-"){
                increment = strNum.substring(0,1);
                strNum = strNum.substring(1);
              }
              // If it is "<-", then delete current number
              if(strNum === "<-"){
                num = "0";
              }

              if(increment === "-"){
                if(parseInt(num, 10)-parseInt(strNum, 10) >= min){
                  num = (parseInt(num, 10)-parseInt(strNum, 10)).toString();
                } else{
                  display.classList.add("error");
                }
              } else if(increment === "+"){
                if(parseInt(num, 10)+parseInt(strNum, 10) <= max){
                  num = (parseInt(num, 10)+parseInt(strNum, 10)).toString();
                } else{
                  display.classList.add("error");
                }
              }
            } else if(calcLayout === "complex"){ // If the layout is a complex layout
              var isNegate = strNum === "+/-";
              // If it is "<-", then delete current number
              if(strNum === "<-"){
                num = "0";
                display.classList.remove("error");
              } else if(isNegate && num !== "0"){ // Negate the number
                display.classList.remove("error");
                if(num.substring(0, 1) === "-"){
                  num = num.substring(1);
                } else{
                  num = "-" + num;
                }
              } else if(num === "0" && !isNegate){ // If the number is 0, replace it
                display.classList.remove("error");
                num = strNum;
                // If the number is going to be within the max and min, then add the new number on.
              } else if(parseInt(num + strNum, 10) <= max && parseInt(num + strNum, 10) >= min && !isNegate){
                num += strNum;
              } else if(!isNegate){ // If the number doesn't satisfy the conditions above, then it is an error
                display.classList.add("error");
              }
            }

            // Now show the number on the config panel
            blockType.keyPadValue(num.toString() + suffix);
            // And update the block data
            setValue(num);
            block.updateSvg();


        });

      return;
    };
    keypad.closeTabs = function createKeyPad(object){
      ko.cleanNode(object.div);
    };
    return keypad;
}();
