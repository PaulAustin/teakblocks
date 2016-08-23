# Teak Blocks
A web based block editor for making teak programs.


# Tools you may need
Teak Block editor is implimente in HTML5. The underlying JavaScrpt is bundled with [browserify](http://browserify.org/). This is typically installed as such:

```
npm install -g browserify
```
Yes, it is also based on npm packages and thus npm and node itself.


The directory is set up to with [Condova](https://cordova.apache.org/) and [EVO Things](https://evothings.com/). Cordova is also installed with npm.

```
npm install -g cordova
```

# Building
Automation is still minimal but there are a few tools packaged as npm scripts. One upside to npm scripts is that they can be run from any directory in the repo's file structure.

```
npm run bify    // Run browserify

npm run abuild   // Kick off Cordova/android build

npm run adeploy  // Down load to tablet/phone using adb

npm run          // List the scripts.
```
