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

bleConnnection.devices = {};
bleConnnection.scanning = false;
bleConnnection.psedoScan = function () {
  if (pbi >= pseudoBeacons.length) {
    pbi = 0;
  }
  var beaconInfo = pseudoBeacons[pbi];
  bleConnnection.beaconReceived(beaconInfo);
  pbi += 1;
  if (bleConnnection.scanning) {
    setTimeout(function() { bleConnnection.psedoScan(); }, beaconInfo.delay);
  }
};

bleConnnection.observeDevices = function(callback) {
  this.observerCallback = callback;
};

bleConnnection.stopObserving = function () {
  bleConnnection.scanning = true;
  if (bleConnnection.bleApi !== null) {
    this.bleApi.stopScan();
  }
};

bleConnnection.findDeviceByMac = function(mac) {
  for (var deviceName in bleConnnection.devices) {
    var device = bleConnnection.devices[deviceName];
    if (mac === device.mac) {
      return device;
    }
  }
  return null;
};

bleConnnection.beaconReceived = function(beaconInfo) {
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

bleConnnection.cullList = function() {
  var now = Date.now();
  for (var botName in bleConnnection.devices) {
    var botInfo = bleConnnection.devices[botName];
    // Per ECMAScript 5.1 standard section 12.6.4 it is OK to delete while
    // iterating through a an object.
    if ((botInfo.status === 1) && (now - botInfo.ts) > 4000) {
      delete bleConnnection.devices[botName];
    }
  }
  if ((this.observerCallback !== null) && bleConnnection.scanning) {
    this.observerCallback(bleConnnection.devices);
  }
};

bleConnnection.startObserving = function () {
  bleConnnection.scanning = true;
  if (this.bleApi === null) {
    bleConnnection.psedoScan();
  } else {
    // TODO identityBlock.ble.stopScan();
    console.log('starting scan');
    this.bleApi.startScanWithOptions(
      [/*nordicUARTservice.serviceUUID*/], { reportDuplicates: true },
      function(device) {
        bleConnnection.beaconReceived(device);
      },
      function(errorCode) {
        console.log('error1:' + errorCode);
      });
  }
};

bleConnnection.checkDeviceStatus = function (name) {
  if (name === '-?-') {
    return 0;  // TODO a bit hard coded.
  } else if (bleConnnection.devices.hasOwnProperty(name)) {
    return bleConnnection.devices[name].status;
  }
  return 0;
};

bleConnnection.disconnect = function(mac) {
  if (bleConnnection.bleApi !== null) {
    this.bleApi.disconnect(mac);
  }
};

bleConnnection.connect = function(name) {
  if (this.devices.hasOwnProperty(name)) {
    var mac = this.devices[name].mac;

    if (bleConnnection.bleApi === null) {
      bleConnnection.devices[name].status = 3;
    } else {
      bleConnnection.devices[name].status = 2;
      bleConnnection.bleApi.connect(mac, bleConnnection.onConnect,
        bleConnnection.onDisconnect, bleConnnection.onError);
    }
  }
};

bleConnnection.onConnect = function(info) {
  console.log('On Connected:', info.name, info);
  // If connection works, then start listening for incomming messages.
  bleConnnection.bleApi.startNotification(info.id,
     nordicUARTservice.serviceUUID,
     nordicUARTservice.rxCharacteristic,
     function (data) { bleConnnection.onData(info.name, data); },
     bleConnnection.onError);

  var dev = bleConnnection.findDeviceByMac(info.id);
  if (dev !== null) {
    dev.status = 3;
  }
};

bleConnnection.onDisconnect = function(info) {
  console.log('On Disconnect:' + info.name);
};

bleConnnection.onData = function(name, data) {
  var str = bufferToString(data);
  console.log('On Data:', name, str);
};

bleConnnection.onError = function(reason) {
  console.log('Error2:', reason);
};

bleConnnection.write = function(name, message) {
  if (this.devices.hasOwnProperty(name)) {
    var mac = this.devices[name].mac;

    console.log('ble write', name, mac, message);
    if (bleConnnection.bleApi !== null) {
      var buffer = stringToBuffer(message);

      // Break the message into smaller sections.
      bleConnnection.bleApi.write(mac,
        nordicUARTservice.serviceUUID,
        nordicUARTservice.txCharacteristic,
        buffer,
        bleConnnection.onWriteOK,
        bleConnnection.onWriteFail);
    }
  }
};

bleConnnection.onWriteOK = function (data) {
  console.log('write ok', data);
};
bleConnnection.onWriteFail = function (data) {
  console.log('write fail', data);
};

return bleConnnection;
}();
