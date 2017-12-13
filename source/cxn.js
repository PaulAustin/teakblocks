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
  var log = require('./log.js');
  var ko = require('knockout');

  var cxn = {};
  cxn.connectionChanged = ko.observable({});
  cxn.connectionChanged.extend({ notify: 'always' });
  cxn.messages = [];
  cxn.accelerometer = 0;
  cxn.compass = 0;
  cxn.temp = 0;

// State enumeration for conections.
cxn.statusEnum = {
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

cxn.webBLERead = null;
cxn.webBLEWrite = null;

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
  cxn.appBLE = ble; // eslint-disable-line no-undef
  cxn.webBLE = null;
} else if (navigator.bluetooth !== null && navigator.bluetooth !== undefined) {
  // Second, see if ther appears to be a web bluetooth implmentation.
  cxn.appBLE = null;
  cxn.webBLE = navigator.bluetooth;
} else {
  // None found.
  cxn.appBLE = null;
  cxn.webBLE = null;
}

//
cxn.scanUsesHostDialog = cxn.webBLE;

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

cxn.devices = {};
cxn.scanning = false;
cxn.psedoScan = function () {
  if (pbi >= pseudoBeacons.length) {
    pbi = 0;
  }
  var beaconInfo = pseudoBeacons[pbi];
  cxn.beaconReceived(beaconInfo);
  pbi += 1;
  if (cxn.scanning) {
    setTimeout(function() { cxn.psedoScan(); }, beaconInfo.delay);
  }
};

cxn.stopScanning = function () {
  cxn.scanning = false;
  if (cxn.appBLE) {
    cxn.appBLE.stopScan();
  }
};

cxn.findDeviceByMac = function(mac) {
  for (var deviceName in cxn.devices) {
    var device = cxn.devices[deviceName];
    if (mac === device.mac) {
      return device;
    }
  }
  return null;
};

// strip down the name to the core 5 character name
cxn.bleNameToBotName = function(rawName) {
  if (rawName.startsWith('BBC micro:bit [')) {
    return rawName.split('[', 2)[1].split(']',1)[0];
  } else {
    return null;
  }
};

// A Device has been seen.
cxn.beaconReceived = function(beaconInfo) {
  if (beaconInfo.name !== undefined) {
    var botName = cxn.bleNameToBotName(beaconInfo.name);

    // If its a legit name make sure it is in the list or devices.
    if (botName !== null) {

      // Merge into list
      if (!this.devices.hasOwnProperty(botName)) {
        this.devices[botName] = {
           name: botName,
           mac: beaconInfo.id,
          };
          // Now set the status and trigger observers
          cxn.setConnectionStatus(botName, cxn.statusEnum.BEACON);
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

cxn.cullList = function() {
  var now = Date.now();
  for (var botName in cxn.devices) {
    var botInfo = cxn.devices[botName];

    // Per ECMAScript 5.1 standard section 12.6.4 it is OK to delete while
    // iterating through a an object.
    if ((botInfo.status === cxn.statusEnum.BEACON) && (now - botInfo.ts) > 4000) {
      delete cxn.devices[botName];
    } else if (botInfo.status === cxn.statusEnum.NOT_THERE) {
      log.trace('culling missing bot');
      delete cxn.devices[botName];
    } else if (botInfo.status === cxn.statusEnum.CONNECTING) {
      // If it is stuck in connecting then drop it.
      log.trace('culling hung connection');
      delete cxn.devices[botName];
    }
  }

  // Let observers know something about the list of devices has changed.
  cxn.connectionChanged(cxn.devices);
};

cxn.startScanning = function () {
  cxn.scanning = true;

  if (cxn.webBLE) {
    cxn.webBTConnect();
  } else if (cxn.appBLE) {
    cxn.appBLE.startScanWithOptions([], { reportDuplicates: true },
      function(device) {
        cxn.beaconReceived(device);
      },
      function(errorCode) {
        log.trace('error1:' + errorCode);
      });
  } else {  // bleAPI is not null looks like cordova model.
    log.trace ('simulated bluetooth scan');
    cxn.psedoScan();
  }
};

// For Web bluetooth use the promises style of chaining callbacks.
// It looks a bit like one function, but it is a chain of 'then'
// call backs
cxn.webBTConnect = function () {

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
      log.trace('> device:', device);
      var beaconInfo = {
        name : device.name,     // Should be in 'BBC micro:bit [xxxxx]' format
        id: device.id,          // looks like a hast of mac id perhaps
        rssi: -1,               // signal strength is not shared with JS code
        autoSelect: true        // indicate that the app should now connect.
      };
      cxn.beaconReceived(beaconInfo);
      device.addEventListener('gattserverdisconnected', cxn.onDisconnecWebBLE);
      return device.gatt.connect();
    })
    .then(function(server) {
      log.trace('> primary service:', server);
      return server.getPrimaryService(nordicUARTservice.serviceUUID);
    })
    .then(function(primaryService) {
      log.trace('> primary Service:', primaryService);
      // Calling getCharacteristics with no parameters
      // should return the one associated with the primary service
      // ( the tx and rx service)
      return primaryService.getCharacteristics();
    })
    .then(function(characteristics) {
      var rawName = characteristics[0].service.device.name;
      log.trace('> characteristics:', rawName, characteristics);
      var botName = cxn.bleNameToBotName(rawName);
      cxn.scanning = false;
      cxn.setConnectionStatus(botName, cxn.statusEnum.CONNECTED);

      // testing this in chrome has worked.
      // Could add validation code to confirm nothing has changes
      // [0].uuid = 6e400002-... (tx)
      // [1].uuid = 6e400003-... (rx)
      cxn.webBLEWrite = characteristics[0];
      cxn.webBLERead = characteristics[1];
      cxn.webBLERead.startNotifications()
      .then(function() {
          log.trace ('adding event listener');
          cxn.webBLERead.addEventListener('characteristicvaluechanged',
          cxn.onValChange);
      });
    })
    .catch(function(error) {
      cxn.scanning = false;
      cxn.connectionChanged(cxn.devices);
      log.trace('cancel or error :' + error);
    });
};

cxn.onDisconnectAppBLE = function(info) {
  log.trace('onDisconnectAppBLE:', info);
  var botName = cxn.bleNameToBotName(info.name);
  cxn.setConnectionStatus(botName, cxn.statusEnum.NOT_THERE);
  cxn.cullList();
};

cxn.onDisconnecWebBLE = function(event) {
  log.trace('onDisconnecWebBLE:', event.target.name);
  var botName = cxn.bleNameToBotName(event.target.name);
  cxn.setConnectionStatus(botName, cxn.statusEnum.NOT_THERE);
  cxn.cullList();
};

// Determine the status of a named connection.
cxn.connectionStatus = function (name) {
  if (cxn.devices.hasOwnProperty(name)) {
    return cxn.devices[name].status;
  } else {
    return cxn.statusEnum.NOT_THERE;
  }
};

// Change a devices status and trigger observers
cxn.setConnectionStatus = function (name, status) {
  //
  log.trace('SCS', cxn.devices);
  var dev = cxn.devices[name];
  if (dev !== null) {
    dev.status = status;
  }
  // cxn.devices[name].status = status;
  // Trigger notifications.
  cxn.connectionChanged(cxn.devices);
};

// NOT USED, TODO where should it be used.
cxn.disconnect = function(mac) {
  // TODO need to resolve where MAC vs name is used.
  if (cxn.appBLE) {
    cxn.appBLE.disconnect(mac);
  }
};

cxn.connect = function(name) {
  if (cxn.devices.hasOwnProperty(name)) {
    var mac = cxn.devices[name].mac;

    if (cxn.appBLE) {
      cxn.setConnectionStatus(name, cxn.statusEnum.CONNECTING);
      cxn.appBLE.connect(mac, cxn.onConnect,
        cxn.onDisconnectAppBLE, cxn.onError);
    } else if (cxn.webBLE) {
      // Should already be connected.
      // TODO, no the connection can be postponed until needed (perhaps)
    } else {
      // For no BLE present, pretend the device is connected.
      cxn.setConnectionStatus(name, cxn.statusEnum.CONNECTED);
    }
  }
};

cxn.onConnect = function(info) {
  log.trace('On Connected:', info.name, info);
  // If connection works, then start listening for incomming messages.
  cxn.appBLE.startNotification(info.id,
     nordicUARTservice.serviceUUID,
     nordicUARTservice.rxCharacteristic,
     function (data) { cxn.onData(info.name, data); },
     cxn.onError);

  var dev = cxn.findDeviceByMac(info.id);
  if (dev !== null) {
    cxn.setConnectionStatus(dev.name, cxn.statusEnum.CONNECTED);
  }
};

cxn.onData = function(name, data) {
  var str = bufferToString(data);
  log.trace('On Data:', name, str);
  cxn.messages.push(name + ':' + str);
  if(str.includes('accel')){
    cxn.accelerometer = str.substring(7, str.length - 2);
  } else if(str.includes('compass')){
    cxn.compass = str.substring(9, str.length - 2);
  } else if(str.includes('temp')){
    cxn.temp = str.substring(6, str.length - 2);
  }
};

cxn.onValChange = function (event) {
  let value = event.target.value;
  var str = bufferToString(value.buffer);
  log.trace('BLE message recieved', str);
};

cxn.onError = function(reason) {
  log.trace('Error2:', reason);
};

cxn.write = function(name, message) {
  if (cxn.devices.hasOwnProperty(name)) {
    var mac = cxn.devices[name].mac;
    var buffer = stringToBuffer(message);

    if (cxn.appBLE) {
      buffer = stringToBuffer(message);

      // Break the message into smaller sections.
      cxn.appBLE.write(mac,
        nordicUARTservice.serviceUUID,
        nordicUARTservice.txCharacteristic,
        buffer,
        cxn.onWriteOK,
        cxn.onWriteFail);
    } else if (cxn.webBLE) {

      if (cxn.webBLEWrite) {
        cxn.webBLEWrite.writeValue(buffer)
        .then(function() {
          log.trace('write complete');
        })
        .catch(function(error) {
          log.trace('write failed', error);
        });
      }
      //var cxn.webBLEWrite = null;
    }
  }
};

cxn.onWriteOK = function (data) {
  log.trace('write ok', data);
};
cxn.onWriteFail = function (data) {
  log.trace('write fail', data);
};

return cxn;
}();