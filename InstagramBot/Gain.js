const Instagram = require('instagram-web-api')
const {
    username,
    password
} = {
    username:'sweatinterior',
    password:'ene$1334.*-.'
}

const client = new Instagram({
    username,
    password
})

var captionList = [
   '#homedecor','#interiordesign','#home','#interior','#decor','#design','#homedesign','#homesweethome','#handmade','#art','#decoration','#furniture','#interiors','#architecture','#homedecoration','#vintage','#interiordesigner','#love','#interiordecor','#homestyle','#livingroom','#interiorstyling','#diy','#dekorasirumah','#luxury','#inspiration','#walldecor','#shabbychic','#instahome',
   '#decoration','#decor','#homedecor','#interiordesign','#design','#interior','#home','#art','#deco','#handmade','#architecture','#homedesign','#furniture','#inspiration','#homesweethome','#interiors','#love','#d','#wedding','#decorationinterieur','#vintage','#o','#designer','#luxury','#style','#flowers','#instagood','#homedecoration','#decoracion'
];

var userList = [
    "thespruceofficial",
    "d.signers",
    "em_henderson",

]

client.login().then(() => {
    var loggedDate = new Date();
    console.log("Logged in! - " + loggedDate.toUTCString());


    // hashtag gain
    var hashtagInterval =  setInterval(() => {
        var randomNumber = Math.floor(Math.random() * captionList.length);
        var hashtag = captionList[randomNumber].replace('#','');

        var willFollowIds = [];
        var willLikeIds = [];
        var willCommentIds = [];
        var shortcodes = [];

        console.log("Gain Started For'" + hashtag + "' - " + new Date().toUTCString());
        // get media by hashtag
        client.getMediaFeedByHashtag({
            hashtag: hashtag
        }).then(media => {

            // fetch ids from media data
            media.edge_hashtag_to_media.edges.forEach(item => {
                willLikeIds.push(item.node.id);

                if (item.node.edge_liked_by.count > 10 || item.node.edge_media_to_comment.count > 5) {
                    willCommentIds.push(item.node.id);
                }

                if (item.node.edge_liked_by.count > 50) {
                    shortcodes.push({
                        shortcode: item.node.shortcode,
                        type: 1
                    });
                }

                if (item.node.edge_media_to_comment.count > 5) {
                    shortcodes.push({
                        shortcode: item.node.shortcode,
                        type: 2
                    });
                }
            });

            shortcodes.forEach(sc => {
                if (sc.type == 1) {
                    //get likers
                    client.getMediaLikes({
                            shortcode: sc.shortcode,
                            first:'20',
                            after:''
                        }).then(c => {
                            c.edges.forEach(node => {
                                willFollowIds.push(node.node.id)
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    //get commenters
                    client.getMediaComments({
                            shortcode: sc.shortcode,
                            first:'20'
                        })
                        .then((c) => {
                            c.edges.forEach(node => {
                                willFollowIds.push(node.node.owner.id);
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            });

            // wait 10 seconds for loading data.
            setTimeout(() => {
                // like every 30 seconds.
                var likeInterval = setInterval(() => {
                    if (willLikeIds.length == 0) {
                        console.log("all liked");
                        clearInterval(likeInterval);
                    }

                    like(willLikeIds[0]);

                    willLikeIds.shift();
                }, 30000);

                // comment every 30 seconds.
                var commentInternal = setInterval(() => {
                    if (willCommentIds.length == 0) {
                        console.log("all commented");
                        clearInterval(commentInternal);
                    }

                    comment(mediaId = willCommentIds[0], text ='awesome, follow us to get more inspiration photos about' + hashtag +' photos');
                    willCommentIds.shift();
                }, 30000);

                // follow every 30 seconds.
                var followInternal = setInterval(() => {
                    if (willFollowIds.length == 0) {
                        console.log("all followed");
                        clearInterval(followInternal);
                    }

                    follow(willFollowIds[0]);

                    willFollowIds.shift();
                }, 30000);
            }, 10000);

        }).catch(c => {
            console.log("err", c);
            clearInterval(hashtagInterval);
        });

    }, 1000 * 60 * 60); // ever hour

    //unfollow
    var unfollowInterval = setInterval(() => {
        client.getUserByUsername({
            username:'sweatinterior'
        }).then(res => {
            var myId = res.id;

            console.log("Unfollow Started For - " + new Date().toUTCString());


            client.getFollowings({
                userId: myId,
                first: 1000
            }).then(followingList => {

                var unfollowInternal = setInterval(() => {
                    if (followingList.count == 0) {
                        console.log("all unfollowed");
                        clearInterval(unfollowInternal);
                    }

                    unfollow(followingList.data[0].id);

                    followingList.data.shift();
                }, 1000 * 60);

            });

        }).catch(e => {
            console.log("getUser err", e);
            clearInterval(unfollowInterval);
        });
    }, 1000 * 60 * 60 * 24*7); // every day

    var totalFollowedCount = 0;
    // gain by user
    setInterval(() => {
        if (totalFollowedCount > 1200) {
            console.log("you followed more than 1200 people to day");
            totalFollowedCount = 0;
            return 1;
        }
        var dSignerFollowIds = [];
        var randomNumber = Math.floor(Math.random() * userList.length);
        var userName =userList[randomNumber];
        client.getUserByUsername({
            username: userName
        }).then(res => {
            var lastShortCode = res.edge_owner_to_timeline_media.edges[0].node.shortcode;
            var end_cursor;

            var getMediaFollowrs = setInterval(() => {
                if (dSignerFollowIds.length > 1200)
                    clearInterval(getMediaFollowrs);

                client.getMediaLikes({
                    shortcode: lastShortCode,
                    first: 50,
                    after: end_cursor
                }).then(c => {
                    console.log("inside while - ", dSignerFollowIds.length);
                    end_cursor = c.page_info.end_cursor;
                    if(end_cursor == null || end_cursor == undefined)
                        clearInterval(getMediaFollowrs);
                    c.edges.forEach(node => {
                        dSignerFollowIds.push(node.node.id);
                    });
                }).catch(er => {
                    console.log("er when get media likes %j:", er);
                });

            }, 3000);


            // wait 30 minutes for loading data.
            setTimeout(() => {
                console.log("follow count", dSignerFollowIds.length);
                totalFollowedCount = dSignerFollowIds.length;
                // follow every 60 seconds.
                setInterval(() => {
                    if (dSignerFollowIds.length == 0) {
                        console.log("all followed");
                        return 1;
                    }

                    follow(dSignerFollowIds[0]);

                    dSignerFollowIds.shift();
                }, 1000 * 60);
            }, 3 * 60 * 1000);
        }).catch(e => {
            console.log("err" + e);
        })
    }, 1000 * 60 * 60 * 12); // twice every day.
});

function like(mediaId, callback) {

    client.like({
        mediaId: mediaId
    }).then(c => {
        console.log("success like", c);
    }).catch(e => {
        console.log("error when like", e);
    });

    if (typeof callback == "function")
        callback();
}

function comment(mediaId, text, callback) {

    client.addComment({
            mediaId: mediaId,
            text: text
        })
        .then(res => {
            console.log("successfully commented");
        }).catch(er => {
            console.log("comment err", er);
        });

    if (typeof callback == "function")
        callback();
}

function follow(userId) {
    client.follow({
        userId: userId
    }).then(c => {
        console.log("success follow");
    }).catch(e => {
        console.log("error when follow %j:", e);
    });
}

function unfollow(userId, callback) {

    client.unfollow({
        userId: userId
    }).then(c => {
        console.log("success follow", c);
    }).catch(e => {
        console.log("error when follow", e);
    });
    if (typeof callback == "function")
        callback();
}
