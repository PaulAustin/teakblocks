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
  var ko = require('knockout');

  var bleConnection = {};
  bleConnection.connectionChanged = ko.observable({});
  bleConnection.connectionChanged.extend({ notify: 'always' });
  bleConnection.messages = [];
  bleConnection.accelerometer = 0;
  bleConnection.compass = 0;
  bleConnection.temp = 0;

// State enumeration for conections.
bleConnection.statusEnum = {
  NOT_THERE : 0,
  BEACON : 1,
  CONNECTING : 2,
  CONNECTED : 3,
  CONNECTION_ERROR : 4
};

// GUIDs for Nordic BLE UART services.
var nordicUARTservice = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

bleConnection.webBLERead = null;
bleConnection.webBLEWrite = null;

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

// Sniff out which BLE API to use. The order of testing is important
if (typeof ble !== 'undefined') {
  // First, look for a cordova based one. Its based on a global
  bleConnection.appBLE = ble; // eslint-disable-line no-undef
  bleConnection.webBLE = null;
} else if (navigator.bluetooth !== null && navigator.bluetooth !== undefined) {
  // Second, see if ther appears to be a web bluetooth implmentation.
  bleConnection.appBLE = null;
  bleConnection.webBLE = navigator.bluetooth;
} else {
  // None found.
  bleConnection.appBLE = null;
  bleConnection.webBLE = null;
}

//
bleConnection.scanUsesHostDialog = bleConnection.webBLE;

var pbi = 0;

// fake list of beacons for testing.
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

bleConnection.stopScanning = function () {
  bleConnection.scanning = false;
  if (bleConnection.appBLE) {
    bleConnection.appBLE.stopScan();
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

// strip down the name to the core 5 character name
bleConnection.bleNameToBotName = function(rawName) {
  if (rawName.startsWith('BBC micro:bit [')) {
    return rawName.split('[', 2)[1].split(']',1)[0];
  } else {
    return null;
  }
};

// A Device has been seen.
bleConnection.beaconReceived = function(beaconInfo) {
  if (beaconInfo.name !== undefined) {
    var botName = bleConnection.bleNameToBotName(beaconInfo.name);

    // If its a legit name make sure it is in the list or devices.
    if (botName !== null) {

      // Merge into list
      if (!this.devices.hasOwnProperty(botName)) {
        this.devices[botName] = {
           name: botName,
           mac: beaconInfo.id,
          };
          // Now set the status and trigger observers
          bleConnection.setConnectionStatus(botName, bleConnection.statusEnum.BEACON);
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
    if ((botInfo.status === bleConnection.statusEnum.BEACON) && (now - botInfo.ts) > 4000) {
      delete bleConnection.devices[botName];
    } else if (botInfo.status === bleConnection.statusEnum.NOT_THERE) {
      console.log('culling missing bot');
      delete bleConnection.devices[botName];
    } else if (botInfo.status === bleConnection.statusEnum.CONNECTING) {
      // If it is stuck in connecting then drop it.
      console.log('culling hung connection');
      delete bleConnection.devices[botName];
    }
  }

  // Let observers know something about the list of devices has changed.
  bleConnection.connectionChanged(bleConnection.devices);
};

bleConnection.startScanning = function () {
  bleConnection.scanning = true;

  if (bleConnection.webBLE) {
    bleConnection.webBTConnect();
  } else if (bleConnection.appBLE) {
    bleConnection.appBLE.startScanWithOptions([], { reportDuplicates: true },
      function(device) {
        bleConnection.beaconReceived(device);
      },
      function(errorCode) {
        console.log('error1:' + errorCode);
      });
  } else {  // bleAPI is not null looks like cordova model.
    console.log ('simulated bluetooth scan');
    bleConnection.psedoScan();
  }
};

// For Web bluetooth use the promises style of chaining callbacks.
// It looks a bit like one function, but it is a chain of 'then'
// call backs
bleConnection.webBTConnect = function () {

  let options = {
      filters: [
        {services: ['generic_attribute']},
        {namePrefix: 'BBC micro:bit'}
      ],
      optionalServices: [nordicUARTservice.serviceUUID, 'link_loss']
  };

  // requestDevice will trigger a browse dialog once back to the browser loop.
  // When a user selects one the then is called. Since the user has already
  // selected on at that point, add it to the list and select.
  navigator.bluetooth.requestDevice(options)
    .then(function(device) {
      console.log('> device:', device);
      var beaconInfo = {
        name : device.name,     // Should be in 'BBC micro:bit [xxxxx]' format
        id: device.id,          // looks like a hast of mac id perhaps
        rssi: -1,               // signal strength is not shared with JS code
        autoSelect: true        // indicate that the app should now connect.
      };
      bleConnection.beaconReceived(beaconInfo);
      device.addEventListener('gattserverdisconnected', bleConnection.onDisconnecWebBLE);
      return device.gatt.connect();
    })
    .then(function(server) {
      console.log('> primary service:', server);
      return server.getPrimaryService(nordicUARTservice.serviceUUID);
    })
    .then(function(primaryService) {
      console.log('> primary Service:', primaryService);
      // Calling getCharacteristics with no parameters
      // should return the one associated with the primary service
      // ( the tx and rx service)
      return primaryService.getCharacteristics();
    })
    .then(function(characteristics) {
      var rawName = characteristics[0].service.device.name;
      console.log('> characteristics:', rawName, characteristics);
      var botName = bleConnection.bleNameToBotName(rawName);
      bleConnection.scanning = false;
      bleConnection.setConnectionStatus(botName, bleConnection.statusEnum.CONNECTED);

      // testing this in chrome has worked.
      // Could add validation code to confirm nothing has changes
      // [0].uuid = 6e400002-... (tx)
      // [1].uuid = 6e400003-... (rx)
      bleConnection.webBLEWrite = characteristics[0];
      bleConnection.webBLERead = characteristics[1];
      bleConnection.webBLERead.startNotifications()
      .then(function() {
          console.log ('adding event listener');
          bleConnection.webBLERead.addEventListener('characteristicvaluechanged',
          bleConnection.onValChange);
      });
    })
    .catch(function(error) {
      bleConnection.scanning = false;
      bleConnection.connectionChanged(bleConnection.devices);
      console.log('cancel or error :' + error);
    });
};

bleConnection.onDisconnectAppBLE = function(info) {
  console.log('onDisconnectAppBLE:', info);
  var botName = bleConnection.bleNameToBotName(info.name);
  bleConnection.setConnectionStatus(botName, bleConnection.statusEnum.NOT_THERE);
  bleConnection.cullList();
};

bleConnection.onDisconnecWebBLE = function(event) {
  console.log('onDisconnecWebBLE:', event.target.name);
  var botName = bleConnection.bleNameToBotName(event.target.name);
  bleConnection.setConnectionStatus(botName, bleConnection.statusEnum.NOT_THERE);
  bleConnection.cullList();
};

// Determine the status of a named connection.
bleConnection.connectionStatus = function (name) {
  if (bleConnection.devices.hasOwnProperty(name)) {
    return bleConnection.devices[name].status;
  } else {
    return bleConnection.statusEnum.NOT_THERE;
  }
};

// Change a devices status and trigger observers
bleConnection.setConnectionStatus = function (name, status) {
  //
  console.log('SCS', bleConnection.devices);
  var dev = bleConnection.devices[name];
  if (dev !== null) {
    dev.status = status;
  }
  // bleConnection.devices[name].status = status;
  // Trigger notifications.
  bleConnection.connectionChanged(bleConnection.devices);
};

// NOT USED, TODO where should it be used.
bleConnection.disconnect = function(mac) {
  // TODO need to resolve where MAC vs name is used.
  if (bleConnection.appBLE) {
    bleConnection.appBLE.disconnect(mac);
  }
};

bleConnection.connect = function(name) {
  if (bleConnection.devices.hasOwnProperty(name)) {
    var mac = bleConnection.devices[name].mac;

    if (bleConnection.appBLE) {
      bleConnection.setConnectionStatus(name, bleConnection.statusEnum.CONNECTING);
      bleConnection.appBLE.connect(mac, bleConnection.onConnect,
        bleConnection.onDisconnectAppBLE, bleConnection.onError);
    } else if (bleConnection.webBLE) {
      // Should already be connected.
      // TODO, no the connection can be postponed until needed (perhaps)
    } else {
      // For no BLE present, pretend the device is connected.
      bleConnection.setConnectionStatus(name, bleConnection.statusEnum.CONNECTED);
    }
  }
};

bleConnection.onConnect = function(info) {
  console.log('On Connected:', info.name, info);
  // If connection works, then start listening for incomming messages.
  bleConnection.appBLE.startNotification(info.id,
     nordicUARTservice.serviceUUID,
     nordicUARTservice.rxCharacteristic,
     function (data) { bleConnection.onData(info.name, data); },
     bleConnection.onError);

  var dev = bleConnection.findDeviceByMac(info.id);
  if (dev !== null) {
    bleConnection.setConnectionStatus(dev.name, bleConnection.statusEnum.CONNECTED);
  }
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

bleConnection.onValChange = function (event) {
  let value = event.target.value;
  var str = bufferToString(value.buffer);
  console.log('BLE message recieved', str);
};

bleConnection.onError = function(reason) {
  console.log('Error2:', reason);
};

bleConnection.write = function(name, message) {
  if (bleConnection.devices.hasOwnProperty(name)) {
    var mac = bleConnection.devices[name].mac;
    var buffer = stringToBuffer(message);

    if (bleConnection.appBLE) {
      buffer = stringToBuffer(message);

      // Break the message into smaller sections.
      bleConnection.appBLE.write(mac,
        nordicUARTservice.serviceUUID,
        nordicUARTservice.txCharacteristic,
        buffer,
        bleConnection.onWriteOK,
        bleConnection.onWriteFail);
    } else if (bleConnection.webBLE) {

      if (bleConnection.webBLEWrite) {
        bleConnection.webBLEWrite.writeValue(buffer)
        .then(function() {
          console.log('write complete');
        })
        .catch(function(error) {
          console.log('write failed', error);
        });
      }
      //var bleConnection.webBLEWrite = null;
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
