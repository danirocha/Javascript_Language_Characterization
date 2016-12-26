var request = require('request'),
    cheerio = require('cheerio'),
    Jetty = require("jetty"),
    fs = require('fs'),
    db = require('./packagesDB.js'),

    mysql = require('mysql'),
    connection, i = 0,

    jetty = new Jetty(process.stdout),
    $, packagesNames = [],
    // githubUrls = [],
    options = {
        host: 'localhost',
        user: 'tcc_user',
        password: 'tccstorage',
        database: 'my_db',
        acquireTimeout: 10800000
    };

function updatePackagesUrls(values) {
    // var updateValues = values;

    // for (key in updateValues) {
        connection.query('UPDATE packages SET github_url = ? WHERE name = ?', values, function(err, results, fields) {
            if (err)
                throw err;
        });
    // }
    // connection.end();
    // console.log("All packages github urls' updated!");
}

function writeBatFile(gitCloneArray) {
    var batFile = '';

    gitCloneArray.forEach(function(item) {
        batFile = batFile + 'git clone ' + item[0] + '.git\n';
    });

    batFile = batFile + 'EXIT \n';

    fs.writeFile('gitClone.bat', batFile, function(err) {
        if (err) throw err;
        console.log('\nfile gitClone.bat written and saved!');
    });
}

function extractGithubUrl(elem, packageName) {
    var matched = false;

    return elem.each(function(index) {
        var urlAttr = elem[index].attribs.href;
        // console.log(urlAttr);
        // console.log(urlAttr.indexOf("github"));
        // console.log(index+"/"+elem.length);
        if ((urlAttr.indexOf("github") !== -1) && !matched) {
            matched = true;
            // console.log("YAS!");
            var array = [urlAttr, packageName];
            // githubUrls.push(array);
            updatePackagesUrls(array);
            return;
        }
        else if(index+1 == elem.length) {
            // jetty.moveTo([4,0]).text(index+1+"/"+elem.length);
            return;
        }
    });
}

// get github url
function getGithubURLs() {
    // return Promise.all(packagesNames.map(function(item) {
        // return new Promise(function(resolve, reject) {
        if(i < packagesNames.length) {
            var item = packagesNames[i],
                url = "https://www.npmjs.com/package/" + item;

            request(url, function(error, response, body) {
                if (error) {
                    console.log("Error: " + error);
                    // reject();
                }
                // Check status code (200 is HTTP OK)
                if (response.statusCode === 200) {
                    jetty.moveTo([2,0]).text("                                                                                            ")
                         .moveTo([2,0]).text("Collecting "+item+" url.. ("+(i+1)+"/"+packagesNames.length+")");
                    $ = cheerio.load(body);

                    var elem = $('.box li a');
                    if(extractGithubUrl(elem, item)) {
                        i++;
                        getGithubURLs();
                    }
                    else
                        console.log("FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU!");
                    // resolve();
                }
            });
        }
        else {
            console.log("\nAll Github Urls collected and updated!");
            connection.end();
            // updatePackagesUrls(githubUrls);
        }
        // }.bind(this));
    // }.bind(this)));
}

function getPackagesNames(rows) {
    for (key in rows) {
        packagesNames.push(rows[key].name);
    }

    console.log("Collected all packages names!");
    getGithubURLs();
        // .then(function() {
        //     console.log("\nAll Github Urls collected!");
        //     // writeBatFile(githubUrls);
        //     updatePackagesUrls(githubUrls);
        // });
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
