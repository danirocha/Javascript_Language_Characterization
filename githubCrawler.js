var request = require('request'),
    cheerio = require('cheerio'),
    Jetty = require("jetty"),
    fs = require('fs'),
    db = require('./packagesDB.js'),

    mysql = require('mysql'),
    connection, i = 5300,

    jetty = new Jetty(process.stdout),
    $, packagesNames = [],
    options = {
        host: 'localhost',
        user: 'tcc_user',
        password: 'tccstorage',
        database: 'my_db',
        acquireTimeout: 10800000
    };

function updatePackagesUrls(values) {
        connection.query('UPDATE packages SET github_url = ? WHERE name = ?', values, function(err, results, fields) {
            if (err)
                throw err;
        });
}

function extractGithubUrl(elem, packageName) {
    var githubUrls = [],
        key = 0;

    elem.each(function(index) {
        var urlAttr = elem[index].attribs.href;
        githubUrls.push(urlAttr);
    });

    for(key; key < githubUrls.length; key++)
        if (githubUrls[key].indexOf("github") !== -1)
            return [githubUrls[key], packageName];

        return [];
}

// get github url
function getGithubURLs() {
        if(i < packagesNames.length) {
            var item = packagesNames[i],
                url = "https://www.npmjs.com/package/" + item;

            request(url, function(error, response, body) {
                if (error) {
                    console.log("Error: " + error);
                }
                // Check status code (200 is HTTP OK)
                if (response.statusCode === 200) {
                    jetty.moveTo([2,0]).text("                                                                                            ")
                         .moveTo([2,0]).text("Collecting "+item+" url.. ("+(i+1)+"/"+packagesNames.length+")");
                    $ = cheerio.load(body);

                    var elem = $('.box li a'),
                        array = extractGithubUrl(elem, item);
                    if(array.length !== 0)
                        updatePackagesUrls(array);
                    i++;
                    getGithubURLs();
                }
            });
        }
        else {
            console.log("\nAll Github Urls collected and updated!");
            connection.end();
        }
}

function getPackagesNames(rows) {
    for (key in rows) {
        packagesNames.push(rows[key].name);
    }

    console.log("Collected all packages names!");
    getGithubURLs();
};

function connectGithubDB(query, options) {
    console.log("Selecting existing packages names at DB...");
    connection = mysql.createConnection(options);

    connection.connect(function(err) {
        if (err)
            console.error('error connecting: ' + err.stack);

        else
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;

                else
                    getPackagesNames(rows);
            });
    });
}

// init
function init() {
    var query = 'SELECT name FROM packages WHERE github_url IS NULL';

    connectGithubDB(query, options);
}

// init
init();
