(function () {
  var tf = require('./teak-forms.js');
  var template = '<style>' + tf.css + '</style>' +
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
})();
