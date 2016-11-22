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
  require('./evothings/easyble.dist.js');
  var ko = require('knockout');

  // Set of propoerties that can be bound to.
  var deviceScanner = {
    deviceName: "bingo",
    connected: true,
    connectionType: "BLE", // Migth add USB, BT or WiFi
  };

  deviceScanner.devices = ko.observableArray([]);
  deviceScanner.onDeviceClick = function() {
    console.log('got a  click', this);
  };

  deviceScanner.insert = function(domRoot) {
    var div = document.createElement("div");
    div.innerHTML = `
    <div id='device-scanner'
      class='teakform pulldown closed' opened=false
      style='position:fixed;top:1em;right:1em;pointer-events:none'>
      <form>
        <label id="device-table-title" for="device-table">Nearby micro:bits</label>
        <br>
        <br>
        <div class="scroll-div">
          <table id="device-table" class='tf-table' width='100%' height='200px'>
          <tbody data-bind="foreach: devices">
              <tr data-bind="click: $parent.onDeviceClick;">
                <td data-bind="text: name"></td>
              </tr>
          </tbody>
          </table>
        </div>
      </form>
    </div>`;

    deviceScanner.domId = 'device-scanner';
    domRoot.appendChild(div);
    ko.applyBindings(deviceScanner, div);
  };

  deviceScanner.onShowHide = function(state) {
    if (state === true) {
      this.startScan();
    } else {
      this.stopScan();
    }
  };

  var activeDevices = {};

/*
  When the panel is opened, BLE scanning is enabled. devices in pairing mode
  will boadcast a beacon every few seconds. those added to a list of devices
  found. A second settimeout() background task culls the list of devices that
  have not been seen for some period of time.

  When a device is selected then it needs to be paired with. That still has
  to beimpliemnted.
*/

  deviceScanner.deviceOnClick = function deviceOnClick (cell) {
    var name = cell.innerHTML;
    for(var propName in activeDevices) {
      if (propName === name) {
        activeDevices[propName].cell.style.backgroundColor = '#03A9F4';
      } else {
        activeDevices[propName].cell.style.backgroundColor = '#BAEDF3';
      }
    }
  };

  // UUIDs for nordic nrf51 used in micro:bit
  deviceScanner.UartServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  deviceScanner.writeCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  deviceScanner.readCharacteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

  deviceScanner.addDevice = function addDevice (device) {
    var self = this;
    var table = document.getElementById('device-table');
    var newRow = table.insertRow(0);
    var cell = newRow.insertCell(0);

    cell.onclick = function () { self.deviceOnClick(this);  };
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

  deviceScanner.foundDevice = function foundDevice (device) {
    if (activeDevices[device.name] === undefined) {
      this.addDevice(device);
    }
  };

  deviceScanner.startScan = function startScan() {

    var ble = window.evothings.ble;
    if (ble === undefined) {
      deviceScanner.devices.removeAll();
      deviceScanner.devices.push({ name: 'rowbin' });
      deviceScanner.devices.push({ name: 'zorgav' });
      deviceScanner.devices.push({ name: 'vargon' });
      deviceScanner.devices.push({ name: 'rimbor' });
      // Add extra rows so the cell don stretch to fill the table.
      deviceScanner.devices.push({ name: '' });
      deviceScanner.devices.push({ name: '' });
      deviceScanner.devices.push({ name: '' });
      return;
    }

    var self = this;
    ble.stopScan();
    ble.startScan(
      function(device) {
        if (device.name !== undefined) {
          self.foundDevice(device);
        }
      },
      function(errorCode) {
        console.log('error:' + errorCode);
      });
  };

  deviceScanner.stopScan = function stopScan() {
    var ble = window.evothings.ble;
    if (ble === undefined)
      return;
    console.log('stopping scan');
    ble.stopScan();
  };

  return deviceScanner;
}();
