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

(function () {
  var tf = require('./teak-forms.js');
  var template = '<style>' + tf.css + '</style>' +
  `  <div class="container">
      <form>
        <label><input type="range" id="volume">
          <span class="label-text">Volume</span>
        </label>
      </form>
    </div>
    `;

  class TeakSoundWidget extends HTMLElement {

    // Called when a tag instance is created.
    createdCallback () {
      this.createShadowRoot().innerHTML = template;

      //Grab the elements from the shadow root
      this.$container = this.shadowRoot.querySelector('.container');
      }
        // Fires when an instance was inserted into the document.
      attachedCallback() {}
        // Fires when an attribute was added, removed, or updated.
      attributeChangedCallback(attrName, oldVal, newVal) {
          console.log('AttrChanged' + attrName + oldVal + newVal);
          /*
            switch (attrName) {
                case "theme":
                    this.updateTheme(newVal);
                    break;
            }
            */
      }
    }

  // Register this class with the DOM loader, tags already parsed will
  // be connected to the it.
  document.registerElement('teak-sound-widget', TeakSoundWidget);
})();
