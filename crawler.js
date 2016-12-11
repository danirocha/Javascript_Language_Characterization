var request = require('request'),
    cheerio = require('cheerio'),
    Jetty = require("jetty"),
    fs = require('fs'),
    db = require('./packagesDB.js'),

    jetty = new Jetty(process.stdout),
    letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    search = letters[0],
    $, $github, totalResults, pageCount, pageToVisit, totalPages, packages, linePlace = 4
    options = {
              host     : 'localhost',
              user     : 'tcc_user',
              password : 'tccstorage',
              database : 'my_db'
            };


function getNextLetter() {
    var aux = letters.indexOf(search)+1;
    if(aux > letters.length-1)
        console.log("Well done soldier, All results 'a-z' were captured!");
    else {
        search = letters[aux];
        linePlace += 7;
        init(search);
    }
}

// Get all search results into individual objects
function getAllSearchResults(pageCount) {
    var percent = parseFloat((pageCount/totalPages)*100).toFixed(2);

    jetty.moveTo([linePlace,0]);
    jetty.text("page "+pageCount+": "+percent+"% read");

    packages = [];
    var searchResult = $('.search-results .package-details');
    searchResult.each(function() {
        var array = [
            $(this).find(".name").text().replace(/[\u0800-\uFFFF]/g,''), // name
            $(this).find(".author").text().replace(/[\u0800-\uFFFF]/g,''), // author
            Number($(this).find(".stars").text()), // stars
            $(this).find(".version").text().replace(/[\u0800-\uFFFF]/g,''), // version
            $(this).find(".description").text().replace(/[\u0800-\uFFFF]/g,''), // description
            $(this).find(".keywords").text().replace(/\s/g,'').replace(/[\u0800-\uFFFF]/g,'') // tags
        ];
        packages.push(array);
    });
    console.log(packages)
    //db.addPackages(packages);
}

// Get total pages number
function getPageNums() {
    totalResults = parseInt($('.centered.ruled').text(), 10);
    totalPages = Math.ceil(totalResults / 20);
    console.log(totalResults + " results found, "+totalPages+" page(s) to scave!\n ");
}

// Make page request and parse the document body to '$' var
function requestPage(pageURL, pageCount, callback) {
    return new Promise(function (resolve, reject) {
        request(pageURL+pageCount, function(error, response, body) {
            if (error) {
                console.log("Error: " + error);
                reject();
            }

            // Check status code (200 is HTTP OK)
            if (response.statusCode === 200) {
                $ = cheerio.load(body);
                callback();
                resolve();
            }
        });
    });
}

// init
function init() {
    //db.connectDB(options);

    letters
        .map(function(item) {
            pageToVisit = "https://www.npmjs.com/search?q=" + item + "&page=";
            console.log("\nsearching page for '" + item + "'...\n ");

            return requestPage(pageToVisit, null, getPageNums)
                .then(function() {
                    var pageCount = 1,
                        resultsArray = [];

                    for (pageCount; pageCount <= totalPages; pageCount++) {
                        resultsArray.push(requestPage(pageToVisit, pageCount, getAllSearchResults));
                    }

                    return Promise.all(resultsArray);
                });
        })
        .reduce(function(previous, current) {
            return previous.then(current);
        });
    console.log("Well done soldier, All results 'a-z' were captured!");

    //db.closeDB();
    //console.log("\nDone! all results for '"+search+"' were captured.\n ");
}

// init
//init();

function writeBatFile(gitCloneArray) {
    var batFile = '';

    gitCloneArray.forEach(function(item) {
        batFile = batFile + 'git clone ' + item + '.git\n';
    });

    batFile = batFile + 'EXIT \n';

    fs.writeFile('gitClone.bat', batFile, function(err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}