const Instagram = require('instagram-web-api')
const {
  username,
  password
} = {
  username: 'sweatinterior',
  password: 'ene$1334.*-.'
}
const fs = require('fs');
const path = require('path');

const client = new Instagram({
  username,
  password
})
var feedDir = __dirname + '/feed/';
var storyDir = __dirname + '/story/';
var photoList = [];
var storyList = [];

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

var captionList = [
  '  #homedecor ', '  #interiordesign ', '  #home ', '  #interior ', '  #decor ', '  #design ', '  #homedesign ', '  #homesweethome ', '  #handmade ', '  #art ', '  #decoration ', '  #furniture ', '  #interiors ', '  #architecture ', '  #homedecoration ', '  #vintage ', '  #interiordesigner ', '  #love ', '  #interiordecor ', '  #homestyle ', '  #livingroom ', '  #interiorstyling ', '  #diy ', '  #dekorasirumah ', '  #luxury ', '  #inspiration ', '  #walldecor ', '  #shabbychic ', '  #instahome ',
  ' #decoration ', '  #decor ', '  #homedecor ', '  #interiordesign ', '  #design ', '  #interior ', '  #home ', '  #art ', '  #deco ', '  #handmade ', '  #architecture ', '  #homedesign ', '  #furniture ', '  #inspiration ', '  #homesweethome ', '  #interiors ', '  #love ', '  #d ', '  #wedding ', '  #decorationinterieur ', '  #vintage ', '  #o ', '  #designer ', '  #luxury ', '  #style ', '  #flowers ', '  #instagood ', '  #homedecoration ', '  #decoracion '
];

setTimeout(() => {

  client
    .login()
    .then(() => {
      var loggedDate = new Date();
      console.log("Logged in! - " + loggedDate.toUTCString());

      //Upload feed
      setInterval(() => {
        if(photoList.length==0)
          {
            console.log("all photos uploaded.");
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

      }, 1000 * 60 * 20); // 20 dakikada bir çalışacak.


      //Upload story
      setInterval(() => {
        if(storyList.length==0)
        {
          console.log("all stories uploaded.");
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

      }, 1000 * 60 * 60); // 60 dakikada bir çalışacak.

    });
}, (2000));
