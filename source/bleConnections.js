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

module.exports = function (){

/* global ble  */

var bleConnnection = {};
bleConnnection.observerCallback = null;

// this is Nordic's UART service
var nordicUARTservice = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

function stringToBuffer(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

function bufferToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

if (typeof ble !== 'undefined') {
  console.log('found ble', ble);
  bleConnnection.bleApi = ble;
} else {
  bleConnnection.bleApi = null;
}

var pbi = 0;
var pseudoBots = [
  {aragorn:1},
  {aragorn:1, frodo:2},
  {aragorn:1, frodo:2},
  {aragorn:1, frodo:2},
  {frodo:2},
  {frodo:2},
  {},
  {},
];

bleConnnection.visibleDevices = {};
bleConnnection.scanning = false;
bleConnnection.psedoScan = function () {
  if (pbi >= pseudoBots.length) {
    pbi = 0;
  }

  bleConnnection.visibleDevices = pseudoBots[pbi];
  if (bleConnnection.observerCallback !== null) {
    bleConnnection.observerCallback(bleConnnection.visibleDevices);
  }

  pbi += 1;
  if (bleConnnection.scanning) {
    setTimeout(function() { bleConnnection.psedoScan(); }, 3000);
  }
};

bleConnnection.observeDevices = function(callback) {
  this.observerCallback = callback;
  if (callback!== null) {
    this.observerCallback(bleConnnection.visibleDevices);
  }
};

bleConnnection.stopObserving = function () {
  bleConnnection.scanning = true;
  if (bleConnnection.bleApi !== null) {
    this.bleApi.stopScan();
  }
};

bleConnnection.startObserving = function (callback) {
  // Put empty  rows so the cell don't stretch to fill the table.
  //identityBlock.devices.removeAll();
  bleConnnection.scanning = true;
  if (this.bleApi === null) {
    bleConnnection.psedoScan();
  } else {
    // TODO identityBlock.ble.stopScan();
    console.log('starting scan');
    this.bleApi.startScanWithOptions(
      [/*nordicUARTservice.serviceUUID*/], { reportDuplicates: true },
      function(device) {
        bleConnnection.addFoundDevice(device);
        callback(device);
      },
      function(errorCode) {
        console.log('error:' + errorCode);
      });
  }
};

bleConnnection.checkDeviceStatus = function (name) {
  if (name === '-?-') {
    // TODO a bit hard coded.
    return 0;
  } else if (bleConnnection.visibleDevices.hasOwnProperty(name)) {
    return 1;
  }
  return 0;
};

bleConnnection.addFoundDevice = function (device) {
  // TODO
  // TODO var existing = bleConnnection.devs[device.name];
};

bleConnnection.disconnect = function(mac) {
  if (bleConnnection.bleApi !== null) {
    this.bleApi.disconnect(mac);
  }
};

bleConnnection.connect = function(mac) {
  if (bleConnnection.bleApl === undefined)
    return;

  // Mark selected, so data-binding will select the item.
  device.selected(true);
  // Mark time stamp 0 so it wont be removed from the list.
  // TODO, once connected the ts will be updated after
  // each communication with the target. If it stop responding
  // then it may stay in the list but be 'greyed out'
  device.ts = 0;

  bleConnnection.ble.connect(mac,
    function(connectInfo) {
      console.log('Connected to BLE device ' + connectInfo.name);
      // If connectio works, then start listening for incomming messages.
      bleConnnection.bleApl.startNotification(mac,
         nordicUARTservice.serviceUUID,
         nordicUARTservice.rxCharacteristic,
         bleConnnection.onData,
         bleConnnection.onError);
    },
    function(connectInfo) {
      console.log('Disconnected from BLE device: ' + connectInfo.name);
    },
    function(errorCode) {
      console.log('Failed to connect to BLE device: ' + errorCode);
    }
  );
};

bleConnnection.onData = function(data) {
  var str = bufferToString(data);
  console.log('On Data:', str);
};

bleConnnection.onError = function(reason) {
  console.log('Error:', reason);
};

bleConnnection.write = function(mac, message) {
  var buffer = stringToBuffer(message);
  console.log('ble write', message, buffer);

  // Break the message into smaller sections.
  bleConnnection.bleApi.write(mac,
    nordicUARTservice.serviceUUID,
    nordicUARTservice.txCharacteristic,
    buffer,
    bleConnnection.onWriteOK,
    bleConnnection.onWriteFail);
};

bleConnnection.onWriteOK = function (data) {
  console.log('write ok', data);
};
bleConnnection.onWriteFail = function (data) {
  console.log('write fail', data);
};

/*
identityBlock.cullDevices = function () {
  var now = Date.now();
  identityBlock.devices.remove(function(item) {
    // ts of 0 means it never is culled.
    if (item().ts === 0) {
      return false;
    }
    // If no communicationin 3 sec it gone.
    // A. Items should be seen in pbroadcast.
    // Commected items will update the time stamp in their
    // heart beat.
    return ((now - item().ts) > 3000);
  });
  identityBlock.cullTimer = setTimeout(identityBlock.cullDevices, 1000);
};
*/
return bleConnnection;
}();
