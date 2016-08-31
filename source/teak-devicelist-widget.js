/*
<!--script src='cordova.js'></script-->
<!--script src="easyble.dist.js"></script-->
<!--script>
  var blelog = document.getElementById('teakLog');
  blelog.value = "hello\n";

 function log(text) {
   blelog.value = blelog.value + '\n' + text;
 }

 var zapp = {};
 zapp.devices = [];

 log('whats up?');

 log('evothings');
 log(evothings);

  document.addEventListener(
    'deviceready',
    function() { start() },
    false);

 function start() {
 evothings.ble.startScan(
  function(device)
  {
    log('success');
    log(device  );
    // Report success. Sometimes an RSSI of +127 is reported.
    // We filter out these values here.
    if (device.rssi <= 0)
    {
      foundDevice(device, null);
    }
  },
  function(errorCode)
  {
    log('error');
    log(errorCode);
    foundDevice(null, errorCode);
  }
);
}
// Called when a device is found.
function foundDevice(device, errorCode)
{
if (device)
{
  // Set timestamp for device (this is used to remove
  // inactive devices).
  device.timeStamp = Date.now();

  // Insert the device into table of found devices.
  //zapp.devices[device.address] = device;

  log (device.name);
  log (device.rssi);

}
else if (errorCode)
{
  log(errorCode);
}
};

*/
