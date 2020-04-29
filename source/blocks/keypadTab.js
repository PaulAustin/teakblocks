/*
Copyright (c) 2019 Trashbots - SDG

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
    var svgb = require('svgbuilder.js');
    var interact = require('interact.js');
    var ko = require('knockout');
    var keypad = {};

    keypad.tabbedButtons = function(div, object){
      object.inner =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display-half svg-clear selectedDisplay" width='80px' height='80px' data-bind='text: keyPadValue'>
              </div>
              <div id="beats-display" class = "beats-display svg-clear" width='80px' height='80px' data-bind='text: beatsValue'>
              </div>
              <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
              <svg id="beatsSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
          </div>`;
      keypad.openTabs(div, object); //dataButton

      var num = object.getBeats().toString();
      if(num === '1'){
        object.type.beatsValue(num.toString() + " beat");
      } else {
        object.type.beatsValue(num.toString() + " beats");
      }
      var beatsDisplay = document.getElementById('beats-display');
      var numericDisplay = document.getElementById('numeric-display');
      beatsDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('dataButton');
        beatsDisplay.className += " selectedDisplay";
        numericDisplay.className = "numeric-display-half svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        var svg = document.getElementById('keypadSvg');
        svg.parentNode.removeChild(svg);
        keypad.openBeats(object);
      };

      numericDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('beatsButton');
        numericDisplay.className += " selectedDisplay";
        beatsDisplay.className = "beats-display svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        ko.cleanNode(div);
        keypad.tabbedButtons(div, object);
      };
    };

    keypad.openTabs = function(div, object){
      // Get all the data from the parameter
      var block = object.block;
      var min = object.min;
      var max = object.max;
      var suffix = object.suffix;
      var blockType = object.type;
      var setValue = object.setValue;
      var getValue = object.getValue;
      var numArray = object.numArray;
      var calcLayout = object.calcLayout;
      if(object.inner === undefined){
        div.innerHTML =
            `<div id='keypadDiv' class='editorDiv'>
                <div id="numeric-display" class = "numeric-display svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>
                </div>
                <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
            </div>`;
      } else {
        div.innerHTML = object.inner;
      }

      ko.applyBindings(blockType, div);
      var display = document.getElementById("numeric-display");
      var keypadSvg = document.getElementById('keypadSvg');

      // Show the current data on the configuration panel
      var num = getValue().toString();
      blockType.keyPadValue(num.toString() + suffix);
      var strNum = "";

      // Create an editor state object for the interactions to work with.

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('dataButton', 0, 0);
            var box = svgb.createRect('calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+(iy*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            keypadSvg.appendChild(button);
          }
        }
      }

      // Interact on calcButtons
      // do on click
      // Take event, make event.target
      // get characteristic of dom element

      interact('.calcButtons', {context:keypadSvg})
        .on('click', function (event) {
            // Get the clicked on button name
            strNum = event.target.getAttribute('name');
            console.log('click ->', strNum);
            if(calcLayout === "simple"){ // If the layout is a simple layout
              var increment = "";
              display.classList.remove("error");

              // Check if you want to change the value
              // Store if we are going up or down and the number that follows
              if(strNum.substring(0,1) === "+" ||strNum.substring(0,1) === "-"){
                increment = strNum.substring(0,1);
                strNum = strNum.substring(1);
              }

              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
              }

              // If we are subtracting, subtract the number from variable num
              if(increment === "-"){
                if(parseInt(num, 10)-parseInt(strNum, 10) >= min){
                  num = (parseInt(num, 10)-parseInt(strNum, 10)).toString();
                } else {
                  num = min;
                  display.classList.add("error");
                }
              } else if(increment === "+"){ //Otherwise, add
                if(parseInt(num, 10)+parseInt(strNum, 10) <= max){
                  num = (parseInt(num, 10)+parseInt(strNum, 10)).toString();
                } else {
                  num = max;
                  display.classList.add("error");
                }
              }
            } else if(calcLayout === "complex"){ // If the layout is a complex layout
              var isNegate = strNum === "+/-";
              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
                display.classList.remove("error");
              } else if(isNegate && num !== "0"){ // Negate the number
                display.classList.remove("error");
                if(num.substring(0, 1) === "-"){
                  num = num.substring(1);
                } else {
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
            } else if(calcLayout === "defined"){ // If the layout is a defined layout
              num = strNum; // Set num to strNum
            }

            // Now show the number on the config panel
            blockType.keyPadValue(num.toString() + suffix);
            // And update the block data
            setValue(num);
            block.updateSvg();


        });

      return;
    };
    keypad.openBeats = function(object) {
      var getBeats = object.getBeats;
      var setBeats = object.setBeats;
      var blockType = object.type;
      var block = object.block;
      var numArray = object.beatsRay;

      if(numArray === undefined){
        numArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      }
      var beatsSvg = document.getElementById('beatsSvg');

      // Show the current data on the config panel
      var num = getBeats().toString();
      if(num === '1'){
        blockType.beatsValue(num.toString() + " beat");
      } else {
        blockType.beatsValue(num.toString() + " beats");
      }

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('', 0, 0);
            var box = svgb.createRect('beatsButtons', 2.5+((ix)*75), 5+((iy)*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+((iy)*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            beatsSvg.appendChild(button);
          }
        }
      }

      interact('.beatsButtons', {context:beatsSvg})
        .on('click', function (event) {
          var strNum = event.target.getAttribute('name');

          num = strNum; // Set num to strNum

          // Now show the number on the config panel
          if(num === '1'){
            blockType.beatsValue(num.toString() + " beat");
          } else {
            blockType.beatsValue(num.toString() + " beats");
          }
          // And update the block data
          setBeats(num);
          block.updateSvg();
        });

    };

    keypad.openTabsWithBeats = function(div, object) {
      object.inner =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display-half svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>

              </div>
              <div id="beats-display" class = "beats-display svg-clear" width='80px' height='80px' data-bind='text: beatsValue'>

              </div>
              <svg id="keypadSvg" class='area' width='225px' height='72px' xmlns='http://www.w3.org/2000/svg'></svg>
              <svg id="beatsSvg" class='area' width='225px' height='80px' xmlns='http://www.w3.org/2000/svg'></svg>
          </div>`;
      keypad.openTabs(div, object);
      object.beatsRay = ["1", "2", "3", "4", "5", "6"];
      keypad.openBeats(object);
      };

    keypad.closeTabs = function createKeyPad(div){
      ko.cleanNode(div);
    };
    return keypad;
}();
