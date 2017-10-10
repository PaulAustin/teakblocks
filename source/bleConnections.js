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

// Module for managing BLE connections and lists of devices found.
module.exports = function factory(){

var bleConnection = {};
bleConnection.messages = [];
bleConnection.observerCallback = null;
bleConnection.accelerometer = 0;
bleConnection.compass = 0;
bleConnection.temp = 0;

// GUIDs for Nordic BLE UART services.
var nordicUARTservice = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

// Convert a string to an array of int (int8s).
function stringToBuffer(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

// Convert an array ints to a string.
function bufferToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

if (typeof ble !== 'undefined') {
  bleConnection.bleApi = ble;
} else {
  bleConnection.bleApi = null;
}

var pbi = 0;
var pseudoBeacons = [
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:500},
 {name:'puck.js 4e75', mac:'00004e75', delay:500},
 {name:'BBC micro:bit [frodo]', mac:'0000000F', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [frodo]', mac:'0000000F', delay:500},
 {name:'BBC micro:bit [aslan]', mac:'000000AA', delay:100},
 {name:'puck.js 4e75', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:200},
 {name:'BBC micro:bit [zorgav]', mac:'000000FF', delay:500}
];

bleConnection.devices = {};
bleConnection.scanning = false;
bleConnection.psedoScan = function () {
  if (pbi >= pseudoBeacons.length) {
    pbi = 0;
  }
  var beaconInfo = pseudoBeacons[pbi];
  bleConnection.beaconReceived(beaconInfo);
  pbi += 1;
  if (bleConnection.scanning) {
    setTimeout(function() { bleConnection.psedoScan(); }, beaconInfo.delay);
  }
};

bleConnection.observeDevices = function(callback) {
  this.observerCallback = callback;
};

bleConnection.stopObserving = function () {
  bleConnection.scanning = true;
  if (bleConnection.bleApi !== null) {
    this.bleApi.stopScan();
  }
};

bleConnection.findDeviceByMac = function(mac) {
  for (var deviceName in bleConnection.devices) {
    var device = bleConnection.devices[deviceName];
    if (mac === device.mac) {
      return device;
    }
  }
  return null;
};

bleConnection.beaconReceived = function(beaconInfo) {
  if (beaconInfo.name !== undefined) {
    if (beaconInfo.name.startsWith('BBC micro:bit [')) {
      var botName = beaconInfo.name.split('[', 2)[1].split(']',1)[0];

      // Merge into list
      if (!this.devices.hasOwnProperty(botName)) {
        this.devices[botName] = { mac:beaconInfo.id, status:1 };
      }

      // Update last-seen time stamp, signal strength
      this.devices[botName].ts = Date.now();
      if (Number.isInteger(beaconInfo.rssi)) {
        this.devices[botName].rssi = beaconInfo.rssi;
      }
      this.cullList();
    }
  }
};

bleConnection.cullList = function() {
  var now = Date.now();
  for (var botName in bleConnection.devices) {
    var botInfo = bleConnection.devices[botName];
    // Per ECMAScript 5.1 standard section 12.6.4 it is OK to delete while
    // iterating through a an object.
    if ((botInfo.status === 1) && (now - botInfo.ts) > 4000) {
      delete bleConnection.devices[botName];
    }
  }
  if ((this.observerCallback !== null) && bleConnection.scanning) {
    this.observerCallback(bleConnection.devices);
  }
};

bleConnection.startObserving = function () {
  bleConnection.scanning = true;
  if (this.bleApi === null) {
    bleConnection.psedoScan();
  } else {
    // TODO identityBlock.ble.stopScan();
    console.log('starting scan');
    this.bleApi.startScanWithOptions(
      [/*nordicUARTservice.serviceUUID*/], { reportDuplicates: true },
      function(device) {
        bleConnection.beaconReceived(device);
      },
      function(errorCode) {
        console.log('error1:' + errorCode);
      });
  }
};

bleConnection.checkDeviceStatus = function (name) {
  if (name === '-?-') {
    return 0;  // TODO a bit hard coded.
  } else if (bleConnection.devices.hasOwnProperty(name)) {
    return bleConnection.devices[name].status;
  }
  return 0;
};

bleConnection.disconnect = function(mac) {
  if (bleConnection.bleApi !== null) {
    this.bleApi.disconnect(mac);
  }
};

bleConnection.connect = function(name) {
  if (this.devices.hasOwnProperty(name)) {
    var mac = this.devices[name].mac;

    if (bleConnection.bleApi === null) {
      bleConnection.devices[name].status = 3;
    } else {
      bleConnection.devices[name].status = 2;
      bleConnection.bleApi.connect(mac, bleConnection.onConnect,
        bleConnection.onDisconnect, bleConnection.onError);
    }
  }
};

bleConnection.onConnect = function(info) {
  console.log('On Connected:', info.name, info);
  // If connection works, then start listening for incomming messages.
  bleConnection.bleApi.startNotification(info.id,
     nordicUARTservice.serviceUUID,
     nordicUARTservice.rxCharacteristic,
     function (data) { bleConnection.onData(info.name, data); },
     bleConnection.onError);

  var dev = bleConnection.findDeviceByMac(info.id);
  if (dev !== null) {
    dev.status = 3;
  }
};

bleConnection.onDisconnect = function(info) {
  console.log('On Disconnect:' + info.name);
};

bleConnection.onData = function(name, data) {
  var str = bufferToString(data);
  console.log('On Data:', name, str);
  bleConnection.messages.push(name + ':' + str);
  if(str.includes('accel')){
    bleConnection.accelerometer = str.substring(7, str.length - 2);
  } else if(str.includes('compass')){
    bleConnection.compass = str.substring(9, str.length - 2);
  } else if(str.includes('temp')){
    bleConnection.temp = str.substring(6, str.length - 2);
  }
};

bleConnection.onError = function(reason) {
  console.log('Error2:', reason);
};

bleConnection.write = function(name, message) {
  if (this.devices.hasOwnProperty(name)) {
    var mac = this.devices[name].mac;

    console.log('ble write', name, mac, message);
    if (bleConnection.bleApi !== null) {
      var buffer = stringToBuffer(message);

      // Break the message into smaller sections.
      bleConnection.bleApi.write(mac,
        nordicUARTservice.serviceUUID,
        nordicUARTservice.txCharacteristic,
        buffer,
        bleConnection.onWriteOK,
        bleConnection.onWriteFail);
    }
  }
};

bleConnection.onWriteOK = function (data) {
  console.log('write ok', data);
};
bleConnection.onWriteFail = function (data) {
  console.log('write fail', data);
};

return bleConnection;
}();
