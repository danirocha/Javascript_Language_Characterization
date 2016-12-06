var request = require('request'),
    cheerio = require('cheerio'),
    Jetty = require("jetty"),
    fs = require('fs'),
    db = require('./packagesDB.js'),

    mysql = require('mysql'),
    connection,

    jetty = new Jetty(process.stdout),
    $, packagesNames = [],
    githubUrls = [],
    options = {
        host: 'localhost',
        user: 'tcc_user',
        password: 'tccstorage',
        database: 'my_db'
    };

function updatePackagesUrls(values) {
    var updateValues = values,
        inserted;

    for (key in updateValues) {
        connection.query('UPDATE packages SET github_url = ? WHERE name = ?', updateValues[key], function(err, results, fields) {
            if (err)
                throw err;
        });
    }
    connection.end();
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

// get github url
function getGithubURLs() {
    return Promise.all(packagesNames.map(function(item) {
        return new Promise(function(resolve, reject) {
            var url = "https://www.npmjs.com/package/" + item,
                matched = false;

            request(url, function(error, response, body) {
                if (error) {
                    console.log("Error: " + error);
                    reject();
                }
                // Check status code (200 is HTTP OK)
                if (response.statusCode === 200) {
                    console.log("Collecting "+item+" url..");
                    $ = cheerio.load(body);

                    var elem = $('.box li a');
                    elem.each(function(index) {
                        var urlAttr = elem[index].attribs.href;
                        if ((urlAttr.indexOf("github") !== -1) && !matched) {
                            matched = true;
                            var array = [urlAttr, item];
                            githubUrls.push(array);
                            return;
                        }
                        else {
                            return;
                        }
                    });
                    resolve();
                }
            }.bind(this));
        }.bind(this));
    }.bind(this)));
}

function getPackagesNames(rows) {
    for (key in rows)
        packagesNames.push(rows[key].name);

    getGithubURLs()
        .then(function() {
            console.log("\nAll Github Urls collected!");
            writeBatFile(githubUrls);
            updatePackagesUrls(githubUrls);
        });
};

function connectGithubDB(query, options) {
    connection = mysql.createConnection(options);

    var blau = connection.connect(function(err) {
        if (err)
            console.error('error connecting: ' + err.stack);

        else
            return connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                else {
                    getPackagesNames(rows);
                }
            });
    });
}

// init
function init() {
    var query = 'SELECT DISTINCT name FROM packages LIMIT 100';

    connectGithubDB(query, options);
}

// init
init();
