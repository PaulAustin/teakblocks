
# Kudos and Lessons Learned along the way.

Some history needs to be back-filled in

## interact.js
TODO, this is a Kudos.

## Colors
Each day is a chance to reflect on color sets. The paln is to have a few themes and a mechanism for changing them. The Web site [htmlcolorcodes.com](http://htmlcolorcodes.com/) has become a favorite. Its particularly good at finding sets of colors

## The Rounded Rects Riddle
TODO

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

Set up this Kudos and lessons log. Gogin to work on cleaning up the config dialogs. Need gesture to bring up config for block. At least a place holder. Perhaps double tap.
