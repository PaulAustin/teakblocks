(function () {

    let template = `
    <style>

    .container {
        position: fixed;
        top: 1em;
        right: 1em;
        background-color: #DCE775;
        border-radius: 10px;
        box-shadow: 4px 4px 5px #eaeaea;
        font-family:"helvetica";
        color:#33691E;
        font-size:30px;
        min-height: 100px;
        padding:30px;
        -webkit-user-select: none;
    }
label {
  margin: 15
  cursor: pointer;
  color: #666;
}
label input[type="checkbox"] {
  display: none;
}
label input[type="checkbox"] + .label-text:before {
  content: "\uf096";
  font-family: "FontAwesome";
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  width: 1em;
  display: inline-block;
  margin-right: 5px;
}
label input[type="checkbox"]:checked + .label-text:before {
  content: "\uf046";
  color: #06a3e9;
/*  animation: tick 180ms ease-in; */
}
label input[type="checkbox"]:disabled + .label-text {
  color: #aaa;
}
label input[type="checkbox"]:disabled + .label-text:before {
  content: "";
  color: #ccc;
}
@keyframes tick {
  0% {
    transform: scale(0);
  }
  90% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}
    label {
      cursor:pointer;
    }
    .container.green .left {
        background-color: #37bc9b;
    }
    .container.green .day-long {
        color: #278b70;
    }
    #show-code {
      margin: 20px;
    }
    #show-targets {
      margin: 20px;
    }
    #color-theme {
      margin: 20px;
    }
    #color-theme-label {
      margin: 20px;
    }
    </style>
    <div class="container">
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
          console.log('created');
            this.createShadowRoot().innerHTML = template;

            //Grab the elements from the shadow root
            this.$container = this.shadowRoot.querySelector('.container');
        }

        // Fires when an instance was inserted into the document.
        attachedCallback() {
          console.log('attached');
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
