var fs = require('fs'),
    db = require('./packagesDB.js'),

    mysql = require('mysql'),
    connection,

    options = {
        host: 'localhost',
        user: 'tcc_user',
        password: 'tccstorage',
        database: 'my_db'
    };

function writeBatFile(gitCloneArray) {
    var batFile = 'mkdir .\\dist && cd .\\dist\n';

    for (var key in gitCloneArray) {
        var i = 0,
            dist = '.\\'+key;
        batFile += 'mkdir '+dist+' && cd '+dist+'\n';
        for(i; i< gitCloneArray[key].length; i++) {
            var aux = gitCloneArray[key][i].split("//");
            batFile += 'git clone ' + aux[0] + "//username:password@" + aux[1] + '.git\n';
        }
        batFile += 'cd ..\\\n';
    }

    batFile += 'EXIT \n';

    fs.writeFile('gitClone.bat', batFile, function(err) {
        if (err) throw err;
        console.log('\nfile gitClone.bat written and saved!');
    });
}

function getPackagesUrls(rows) {
    var packagesUrls = {};

    for (var key in rows) {
        var id = rows[key].ID%1000;
        if(packagesUrls[id] === undefined)
            packagesUrls[id] = [];

        packagesUrls[id].push(rows[key].github_url);
    }

    console.log("Collected all packages urls!");
    // console.log(packagesUrls);
    writeBatFile(packagesUrls);
};

function connectGithubDB(query, options) {
    console.log("Selecting existing packages urls to clone...");
    connection = mysql.createConnection(options);

    connection.connect(function(err) {
        if (err)
            console.error('error connecting: ' + err.stack);

        else
            connection.query(query, function(err, rows, fields) {
                connection.end();

                if (err) throw err;

                else
                    getPackagesUrls(rows);
            });
    });
}

// init
function init() {
    var query = 'SELECT * FROM packages WHERE github_url IS NOT NULL';

    connectGithubDB(query, options);
}

// init
init();
