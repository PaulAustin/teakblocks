(function () {
  var tf = require('./teak-forms.js');
  var template = '<style>' + tf.css + '</style>' +
  `  <div class="container">
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
    </div>
    `;

    class TeakConfigWidget extends HTMLElement {

        // Fires when an instance of the element is created.
        createdCallback() {
            this.createShadowRoot().innerHTML = template;

            //Grab the elements from the shadow root
            this.$container = this.shadowRoot.querySelector('.container');
        }

        // Fires when an instance was inserted into the document.
        attachedCallback() {
        }
        // Fires when an attribute was added, removed, or updated.
        attributeChangedCallback(name, oldValue, newValue) {
          console.log('attr:' + name + ' "' + oldValue + '" -> "' + newValue + '"');
          if (name === 'visible') {
            console.log('make it visible');
          }
        }
        updateTheme(theme) {
/*            var val = "green";
            if (["green", "red", "blue", "gold"].indexOf(theme) > -1) {
                val = theme;
            }
            */
            this.$container.className = "container " + val;
        }
    }
    document.registerElement('teak-config-widget', TeakConfigWidget);
})();
