const Instagram = require('instagram-web-api')
const userData = require('./CONFIG.json')

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


    const client = new Instagram({
        username,
        password
    })

    var captionList = userData[answer].captionList;

    var userList = userData[answer].followUserList;

    client.login().then(() => {
        var loggedDate = new Date();
        console.log("Logged in! - " + loggedDate.toUTCString());

        // hashtag gain
        var hashtagInterval = setInterval(() => {
            var randomNumber = Math.floor(Math.random() * captionList.length);
            var hashtag = captionList[randomNumber].replace('#', '');

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

                    if (item.node.id % 3 === 0) {
                        willLikeIds.push(item.node.id);
                    }

                    if (item.node.id % 7 === 0) {
                        willCommentIds.push(item.node.id);
                    }

                    if (item.node.edge_liked_by.count > 30) {
                        shortcodes.push({
                            shortcode: item.node.shortcode,
                            type: 1
                        });
                    }

                    if (item.node.edge_media_to_comment.count > 15) {
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
                                first: 30
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
                                first: 30
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

                setTimeout(() => {
                    var likeInterval = setInterval(() => {
                        if (willLikeIds.length == 0) {
                            console.log("all liked");
                            clearInterval(likeInterval);
                            return;
                        }

                        like(willLikeIds[0]);
                        willLikeIds.shift();
                        console.log("left like count: ", willLikeIds.length);
                    }, 1000 * 60 * 2);

                    var commentInternal = setInterval(() => {
                        if (willCommentIds.length == 0) {
                            console.log("all commented");
                            clearInterval(commentInternal);
                            return;
                        }

                        comment(mediaId = willCommentIds[0], text = 'awesome, follow us to get more inspiration photos about #' + hashtag + ' photos');
                        willCommentIds.shift();
                        console.log("left comment count: ", willCommentIds.length);
                    }, 1000 * 60 * 5);

                    var followInternal = setInterval(() => {
                        if (willFollowIds.length == 0) {
                            console.log("all followed");
                            clearInterval(followInternal);
                            return;
                        }

                        follow(willFollowIds[0]);

                        willFollowIds.shift();
                        console.log("left follow count", willFollowIds.length);
                    }, 1000 * 60 * 5);
                }, 20 * 1000);

            }).catch(c => {
                console.log("err", c);
                return;
            });
        }, 1000 * 60 * 60 * 3);

        //unfollow
        var unfollowInterval = setInterval(() => {
            client.getUserByUsername({
                username: 'sweatinterior'
            }).then(res => {
                var myId = res.id;

                console.log("Unfollow Started For - " + new Date().toUTCString());
                var unfollowIdList = [];

                var end_cursor;

                var getFollowings = setInterval(() => {
                    client.getFollowings({
                        userId: myId,
                        first: 50,
                        after: end_cursor
                    }).then(c => {
                        end_cursor = c.page_info.end_cursor;

                        c.data.forEach(node => {
                            unfollowIdList.push(node.id);
                        });

                        if (end_cursor == null || end_cursor == undefined) {
                            clearInterval(getFollowings);
                            return;
                        }
                    }).catch(er => {
                        console.log("er when get media likes %j:", er);
                    });
                }, 3000);

                // wait 30 minutes for loading data.
                setTimeout(() => {
                    totalFollowedCount = unfollowIdList.length;
                    // unfollow every 60 seconds.
                    var unfollowInterval = setInterval(() => {
                        if (unfollowIdList.length == 0) {
                            console.log("all unfollowed");
                            clearInterval(unfollowInterval);
                            return;
                        }

                        unfollow(unfollowIdList[0]);
                        unfollowIdList.shift();
                        console.log("left unfollow count: ", unfollowIdList.length);
                    }, 1000 * 60);
                }, 60 * 1000);
            }).catch(e => {
                console.log("getUser err", e);
            });
        }, 1000 * 60 * 60 * 48); // every day

        var totalFollowedCount = 0;
        // gain by user
        var gainByUserInterval = setInterval(() => {
            if (totalFollowedCount > 300) {
                console.log("you followed more than 300 people to day");
                totalFollowedCount = 0;
                return 1;
            }
            var refUserFollowIds = [];
            var randomNumber = Math.floor(Math.random() * userList.length);
            var userName = userList[randomNumber];
            console.log("ref user ", userName);
            client.getUserByUsername({
                username: userName
            }).then(res => {
                var lastShortCode = res.edge_owner_to_timeline_media.edges[0].node.shortcode;
                var end_cursor;

                var getMediaFollowrs = setInterval(() => {
                    if (refUserFollowIds.length > 300) {
                        clearInterval(getMediaFollowrs);
                        return;
                    }

                    console.log("resUserFollowIds length: ", refUserFollowIds.length);

                    client.getMediaLikes({
                        shortcode: lastShortCode,
                        first: 50,
                        after: end_cursor
                    }).then(c => {
                        c.edges.forEach(node => {
                            refUserFollowIds.push(node.node.id);
                        });

                        end_cursor = c.page_info.end_cursor;
                        if (end_cursor == null || end_cursor == undefined) {
                            clearInterval(getMediaFollowrs);
                            return;
                        }
                    }).catch(er => {
                        console.log("er when get media likes %j:", er);
                    });

                }, 3000);

                setTimeout(() => {
                    console.log("follow count", refUserFollowIds.length);
                    totalFollowedCount = refUserFollowIds.length;
                    // follow every 120 seconds.
                    setInterval(() => {
                        if (refUserFollowIds.length == 0) {
                            console.log("all followed");
                            return 1;
                        }

                        follow(refUserFollowIds[0]);
                        refUserFollowIds.shift();
                        console.log("left refUserFollow : ", refUserFollowIds.length);
                    }, 1000 * 60 * 5);
                }, 60 * 1000);
            }).catch(e => {
                console.log("err" + e);
            })
        }, 1000 * 60 * 60 * 24);
    });

    function like(mediaId, callback) {

        client.like({
            mediaId: mediaId
        }).then(c => {
            console.log("success like", c);
        }).catch(e => {
            console.log("error when like", e.error.feedback_message);
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
                console.log("comment err", er.error.feedback_message);
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
            console.log("error when follow:", e.error.feedback_message);
        });
    }

    function unfollow(userId) {

        client.unfollow({
            userId: userId
        }).then(c => {
            console.log("success unfollow", c);
        }).catch(e => {
            console.log("error when unfollow", e.error.feedback_message);
        });
    }

});