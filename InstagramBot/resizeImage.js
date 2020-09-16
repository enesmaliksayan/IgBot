var async = require('async'),
  fs = require('fs'),
  path = require('path');

const sharp = require('sharp');

function resize() {
  var queue = async.queue(resizeimg, 5000);

  var dirSource = __dirname + '/downloaded';

  fs.readdir(dirSource, function (err, files) {
    files.forEach(function (file) {
      queue.push(file)
    });
  });
}

function resizeimg(file, cb) {

  var dirSource = __dirname + '/downloaded';
  var dirDestFeed = __dirname + '/feed';
  var dirDestStory = __dirname + '/story';

  var sharpFile = sharp(dirSource + '/' + file);

  sharpFile.metadata().then(q => {
    if (q.width > q.height) { // landscape
      sharpFile.resize({
          width: 1080,
          height: 810,
          fit: sharp.fit.cover
        })
        .toFile(dirDestFeed + "/" + file, function (err, info) {
          if (err)
            console.log("hata", err);

          console.log("feed " + file);
        });

    } else { //portrait

      sharpFile.resize({
          width: 1080,
          height: 1920,
          fit: sharp.fit.cover
        })
        .toFile(dirDestStory + "/" + file, function (err, info) {
          if (err)
            console.log("hata", err);

          console.log("story " + file);
        });
    }

  });
}

resize();