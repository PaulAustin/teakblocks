/* eslint-disable no-alert, no-console */

// The command line for browserify only provides for a few options.
// There is far more control when run a node moduel. So this shell does that.

var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require("uglify-js");

var args = process.argv.slice(2);
console.log('wify args: ', args);

var input = path.join(__dirname, 'source/index.js');
var output = path.join(__dirname, 'html_app/www/bundled_tbe.js');

console.log('running watchify on ', input);

var uglifyFlag = (args.length >= 1 && args[0] ==='-u');
if (uglifyFlag) {
  console.log('include uglify pass TODO');
}

var b = browserify(
  {
    entries:[input],
    cache:{},
    paths:['./node_modules','./source/uxtools'],
    plugin: [watchify]
  }
);

// Bundling function is used when watchify tirggers it and to prime the
// the system.
function doBundle (bObject) {
  bObject.bundle(function (err, buf) {
      // This callback is just to get the size of the buffer.

      var d = new Date();
      if (buf !== undefined)
        console.log('generating ', output, 'size is ',buf.length, ' when ', d);
      else
        console.log('ERROR cant build', err);
    })
    .on('error', console.error)
    .pipe(fs.createWriteStream(output));
}

b.transform("babelify", {presets: ["es2015"]});
b.on('update', function() { doBundle(b); } );

// Prime the system by doing the initial.
doBundle(b);

// uglifyjs.minify(fs.readFileSync('geolocation.service.js', 'utf8'))
//  .transform("babelify", {presets: ["es2015", "react"]})
// b.transform("babelify", {presets: ["es2015"]})
/*
.bundle(function (err, buf) {
  if (err) {
    return console.log(err);
  }

  let reply = fs.writeFile(output, buf, function (err) {
    if (err)
      return console.log(err);
    else {
      return 0;
    }
  });
*/

  //bundle();

/*
"bify": "browserify source/index.js -o html_app/www/bundled_tbe.js; ls -l html_app/www/bundled_tbe.js",
https://writingjavascript.org/posts/introduction-to-browserify
*/
