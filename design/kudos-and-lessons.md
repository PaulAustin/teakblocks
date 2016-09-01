
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

## August 30

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

## August 31

### Teak form cleanup
Moved initial form position to tag so it can be place on the screen based on html.
Touched up shading for forms. MDN has a nice [page explaining ```box-shadow```](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow). The code was not using alpha before, looked odd when shadow was over color other than white.

### Accessibility
TODO: There is much to learn on how to make this app accessible. One part is the setting ```aria-hidden=true``` on components. Something to look at once the basic shell parts work.

### Buttons
Testing out font awesome by adding a few buttons to the app ( BLE scan, clear, config) the icons look nice. Helpful for debugging now, but It would be too easy to clutter the top level app with these.

## Sept 1

### BLE day
Going to try to get the scan working again under the browserify system, hopefully add chrome support as well.
