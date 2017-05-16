let ig = require('instagram-node');
const DocumentDBClient = require('documentdb').DocumentClient;

const config = {
    CollLink: 'dbs/user/colls/socials',
    Host: process.env.DocDb_Host,
    AuthKey: process.env.DocDb_AuthKey,
};

module.exports = function (context, req) {
    if (req.method === "GET") {
        // handle new subscription request
        let mode = req.query["hub.mode"];
        let challenge = req.query["hub.challenge"];
        let verify = req.query["hub.verify_token"];

        if (verify === process.env.IG_VERIFY_TOKEN) {
            // if verification matches, return challenge
            context.res.raw(challenge);
        } else {
            context.res.sendStatus(400);
        }
    } else {
        const docDbClient = new DocumentDBClient(config.Host, { masterKey: config.AuthKey });
        const query = 'SELECT TOP 1 * FROM c WHERE c.instagram[\'$id\'] = \'' + req.body[0].object_id + '\'';

        docDbClient.queryDocuments(config.CollLink, query).toArray(function (err, results) {
            if (err) {
                return context.done(err);
            }

            let userdata = results[0];
            if (!userdata || userdata == undefined) {
                context.log('Not tracking user');
                return context.done(new Error('Not tracking user'));            
            }

            if ((!userdata.instagram || userdata.instagram == undefined)) {
                context.log('No social profiles');
                return context.done(new Error('No social profiles'));
            }

            if (!userdata.id) {
                context.log('No user id');
                return context.done(new Error('No social profiles'));
            }

            // retrieve users media
            let token = userdata.instagram.token;
            let client = ig.instagram();
            client.use({ access_token: token });
            req.body.forEach(function(item) {
                client.media(item.data.media_id, function(err, media) {
                    if (err) {
                        context.log("!! ERROR: " + JSON.stringify(err, null, 4));
                        return;
                    }
                    
                    if (media.tags && media.tags.findIndex(item => "hfm" === item.toLowerCase()) > -1) {
                        // !!! HFM Found !!! //
                        context.log("!!! HFM FOUND !!! ");
                        context.log("User id: " + item.object_id);
                        context.log("Tags: " + JSON.stringify(media.tags, null, 4));
                        var data = {
                            platform: 'instagram',
                            userid: item.object_id,
                            mediaid: item.data.media_id
                        };
                        context.bindings.out = data;
                    }
                });
            }, this);

            context.res.sendStatus(200);
        });
    }
};