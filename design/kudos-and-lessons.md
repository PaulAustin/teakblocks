
# Kudos and Lessons Learned along the way.

Some history needs to be back-filled in

## interact.js
TODO, this is a Kudos.

## Colors
Each day is a chance to reflect on color sets. The paln is to have a few themes and a mechanism for changing them. The Web site [htmlcolorcodes.com](http://htmlcolorcodes.com/) has become a favorite. Its particularly good at finding sets of colors

## The Rounded Rects Riddle
TODO

## Browserify
The background, much of my JS experience has come from the node.js world.
The require system works great and NPM has a very rich community and directory of packages. Bower looks a 'little' like that but every time I dig its a disappointment. As the yoda meme notes [Front End is the path to the dark side](http://i.imgur.com/mFMKEcB.jpg) ES6(ES2015) and Webpack stuff looks good but perhaps too green. Browserify proved to be pretty easy to switch to. Now all the JS is turning into modules and the global space is getting cleaned up.  (Note from the future, this helped with Web components as well)

It does seem that npm + browserify are mostly replacing bower.


## Cordova
Installed the npm package [Cordova](https://www.npmjs.com/package/cordova)

Restructured the directory to allow for cordova builds using the ```html_app``` directory. The ```htmlapp\www``` and be served for basic testing in a browser. Chrome is a good test to see if the app will work in android.

## BLE support
TODO

## August 29
Over all task, determine system for configurations panel definition.
Tabs, for configs,
Controls for panels
Skins for panels
composition mechanism

### Web components

Kudos: [Leon Revill](https://blog.revillweb.com/write-web-components-with-es2015-es6-75585e1f2584#.ncfmkpajj)
has good blog post on making a simple time tracking component. The purpose of
this past was to make the component in ES6 and then use BableJS. This tools is
now installed as [bable-cli](https://www.npmjs.com/package/babel-cli) from npmjs.

Lesson:
Ron's example include [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (here is a [another good explanation.](https://developers.google.com/web/updates/2015/01/ES6-Template-Strings)) The catch was in his example the sample code read roughly as follows:

```

// Works for Chrome, not Safari
let template = `<style>   
  ...    
<\style>`;
```

This works fine in Chrome but not Safari. All indications were that Safari should support this feature. What's up??. Turns out Safari only support template literals
assigned in ```var``` statements. ;)

```
// Works for Chrome and Safari
var template = `<style>
  ...       
<\style>`;
```
### Custom check boxes (just using CSS)
YouTube video from [DevTips](https://www.youtube.com/user/DevTipsForDesigners) on [How to make Custom Animated Checkboxes with CSS](https://www.youtube.com/watch?v=ojWA8pdT-zY)

Walks through many of the nuances of doing this correctly. There are probably about 20 css properties to set to get just the effect desired.

I also added ```-webkit-user-select: none;``` to prevent users from selecting the labels in the check boxes.
That one of those things that make app look a lot less native.

The authors demo show how any image (e.g. png) can be used, but also hilighted Font-Awesome.

### Font-Awesome

[Font-Awesome](http://fontawesome.io/) will be a good help, but not just for checkboxes. It has pretty much most all of the small Icons and app needs. including Bluetooth, signal strength, file sharing, etc. At 500K its pretty big, and there are options to selecting just the ones needed at a cost I think) but for now I'm pulling them all in using the NPM package[font-awesome](https://www.npmjs.com/package/font-awesome) Note, copying the font-awesome resources from node_modules
directory is still done by hand.

### watchify
Finally set up [watchify](https://www.npmjs.com/package/watchify) the tool that automatically kicks off Browserify builds, it works great. Added NPM script as well.

```
npm run bify      # single run of browserify
npm run wify      # automated runs of browserify
```

### Shadow DOM hick ups

No surprise here. compatibility issues.

### customized slider (AKA range input)

This is like customizing the checkbox but with it own set of quirks. started reading this [blog post](http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html) by Brenna Obrien.

## August 30, 2016

### Kudos and Lessons file (this log)
Set up this Kudos and lessons log.

Going to work on cleaning up the config dialogs. Need gesture to bring up config for block. At least a place holder. Perhaps double tap.

### Moved from JSHint to [ESLint](https://www.npmjs.com/package/eslint)
JSHint is not aware of ES6 features used by teak (template literals). Also, JSHint, the Atom.io plugin, is in the deprecated state. The new plugin, [linter-ESLint](https://atom.io/packages/linter-eslint), works well. First set of fixes are submitted with this note. More rules may be turned on. As an example of tweaks, ```no-console``` was switched from 'error' to 'warn'

### OSX screen resolution setting
Little know fact, press the option key while selecting the 'scaled option' A larger list of resolutions is then listed, this helps when you adapter isn't working quite right. Not exactly a Teak thing, but getting the external monitor working makes a difference.

### interact.js resizing
Fist attempt to auto scroll, did not work.

### interact.js double tap
Event fires fine, now to attach it to the configuration. The double tap is easy on PC browser, not so much on tablet app. Not sure why.

### Working at sliding divs in and out
This seems like a staple of Angular, and Bootstrap but beneath it all
the mechanics are straight forward css transforms. The [David Walsh Blog](https://davidwalsh.name/css-slide)
has a tutorial on what CSS properties to use. Hack: Double click on a block
to bring in the fake config box.

## August 31, 2016

### Teak form cleanup
Moved initial form position to tag so it can be place on the screen based on html.
Touched up shading for forms. MDN has a nice [page explaining ```box-shadow```](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow). The code was not using alpha before, looked odd when shadow was over color other than white.

### Accessibility
TODO: There is much to learn on how to make this app accessible. One part is the setting ```aria-hidden=true``` on components. Something to look at once the basic shell parts work.

### Buttons
Testing out font awesome by adding a few buttons to the app ( BLE scan, clear, config) the icons look nice. Helpful for debugging now, but It would be too easy to clutter the top level app with these.

## Sept 1, 2016

### BLE day
Going to try to get the scan working again under the browserify system, hopefully add chrome support as well.
Overwrote many notes today, bummer, due to accidental sync. Recreating a few note a day later.

Got scan working (on android) , Using Evothing's [Easlyble.js](https://evothings.com/doc/lib-doc/evothings.easyble.html). There are a few others our there. Here is short list:

* Evothings Easyble.hs (noted above)
* [Cordova-plugin-ble (npm)](https://www.npmjs.com/package/cordova-plugin-ble) I think Easyble uses this.
* [Cordova-blugin-ble-central(github)](https://github.com/don/cordova-plugin-ble-central)
* [cordova-plugin-bluetoothle(npm)](https://www.npmjs.com/package/cordova-plugin-bluetoothle)

All of these have fairly active development and look non trivial. Now that Easyble is working, my curiosity about the differences is lower. Though it is not uncommon to find abstractions of only modest value, so I will look into the workings of Easyble.js before too long.

## Sept 2, 2016

### screen bounce on android
Mostly fixed, mainly by turning of touch events to any thing that is not dragged. Looks like this does not prevent click events, (e.g. buttons and check boxes still work)

### more on BLE
Starting and stopping Scan. Notes on EVOThings [Easyble](https://evothings.com/forum/viewtopic.php?t=1804)


## Sept 5, 2016

### Moving tab bar to bottom and integrate buttons
Back after a few days break. Two core possibilities.
* Catch on-resize events
* can part of SVG layout relative to other parts

Reading some on [relative SVGs](https://sarasoueidan.com/blog/mimic-relative-positioning-in-svg/). Sara also includes a great write up on the box model used by HTML and CSS.

### Adding some sounds
It seems that the block should click in some cases. This was a bit of a bunny trail today but some key lessons were learned.

* The 'Click' makes a lot of sense when blocks snap together. Though now placing blocks on the surface
is missing feed back. Using click sounds wrong, nothing sounds wrong as well.

* The poof/pop for delete works, but should only happen when there are actually blocks the psychology feels pretty strong.

* The audio tag in chrome desktop works well, but safari is disappointing. Volume sounds good first time then it drops about 10dB after initial play.  But the works part is that sounds are about 500 ms delayed. its a known issue reported [here](disappointing), [here](http://stackoverflow.com/questions/9811429/html5-audio-tag-on-safari-has-a-delay), and [here](https://discussions.apple.com/thread/6886071?start=0&tstart=0)

* On Android, the safari-like delay seems to be present as well. It feels like an old film with out-of-sync audio.

The initial experiment has been checked in, And it is good to know the limitations. There are some [Cordova plugins](https://www.npmjs.com/package/cordova-plugin-nativeaudio) that might help. That will wait for another day.

## Sept 6, 2016

### work on palette code.

## Sept 7, 2016

### Started Teak npm package
Snippets of code will ideally be written in teak code, so it will help

### Doc tools
There are a few common JavaScript doc tools [this is a good write up]( http://www.fusioncharts.com/blog/2013/12/jsdoc-vs-yuidoc-vs-doxx-vs-docco-choosing-a-javascript-documentation-generator/)

## Sept 8-9, 2016

### teak npm package.
Developing the teak parser, serializer and simulator as a separate package. Now
published on [npmjs](https://www.npmjs.com/package/teak), and on [github](https://github.com/PaulAustin/teakjs)

## Sept 12, 2016

### Travis CI integration
[TravisCI-teak](https://travis-ci.org/PaulAustin/teakjs) integration is working. Status badge
added to the reamme.md file. Eventually this will be added to teak-blocks as well.

### Teak, NPM, and Tonic examples
Got Teak to a bare minimum feature set now that it support (1)binding to symbols in
a symbol table ( such as function names), (2)objects, and (3)comments. Also added
a custom example for [teak's npmjs/tonic integration](https://tonicdev.com/npm/teak)

## Sept 13, 2016

### Palette work
Cleaned up palette layout (just a bit) buttons, and other cleanup. Palette as a whole is a group
now so it can be moved with one translation, although buttons basically float on top.
About time to evaluate options for internationalization.
Also, I keep avoiding the list box on the scan page. Tomorrow

## Sept 14, 2016

### String translation notes.
String use is to be a minimum. these are the ideal rules
1. User blocks will have no strings other than messages or comments provided by student/child/User
2. No stings in the top level UX. Mainly using Font Awesome icons.
3. Strings will be in config forms. String swapping support should be in ```teak-forms.js```

Some interesting notes on using CSS for language substitution [at the w3c](https://www.w3.org/International/questions/qa-css-lang) and  [here](https://www.smashingmagazine.com/2014/06/css-driven-internationalization-in-javascript/)
One key part is the [ISO 631-9](http://www.w3schools.com/tags/ref_language_codes.asp) language codes.
To be clear, they are different from [country codes](http://www.w3schools.com/tags/ref_country_codes.asp). Some countries have many languages (India). Some languages are used in many countries (Spanish)

### github pages (gh-pages)
This may be a good place to host preliminary versions of the tool. As a bonus, of June 8, 2016 [https support is official](https://github.com/blog/2186-https-for-github-pages). That will help with use of BLE APIs

### Google analytics?, feed back.
Need to set up something like this before posting on gh-pages. Also a feed back from system. Once we start sharing it, gathering feed back is important.

### Device list working
On android it shows devices that are advertising. On desktop some dummy names are added its just a start
now its time to get the pairing working. Some notes here: [here](https://evothings.com/evothings-and-the-bbc-microbit/)

### digging in to BLE pairing.

https://github.com/lancaster-university
The [DAL](https://github.com/lancaster-university/microbit) AKA Device abstraction layer was done by lancaster university.

The have [many micro:bit projects](https://github.com/lancaster-university) on github

[DapLink](https://www.mbed.com/en/development/hardware/prototyping-production/daplink/daplink-on-kl26z/#Updating_your_DAPLink_firmware)


Code for the pairing is [here](https://github.com/lancaster-university/microbit-dal/blob/ee2af2c489a2501ca7d9559f42292964864c08d5/source/bluetooth/MicroBitBLEManager.cpp) particularly around line 470.

https://developer.mbed.org/platforms/Microbit/#firmware

### Foot ball team dinner Thursday
Not much work today :) ( they had a good game, learned lessons from last week)

### brainstoring on control hardware
Friday was a HW day, no SW

### Two way binding for html
The html panels been ignored for a week now, time to make some forms work. This [blog post by Luca Ongaro](http://www.lucaongaro.eu/blog/2012/12/02/easy-two-way-data-binding-in-javascript/)covers several options [AngularJS](https://angularjs.org/) [Ember.js](http://emberjs.com/) [KonckoutJS](http://knockoutjs.com/) [ReactJS](https://facebook.github.io/react/) It also details how to do your own. I'll allow on day to select a solution. The goal: avoid bloat, make it easy for others to add forms.

### Some comparisons
* [From smashingBoxes](http://smashingboxes.com/blog/choosing-a-front-end-framework-angular-ember-react)
* [From sitepoint](https://www.sitepoint.com/react-has-won-the-client-side-war/)
* [TodoMVC](http://todomvc.com/)
* [ycombinator thread](https://news.ycombinator.com/item?id=7738194)

### Some notes
These packages pull many 'web aplication' tools some thath are not needed right now, especially for a cordova style app.
don't need URL routing, or server side tie in to php, or .net

## Sept 19

### initial conclusion, knockout
The goal was to get two way data binding, and that is exactly what knockout does. Install from [npmjs/knockout](https://www.npmjs.com/package/knockout).

## Sept 20-22
Subbing at Murchison - students were learning HTML :)

## Sept 23

### Safari woes.
Turns out safari and the web components polyfill is not working, block are not draggable. Components them selves actually work. ( e.g. the dialogs and data binding. Phone was working fine on ShadowCat build until applying safari 10.2 update. now only green buttons show. from searched, might be webcomponent problem :(

### Working on simulator.
This will be key for testers that do not have hardware.

## Sept 24-29

## mainly working on teakjs (teak on npm)
Writing the engine in javascript, then C. Its easier to experiment in JS.

## break, work on 3d stuff, electronics.

## Oct 24
### Chrome 54 will list microbits, and can connect to them
Goal get a serial connection tothe microbit.
### Cordova OSX native desktop app.
not to hard to add. but app is not working too well.
Debug time. :(
https://cordova.apache.org/docs/en/latest/guide/platforms/osx/

### Styles vs Attributes, core of the incompatibility bugs.
HTML compatibility is a funny thing. Consumed a day learning the following important [SVG detail](http://stackoverflow.com/questions/14383014/svg-rect-ignores-height). The core lesson was that DOM elements have attribute and style properties. Sometimes
they seem the same, especially in some browser (e.g. chrome), but not always. If a property such as
width is treated as a style then it can be set via css. If its just a plain attribute
then it cannot be set via CSS.

```
elt.style.width = w;                            // works in chrome, not ff.
elt.setAttribute('width', String(w) + 'px');    // works 'everywhere'
```
In some cases the oddest wist was that if the style is set, then the style value masked the attribute. which could also be set and could have its own value. Lesson, for now, NEVER set the width or height style property.

## Nov 2
A special day, a day to remember to be grateful for the joys we have in life.

## Nov 3
### DiagramBlocks collection refactoring
The problem: The collection grew out of the first demo program, it was a simple array. SVG elements have an id property that is basically the index number in the array. That system made it problematic to remove elements from the array.

The solution: Every block is given a unique id. The SVG elements use that id instead. The function block model objects are stored in a JS object as if it is a dictionary or hashmap. one caveat with that approach is that since it is a simple JS object it is missing methods such as for-each. Two choices make it a full fledges object, or keep the object simple and add the methods to the editor object. The latter approach was selected. The result was pretty clean:

```
editor.forEachDiagramBlock(function(block) {
 // visit every block on the digram
}
editor.forEachDiagramChain(function(block) {
 // visit the first block in each chain on the digram
}
```

This design has the upside that the digramBlocks object is a bit more private to the editor. Just a bit though. More methods on the editor.

## Nov 4
### Revisiting Shadow DOM and web components
The concept is nice, I hope it comes together,... but two observations as of now
(1) It is causing some problems, on some browsers the styles leak and then on others the boundary is stronger. It causes problems in both directions.
(2) This app does not have a great need for it.

## Nov 7-11
### Started work on custom icons based on SVGs.
This included tests on the low end Amazon fire tablet. Performance seem decent.

### Using Manual Start with interact.js
ManualStart Mode means the code watches for a move with mouse down, and if conditions are right
it starts the drag. The upside is that now dragging from the palette or making a copy
can make the copy and they start dragging the copy, not the original. Code is much better
This should help on hold and tap gestures for tablets as well.
 ( list gotcha)
## Nov 14
### Trying to build cordova for iOS

### Loops
The basic loop chunk is now working. This brings teak block core terms to three
1. Block individual block, might have a sub diagram, but cannot be pulled apart.
2. Chain an entire chain of blocks. grabbing the left most one gras all of the.
3. Chunk a sub section of a chain. If a user grabs the middle the chin will break into two chunks
4. Loop-Chunk a tighter sub section. If a user grabs any block in a loop chunk they willget the entire loop.

If-Chunks, and case or map-chunks will come in time. I expect some fine tuning on the
editing gestures.

## Nov 21-22
### BLE work
Using knockout.js [foreach construct](http://knockoutjs.com/documentation/foreach-binding.html) to manage the list of BLE devices.

UART over BLE is a bit of an odd thing. Each vendor has their own UUID.
for their version of the service. One list I found was in [Noble package](https://github.com/tigoe/BluetoothLE-Examples/blob/master/noble/readSerial/ble-uart.js) for node.
At this point teak-blocks just needs the one for the nordic chips, but its good to see the others.

I found several examples of accessing BLE-UART from JS related to Adafruit's
[Bluefruit](https://www.adafruit.com/product/2479) board which is based on the
same nordic chip used by the micro:bit.

## Time off for thanks giving. :)

## November 28
More work on config panel. In many place white space in HTML has no impact. But here is a subtle one.
I spent a while tracking down why some buttons appeared to have a margin, or padding.

```
  <button >
    123
  </button>
  <button>
    ABC..
  </button>
```
In case one above, the new line between will turn into a space. This is not margin, or padding though it looks like it.
```
  <button >
    123
  </button><button>
    ABC..
  </button>
```
Remove *all* whitespace between the buttons so the buttons touch one another. This was helpful for creating tabs.
Learn more [here](http://stackoverflow.com/questions/17365017/how-to-delete-extra-space-between-buttons). Also,
it helpful to know that border radius parameter can be set for [each corner](http://stackoverflow.com/questions/11483708/creating-rounded-corners-for-top-half-of-the-buttons-in-css).

```
<button style="border-radius:0px 0px 10px 0px">
  ...
</button>
```
This allows the buttons to blend with the edge of the rounded container they are in.

## December 5-7
### much more work on the device list
There are many ways to make a list-box in HTML, mnay bad ways and a few good. Very few.
First was the nice use of the <select tag> its a native element and very nice, however
mobile browsers take it upon them selves to ignore all CSS and thow up a full screen display to choose
perhaps one of two items. The table method was originally used. But attempt 3 is the unordered list.

One key part was learning more about nested observables. with care this works quite well.
now setting the selected flag in the view model automatically adds/removes a CSS class based
on knockouts css binding feature. Much of it come down to this:

```
<div class='list-box-shell'>
    <ul class='list-box' data-bind='foreach: devices'>
      <li data-bind= "css:{'list-item-selected':selected()}">
        <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
      </li>
    </ul>
</div>`
```

Now back on to establishing connecting...

## Mid December
Added music not block, tested out abilty to generate sound programmatically in
the browser. clipping behavies differently based on broswer, adding notes and getting value
over 1.0 can sound quite harsh


## January not much.
Look at logs if you wish.

## February
Sorted out BLE issues with MicroBit Serial Mode RX/TX were swapped.

## March  
SXSWedu went well demoed simple connection and execution. Now too much is going
on in the background, the app eats power.

Selection taking shape

Adding Loops, conditions etc. one key part here is automatic variables. These
change over time as sensors do. They can be used as iterators as well. In a
a very psuedocode form it looks like this.

For example:
c:count(5)
while(c.count()) {
  print(c.value());
}

Its a bit much for simple counters, but is well suited for many othet cases.
basically variables are give an autonomous nature. it may be simple but it is
autonomous, like nature it self.

making a var that takes on sine value, plays a waveform, etc is now more direct.
a simple variable does nothing on its own, but can be set. Well the do
initialize themselves. They are never uninitialized, as nature never is.
There is quite likely a hint of smalltalk here.

 var.next   // used on Loops
 var.record // add a new value to the stat ( average, max, min, ....)
 var.reset  // type specific
 var.read   // passively read current value
 var.write  // passively write value, may be ignored
 var.subscribe  // trigger on new value?
 var.state  // => static, idle, time-dependent, world-dependent,...

### signing an alpha app.

[stackoverflow discussion](http://stackoverflow.com/questions/26449512/how-to-create-a-signed-apk-file-using-cordova-command-line-interface)

 keytool -genkey -v -keystore teakblocks.keystore -alias teakblocks -keyalg RSA -keysize 2048 -validity 10000


## September - the end of it no less.
### looked at documentation tools
JSDoc, documentation.js, yuidoc, ESDoc. pretty sad state of affairs. though not for lack of a
lot of work. In many cases
is seem more like the tools ignore the the language and just provide an ugly way
clutter code with parallel outline of information that may or might not be related to the source.
not of the extract the sources structure. Doxygen for C++ provides that as a base and then
hangs user level comments on the generated text. Oh well different goals.

### checked out basic documentation
1. //* /** or GT!--* (HTML comment) begin a block of external comments
This is a comment that is intended to be extracted.
2. The outline of generated doc has the following outline
 (a) file system - directories,
 (b) file system
 (c) indentation in a file

After a comment perhaps a preprocessor can guess at the sections intent.
 (a) funciton - next line contains 'function'
 (b) simple constant
 (c) module   - module.export
 (d) object   -
 (e) function flow (body of function that explains how it works)
 (f) lambdas (perhaps)

## November
Work on BT in browser, and general clean ups.
The BT connection class now support web Bluetooth discovery. Read/write still to be added. ONe bit that came out of this is a bit of complexity that the connection system has. Now that the underlying APIs are butter understood perhaps its time to revist the
over all system.

1. The bleConnection system will have alist of all robots that the app know about, this can inlcude BLE, USB, simulated
or network connections. The name of this class will change.

2. The sub systems can map a name to a connectionIfo Object that knows the connections status
to the connection. Note, its is possible for a device to change underlying connections tools. so primary read/Write operatiosn are
on the conection system not on a connection.

3. Devices come and go the connection manager will let the ( editor know of changes) the conductor will see the changes
by observing changes in the editor objects.

4. If device dissapeared and then show up again. If there is a block that is paired to that robot it will try to reconnect to it.
(does this make sense?)

5. The app should have a simple means to turn off all connections this makes it easy to share  bot wiht others.  When turne back on
it will try to reconnect to bots the diagram is connected to.
