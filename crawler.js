var request = require('request');
var cheerio = require('cheerio');
var Jetty = require("jetty");
var fs = require('fs');
var db = require('./packagesDB.js');

var jetty = new Jetty(process.stdout);
var search = "a";
var pageCount = 1;
var pageToVisit = "https://www.npmjs.com/search?q=" + search + "&page=";
var $, $github, totalResults, totalPages, packages,
    options = {
              host     : 'localhost',
              user     : 'tcc_user',
              password : 'tccstorage',
              database : 'my_db'
            };

function getPackagesInfos() {
    var array = [
        $(this).find(".name").text(), // name
        $(this).find(".author").text(), // author
        Number($(this).find(".stars").text()), // stars
        $(this).find(".version").text(), // version
        $(this).find(".description").text(), // description
        $(this).find(".keywords").text().replace(/\s/g,'') // tags
    ];

    // get github url
    var url = "https://www.npmjs.com/package/"+array[0];
    var matched = false;

    request(url, function(error, response, body) {
        if (error)
            console.log("Error: " + error);
        // Check status code (200 is HTTP OK)
        if (response.statusCode === 200)
            $github = cheerio.load(body);

        var elem = $github('.box li a');
        elem.each(function(index) {
            var urlAttr = elem[index].attribs.href;
            if ((urlAttr.indexOf("github") !== -1) && !matched) {
                matched = true;
                array.push(urlAttr);
                packages.push(array);
                // db.addPackage(array);
            }
        });
    });
}

// Get all search results into individual objects
function getAllSearchResults() {
    var percent = parseFloat((pageCount/totalPages)*100).toFixed(2);
    jetty.moveTo([4,0]);
    jetty.text("page "+pageCount+": "+percent+"% read");

    if (pageCount <= 40) {
        packages = [];
        var searchResult = $('.search-results .package-details');
        searchResult.each(getPackagesInfos);
    }
    else {
        db.closeDB();
        console.log("\nDone! all results for '"+search+"' were captured.\n ");
    }
}

// Get total pages number
function getPageNums() {
    totalResults = parseInt($('.centered.ruled').text(), 10);
    totalPages = Math.ceil(totalResults / 20);
    console.log(totalResults + " results found, "+totalPages+" page(s) to scave!\n ");

    getAllSearchResults();
}

// Make page request and parse the document body to '$' var
function requestPage(pageURL, callback) {
    request(pageURL+pageCount, function(error, response, body) {
        if (error)
            console.log("Error: " + error);
        // Check status code (200 is HTTP OK)
        if (response.statusCode === 200)
            $ = cheerio.load(body);
        callback();
    });
}

// init
function init() {
    console.log("\nsearching page for '" + search + "'...\n ");
    requestPage(pageToVisit, getPageNums);
    db.connectDB(options);
}

// init
init();
