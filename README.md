# chrome2gif

> Create an animated GIF from a page or animation rendered in Chrome via the debugging protocol's screencasting feature

*TOTALLY WORK IN PROGRESS/ALPHA/DON'T TRUST AT ALL/EXPERIMENT*

## Getting it working

You want to be running an instance of Chrome with the debugging protocol working on port 9222.

I do this, for example:

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222
```

For now it's not ready to use as a proper module, so I'm testing like so:

```
node index.js "http://www.reactiongifs.com/r/2012/06/homer_lurking.gif"
```

It has unresolved problems, such as needing to wait until all frame callbacks are finished before doing the completion callback, and a promise missing a catch which I can't figure out. But there's enough here for someone with extra intelligence to progress =)
