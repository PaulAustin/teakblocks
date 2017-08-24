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
  // with the application configuration settings. When the form appears the
  // user may change the settings. The application refers to this object where
  // needed
  var ko = require('knockout');

  var configProperties = {
    p1Motor: ko.observable(0),
    p2Motor: ko.observable(0),
    p3Servo: ko.observable(0),
    p4servo: ko.observable(0),
    p5LED: ko.observable(0),
    p6LED: ko.observable(0)
  };

  var tf = require('./teak-forms.js');
  var template = tf.styleTag +
  `<div id="app-config" class="container teakform closed">
      <form>
        <label><input type="checkbox" id="show-code" data-bind="checked:showCode">
          <span class="label-text">Show code</span>
        </label><br><br>
        <label><input type="checkbox" id="editor-sounds" data-bind="checked:editorSounds">
          <span class="label-text">Sound effects</span>
        </label><br><br>
        <label><input type="checkbox" id="editor-xray" data-bind="checked:editorXRay">
          <span class="label-text">X-Ray</span>
        </label>
      </form>
  </div>`;

  class TeakConfigWidget extends HTMLElement {

    // Fires when an instance of the element is created.
    createdCallback() {
      this.createShadowRoot().innerHTML = template;
      this.$container = this.shadowRoot.querySelector('.container');

      // Initialize knockout databinding for elements in shadow DOM
      ko.applyBindings(configProperties, this.$container);
    }

    // Fires when an instance is inserted into the document.
    attachedCallback() {
    }

    // Fires when an attribute is added, removed, or updated.
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'opened') {
        tf.setOpenAttribute(this.shadowRoot.getElementById('app-config'), newValue);
      }
    }
  }

  document.registerElement('teak-config-widget', TeakConfigWidget);
  return configProperties;
}();
