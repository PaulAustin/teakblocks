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
  var tf = require('./teak-forms.js');
  var template = tf.styleTag +
  `<div id="app-config" class="container teakform closed">
      <form>
        <label><input type="checkbox" id="show-code">
          <span class="label-text">Show code</span>
        </label><br><br>
        <label><input type="checkbox" id="show-targets">
          <span class="label-text">Hilight drag target</span>
        </label>
        <!--
        <label id="color-theme-label" for="color-theme">Color theme:</label>
        <select id="color-theme" name="theme">
          <option value="primary">Primary</option>
          <option value="computer-green">Matrix</option>
          <option value="beach">Beach side</option>
          <option value="night">Night vision</option>
        </select>
        -->
      </form>
  </div>`;

  class TeakConfigWidget extends HTMLElement {
    // Fires when an instance of the element is created.
    createdCallback() {
      this.createShadowRoot().innerHTML = template;
      this.$container = this.shadowRoot.querySelector('.container');
    }
    // Fires when an instance was inserted into the document.
    attachedCallback() {
    }
    // Fires when an attribute is added, removed, or updated.
    attributeChangedCallback(name, oldValue, newValue) {
      // TODO move this common code to teak-forms.js
      if (name === 'opened') {
        var form = this.shadowRoot.getElementById('app-config');
        if (newValue === 'true') {
          form.classList.remove('closed');
          form.classList.add('opened');
        } else if (newValue === 'false') {
          form.classList.remove('opened');
          form.classList.add('closed');
        }
      }
    }
  }
  document.registerElement('teak-config-widget', TeakConfigWidget);
}();
