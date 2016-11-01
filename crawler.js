var request = require('request');
var cheerio = require('cheerio');
var Jetty = require("jetty");
var fs = require('fs');
// var URL = require('url-parse');

var jetty = new Jetty(process.stdout);
var search = "a";
var pageCount = 1;
var pageToVisit = "https://www.npmjs.com/search?q=" + search + "&page=";
var $, totalResults, totalPages, packages;

// function getJSONData() {
//   var allData;
//
//   fs.readFile('./data.json', function(err, data) {
//       if (err)
//           throw err;
//       allData = JSON.parse(data.toString());
//       // return allData;
//   });
//
//   return allData === undefined? []:allData;
// }

// Get all search results into individual objects
function getAllSearchResults() {
    var percent = parseFloat((pageCount/totalPages)*100).toFixed(2);
    jetty.moveTo([4,0]);
    jetty.text("page "+pageCount+": "+percent+"% read");

    if (pageCount <= totalPages) {
        fs.readFile('./data.json', function(err, data) {
            if (err)
                throw err;
            packages = JSON.parse(data.toString());

            jetty.text(" ("+packages.length+"/"+totalResults+")");
            var searchResult = $('.search-results .package-details');
            searchResult.each(function(index) {
                var obj = {
                    name: $(this).find(".name").text(),
                    author: $(this).find(".author").text(),
                    stars: Number($(this).find(".stars").text()),
                    version: $(this).find(".version").text()
                };
                if(packages.indexOf(obj) === -1)
                  packages.push(obj);
            });
            // console.log(packages, packages.length);
            // jetty.text(" ("+packages.length+"/"+totalResults+")");
            fs.writeFileSync('./data.json', JSON.stringify(packages), 'utf-8');
            pageCount++;
            requestPage(pageToVisit, getAllSearchResults);
        });
    }
    else
        console.log("\nDone! all results for '"+search+"' were captured.\n ");
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
}

// init
init();
