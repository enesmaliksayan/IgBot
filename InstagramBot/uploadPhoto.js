const Instagram = require('instagram-web-api')
var userData = require('./CONFIG.json');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question("Please enter username:\n", answer => {
readline.close();

const {
  username,
  password
} = {
  username: userData[answer].username,
  password: userData[answer].password
};
const fs = require('fs');
const path = require('path');

const client = new Instagram({
  username,
  password
})
var feedDir = __dirname +"/"+ username+'feed/';
var storyDir = __dirname +"/"+ username+ 'story/';
var photoList = [];
var storyList = [];
console.log(feedDir);


fs.readdir(feedDir, (err, files) => {
  files.forEach(file => {
    photoList.push(feedDir + file.toString());
  });
});

fs.readdir(storyDir, (err, files) => {
  files.forEach(file => {
    storyList.push(storyDir + file.toString());
  });
});

var captionList = userData[answer].captionList;

setTimeout(() => {

  client
    .login()
    .then(() => {
      var loggedDate = new Date();
      console.log("Logged in! - " + loggedDate.toUTCString());

      //Upload feed
      // var feedInterval = setInterval(() => {
        if (photoList.length == 0) {
          console.log("all photos uploaded.");
          clearInterval(feedInterval);
          return 1;
        }

        var photo = photoList[0];
        var captionStr = "";
        for (var i = 0; i < 7; i++) {
          var randomNumber = Math.floor(Math.random() * captionList.length);
          captionStr += captionList[randomNumber];
        }

        client.uploadPhoto({
            photo,
            caption: 'follow us for more inspiration photos about interior design and sweat homes.\r\n' +
              captionStr,
            post: 'feed'
          })
          .then(q => {
            var postDate = new Date()
            console.log(photo + "  -  file uploaded. - " + postDate.toUTCString());
            try {
              fs.unlinkSync(photo)
              photoList.shift();
              console.log(photo + "  -  file removed. Left count: " + photoList.length);
            } catch (err) {
              console.error(err, photo);
            }
          }).
        catch(e => {
          console.log("upload err", e);
        });

      // }, 1000 * 60 * 60 * 3); // 3 saatte bir çalışacak.


      //Upload story
      var storyInterval = setInterval(() => {
        if (storyList.length == 0) {
          console.log("all stories uploaded.");
          clearInterval(storyInterval);
          return 1;
        }

        var photo = storyList[0];

        client.uploadPhoto({
            photo,
            post: 'story'
          })
          .then(q => {
            var postDate = new Date();
            console.log(photo + "  -  story uploaded. - " + postDate.toUTCString());
            try {
              fs.unlinkSync(photo)
              storyList.shift();
              console.log(photo + "  -  story file removed. Left count: " + storyList.length);
            } catch (err) {
              console.error(err, photo);
            }
          }).
        catch(e => {
          console.log("story upload err", e);
        });

      }, 1000 * 60 * 60 * 4); // 4 saatte bir çalışacak.

    });
}, 5000);
});


