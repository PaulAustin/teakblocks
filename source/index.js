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

var app = require('./appMain.js');

// Determine if page launched in broswer, or cordova/phone-gap app.
app.isRegularBrowser =
  document.URL.indexOf('http://') >= 0 ||
  document.URL.indexOf('https://') >= -0;

if (!app.isRegularBrowser) {

  // Add view port info dynamically. might help iOS WKWebview
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
  document.getElementsByTagName('head')[0].appendChild(meta);
  //<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">


  app.isCordovaApp = true;
  // Guess that it is Cordova then. Not intened to run directly from file:
  document.addEventListener('deviceready', app.start, false);
  var script = document.createElement('script');
  // Load cordova.js if not in regular browser, and then set up initialization.
  script.setAttribute('src','./cordova.js');
  document.head.appendChild(script);
} else {
  // If in regular broswer, call start directly.
  app.isCordovaApp = false;
  app.start();
}
