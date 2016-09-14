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
  var teakScan = {};
  require('./evothings/easyble.dist.js');

  var tf = require('./teak-forms.js');
  var template = tf.styleTag +
  `<style>
  .tf-list {
    list-style: none;
    list-style-position:inside;
    /* border: 2px solid #9CCC65; */
    /* background-color: #DCEDC8; */
    background-color: #BAEDF3;
    box-shadow: inset 0px 0px 5px 3px rgba(73, 137, 144, 0.2);
    border-radius: 5px;
  }
  .tf-list-item {
    list-style: none;
    list-style-position:inside;
  }
  </style>
  <div id="teak-scan" class="container teakform closed">
    <form>
      <label id="device-list-title" for="device-list">Nearby micro:bits</label>
      <br>
        <ul class='tf-list'>
        <li class='tf-list-item'> volgart</li>
        <li class='tf-list-item'> zarbit</li>
        <li class='tf-list-item'> pokey</li>
        </ul>
    </form>
  </div>`;

  class TeakScanWidget extends HTMLElement {
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
      if (name === 'opened') {
        tf.setOpenAttribute(this.shadowRoot.getElementById('teak-scan'), newValue);
      }
    }
  }

  document.registerElement('teak-scan-widget', TeakScanWidget);

  var blelog = document.getElementById('teakCode');
  function log(text) {
    blelog.value = blelog.value + '\n' + text;
  }

  function foundDevice(device) {
    //  device.timeStamp = Date.now();
    log('FD:' + device.name + '[' + device.rssi +']');
  }

  teakScan.startScan = function startScan() {
    var ble = window.evothings.ble;
    if (ble === undefined)
      return;
    log('starting scan');
    ble.stopScan();
    ble.startScan(
      function(device) {
        if (device.name !== undefined) {
          foundDevice(device);
        }
      },
      function(errorCode) {
        log('error:' + errorCode);
      });
  };

  teakScan.stopScan = function stopScan() {
    var ble = window.evothings.ble;
    if (ble === undefined)
      return;
    log('stopping scan');
    ble.stopScan();
  };

  return teakScan;
}();
