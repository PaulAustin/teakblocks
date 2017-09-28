/*
Copyright (c) 2017 Paul Austin - SDG

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

  // Bindable properties
  var appSettings = {
    showCode: ko.observable(false),
    editorSounds: ko.observable(true),
  };

  appSettings.insert = function(domRoot) {
    var div = document.createElement("div");
    div.innerHTML = '';
/*
    <div id='app-settings'
      class='teakform pulldown closed' opened=false
      style='position:fixed;top:1em;right:1em;pointer-events:none'>
    <form>
      <label><input type="checkbox" id="show-code" data-bind="checked:showCode">
        <span class="label-text">Show code</span>
      </label><br><br>
      <label><input type="checkbox" id="editor-sounds" data-bind="checked:editorSounds">
        <span class="label-text">Sound effects</span>
      </label><br><br>
    </form>
    </div>`;
    */
    appSettings.domId = 'app-settings';
    domRoot.appendChild(div);
    //ko.applyBindings(appSettings, div);
  };

  return appSettings;
}();
