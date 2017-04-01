'use strict';

// Connect to a Chrome instance with an open debugging port,
// send it to a URL, and capture frames.

const chrome = require('chrome-remote-interface');
const fs = require('fs');
const microtime = require('microtime');
const PNG = require('png-js');
const GIFEncoder = require('gifencoder');

module.exports = (url, width, height, totalTime, frameCallback, completedCallback) => {
  // Run for a second by default
  if (!(typeof totalTime === 'number'))
    totalTime = 1000;

  return (function (url, width, height) {
    let oldTime = microtime.now();
    let newTime;
    let frames = [];
    let frameNumber = 1;
    let casting = false;

    chrome({ port: 9222 })
      .then(devtools => {
        devtools.Page.screencastFrame((frame) => {
          // Acknowledge we got the frame
          devtools.Page.screencastFrameAck({sessionId: frame.sessionId});

          if (!casting) { return; }

          // How long between frames?
          newTime = microtime.now();
          let frameLength = newTime - oldTime;
          oldTime = newTime;

          // Store frame number and timing info on the frame object
          frame.frameNumber = frameNumber;
          frame.frameLength = frameLength;

          // Convert from base64 to a normal binary PNG
          frame.data = Buffer.from(frame.data, 'base64');

          // Store the frame for later
          frames.push(frame);

          // Call the callback!
          frameCallback(frame);

          frameNumber++;
        });

        if (typeof width === 'number')
          devtools.Emulation.setVisibleSize({ width: width, height: height });

        devtools.Page.navigate({ url }).then(() => {
          devtools.Page.startScreencast({ format: 'png' });
          casting = true;

          setTimeout(async () => {
            casting = false;
            devtools.Page.stopScreencast();
            await devtools.close();
            completedCallback(frames);
          }, totalTime);
        }).catch(e => console.error(e));
      })
      .catch(e => console.error(e));

  })(url, width, height);

};

if (require.main === module) {
  // No URL? Let's use Homer retreating into a bush
  let url = (typeof process.argv[2] === 'string') ? process.argv[2] : 'http://www.reactiongifs.com/r/2012/06/homer_lurking.gif';
  console.log(url);

  //let frameCallback = (frame) => {
  //  // Just save the PNG data to file for testing purposes
  //  let frameFilename = "/tmp/frame-" + frame.frameNumber + ".png";
  //  console.log("writing " + frameFilename);
  //  fs.writeFile(frameFilename, frame.data, function(err) {
  //    if(err) { return console.log(err); }
  //  });
  //};

  let frameCallback = (frame) => { };

  let completedCallback = async (frames) => {
    let firstFrame = new PNG(frames[0].data);
    let width = firstFrame.width;
    let height = firstFrame.height;

    console.log(frames.length + " frames at " + width + "x" + height);

    let encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream('/tmp/output.gif'));

    encoder.start();

    let framePromises = frames.map(async (frame) => {
      return await new Promise((resolve, reject) => {
        let parsedFrame = new PNG(frame.data);
        parsedFrame.decode((px) => { resolve(px); });
      }).catch(e=>{ console.log(e); });
    });

    for (let framePromise of framePromises) {
      encoder.addFrame(await framePromise);
    }

    encoder.finish();
  };

  module.exports(url, 640, 400, 1000, frameCallback, completedCallback);
}


