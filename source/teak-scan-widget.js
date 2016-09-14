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
  .scroll-div {
    width:100%;
    height:200px;
    overflow-y:scroll;
    box-shadow:  0px 0px 5px 3px rgba(73, 137, 144, 0.2);
  }
  .tf-table {
    list-style: none;
    list-style-position:inside;
    /* border: 2px solid #9CCC65; */
    /* background-color: #DCEDC8; */
    background-color: #BAEDF3;
  }
  </style>
  <div id="teak-scan" class="container teakform closed">
    <form>
      <label id="device-table-title" for="device-table">Nearby micro:bits</label>
      <br>
      <br>
      <div class="scroll-div">
        <table id="device-table" class='tf-table' width='100%' height='200px'>
        <tr><td> </td><tr>
        <tr><td> </td><tr>
        <tr><td> </td><tr>
        <tr><td> </td><tr>
        <tr><td> </td><tr>
        <!--tr><td>Hello</td><tr>
        <tr><td>Hello</td><tr>
        <tr><td>Hello</td><tr>
        <tr><td>Hello</td><tr-->
        </table>
      </div>
    </form>
  </div>`;

  var activeDevices = {};

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
        if (newValue === 'true') {
          this.startScan();
        } else {
          this.stopScan();
        }
        tf.setOpenAttribute(this.shadowRoot.getElementById('teak-scan'), newValue);
      }
    }
  }

  document.registerElement('teak-scan-widget', TeakScanWidget);

  var blelog = document.getElementById('teakCode');
  function log(text) {
    blelog.value = blelog.value + '\n' + text;
  }

  TeakScanWidget.prototype.deviceOnClick = function deviceOnClick (cell) {
    var name = cell.innerHTML;
    for(var propName in activeDevices) {
      if (propName === name) {
        activeDevices[propName].cell.style.backgroundColor = '#03A9F4';
      } else {
        activeDevices[propName].cell.style.backgroundColor = '#BAEDF3';
      }
    }
  };

  TeakScanWidget.prototype.addDevice = function addDevice (device) {
    var thisScanner = this;
    var table = this.shadowRoot.getElementById('device-table');
    var newRow = table.insertRow(0);
    var cell = newRow.insertCell(0);

    cell.onclick = function () { thisScanner.deviceOnClick(this);  };
    var text = document.createTextNode(device.name);
    cell.appendChild(text);

    activeDevices[device.name] = {
      name:device.name,
      device:device,
      cell:cell,
      selected: false,
      timeStamp: Date.now()
    };
  };

  TeakScanWidget.prototype.foundDevice = function foundDevice (device) {
    if (activeDevices[device.name] === undefined) {
      this.addDevice(device);
    }
    //  setTimeout(checkList)
    // device.timeStamp = Date.now();
    // log('FD:' + device.name + '[' + device.rssi +']');
  };

  TeakScanWidget.prototype.startScan = function startScan() {

    var ble = window.evothings.ble;
    if (ble === undefined) {
      this.addDevice({name:'Blinky'});
      this.addDevice({name:'BlueBot'});
      this.addDevice({name:'PurplePoka'});
      // Some place holders for test
      return;
    }

    var thisScanner = this;
    log('starting scan');
    ble.stopScan();
    ble.startScan(
      function(device) {
        if (device.name !== undefined) {
          thisScanner.foundDevice(device);
        }
      },
      function(errorCode) {
        log('error:' + errorCode);
      });
  };

  TeakScanWidget.prototype.stopScan = function stopScan() {
    var ble = window.evothings.ble;
    if (ble === undefined)
      return;
    log('stopping scan');
    ble.stopScan();
  };

  return teakScan;
}();
