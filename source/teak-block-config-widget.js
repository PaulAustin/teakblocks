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

  var ko = require('knockout');

  var blockSettings = {
    visible: ko.observable(true),
    activeBlock:null
  };

  blockSettings.insert = function(domRoot) {
    var div = document.createElement("div");
    div.innerHTML =
    `<div id="block-settings" class="container blockform">
        <label><input type="checkbox" id="show-code" data-bind="checked:visible">
          <span class="label-text">Power</span>
        </label><br><br>
    </div>`;
    blockSettings.domId = 'block-settings';
    domRoot.appendChild(div);
    ko.applyBindings(blockSettings, div);
  };

  blockSettings.hide = function(exceptBlock) {
    if (this.activeBlock !== null && this.activeBlock !== exceptBlock) {
      this.activeBlock = null;
      var dom = document.getElementById(this.domId);
      dom.style.transition = 'all 0.2s ease';
      dom.style.position = 'absolute';
      dom.style.transform = 'scale(0.33, 0.0)';
      dom.style.pointerEvents = 'all';
    }
  };

  // A block has been  tapped on, the gesture for the config page.
  // bring it up toggle or move as apppropriate.
  blockSettings.tap = function(block) {
    if (this.activeBlock === block) {
      // Clicked on the same block make it go away.
      this.hide();
    } else if (this.activeBlock !== null) {
      // Clicked on another block, but one is showing, make it go away.
      // Then show the new one once the hide transition is done.
      this.hide();
      this.activeBlock = block;
      this.addEventListener('transitionend', this.showActive);
    } else {
      // Nothing showing, make it popop up.
      this.activeBlock = block;
      this.showActive(null);
    }
  };

  // Internal method to show the form.
  blockSettings.showActive = function (event) {
    if (event !== null) {
      this.removeEventListener('transitionend', this.showActive);
    }
    var x = this.activeBlock.rect.left;
    var y = this.activeBlock.rect.bottom;

    var dom = document.getElementById(this.domId);
    dom.style.transition = 'all 0.0s ease';
    dom.style.left = (x-80) + 'px';
    dom.style.right = (x+80) + 'px';
    dom.style.top = (y+5) + 'px';
    // Second step has to be done in callback in order to allow
    // animation to work.
    setTimeout(function() {
      dom.style.transition = 'all 0.2s ease';
      dom.style.position = 'absolute';
      dom.style.width= '240px';
      dom.style.transform = 'scale(1.0, 1.0)';
      dom.style.pointerEvents = 'all';
    }, 10);
  };

  return blockSettings;
}();
