const DocumentDBClient = require('documentdb').DocumentClient;
const config = {
    DatabaseId: "reporting",
    CollectionId: "profile",
    Host: process.env.DocDb_Host,
    AuthKey: process.env.DocDb_AuthKey,
};

config.CollLink = 'dbs/' + config.DatabaseId + '/colls/' + config.CollectionId

module.exports = function (context, req) {
    let err = null;

    const docDbClient = new DocumentDBClient(config.Host, { masterKey: config.AuthKey });
    const query = 'SELECT * FROM c';

    docDbClient.queryDocuments(config.CollLink, query).toArray(function (err, results) {

        //let users = results[0];
        
        let data = [{
            id:'122'
            , name: 'Fake'
            , picture:'http://image'
            , datetime:'blah'
            , twitter:1
            , facebook:1
            , instagram:0
        },
        {
            id:'1123'
            , name: 'Fake'
            , picture:'http://image'
            , datetime:'blah'
            , twitter:1
            , facebook:1
            , instagram:0
        }];

        context.done(err, data);
    });
}