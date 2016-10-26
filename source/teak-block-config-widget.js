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

  // At this point no fancy data binding. This component returns an object
  // with the application configuration settings. When the form is shown, the
  // user may change the settings. The application refers to this object where
  // needed
  var ko = require('knockout');

  var configProperties = {
    visible: ko.observable(true),
  };

  var tf = require('./teak-forms.js');
  // Inner HTML will be set by the specific block.
  var template = tf.styleTag +
  `<div id="app-config" class="container blockform">
      <label><input type="checkbox" id="show-code" data-bind="checked:visible">
        <span class="label-text">Power</span>
      </label><br><br>
  </div>`;

  class TeakBlockConfigWidget extends HTMLElement {

    // Fires when an instance of the element is created.
    createdCallback() {
      // activeBlock is the Block the config page is opened for.
      // at this point one one can be opend at a time.
      this.activeBlock = null;
      this.createShadowRoot().innerHTML = template;
      this.$container = this.shadowRoot.querySelector('.container');

      // Initialize knockout databinding for elements in shadow DOM
      ko.applyBindings(configProperties, this.$container);
    }

    // Fires when an instance is inserted into the document.
    attachedCallback() {
    }

    hide() {
      if (this.activeBlock !== null) {
        this.activeBlock = null;
        this.style.transition = 'all 0.2s ease';
        this.style.position = 'absolute';
        this.style.transform = 'scale(0.33, 0.0)';
        this.style.pointerEvents = 'all';
      }
    }

    // A block has been  tapped on, the gesture for the config page.
    // bring it up toggle or move as apppropriate.
    tap(block) {
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
    }

    // internal method to show the form.
    showActive(event) {
      if ( event !== null) {
        this.removeEventListener('transitionend', this.showActive);
      }
      var x = this.activeBlock.rect.left;
      var y = this.activeBlock.rect.bottom;
      this.style.transition = 'all 0.0s ease';
      this.style.left = (x-80) + 'px';
      this.style.right = (x+80) + 'px';
      this.style.top = (y+5) + 'px';
      // Second step has to be done in callback in order to allow
      // animation to work.
      var self = this;
      setTimeout(function() {
        self.style.transition = 'all 0.2s ease';
        self.style.position = 'absolute';
        self.style.width= '240px';
        self.style.transform = 'scale(1.0, 1.0)';
        self.style.pointerEvents = 'all';
      }, 10);
    }
  }

  tf.registerComponent('teak-block-config-widget', TeakBlockConfigWidget);
  return configProperties;
}();
