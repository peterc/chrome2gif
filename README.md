# chrome2gif

> Create an animated GIF from a page or animation rendered in Chrome via the debugging protocol's screencasting feature

*TOTALLY WORK IN PROGRESS/ALPHA/EXPERIMENT*

## Getting it working

You want to be running an instance of Chrome with the debugging protocol working on port 9222.

I do this, for example:

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222
```

For now it's not *quite* ready to use as a proper module as the structuring is terrible and it's not on npm.. but the code is all in and working, so you can test it like so:

```
npm run example
open /tmp/output.gif
```

This will navigate to a lovely GIF of Homer Simpson, capture frames for a second, then write them out to `/tmp/output.gif`. Want to go somewhere else?

```
npm run example https://slashdot.org/
```

.. and so on. Currently it starts recording while the page is still rendering - this may or may not be desirable!
