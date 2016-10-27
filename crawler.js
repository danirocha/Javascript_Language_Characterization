var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var search = "zzzzzzz";
var pageCount = 1;
var pageToVisit = "https://www.npmjs.com/search?q=" + search + "&page=" + pageCount;
var $, pages, packages = [];

// Get all search results into individual objects
function getAllSearchResults() {
    if (pageCount <= pages) {
        var searchResult = $('.search-results .package-details');
        searchResult.each(function() {
            var obj = {
                name: $(this).find(".name").text(),
                author: $(this).find(".author").text(),
                stars: Number($(this).find(".stars").text()),
                version: $(this).find(".version").text()
            };

            packages.push(obj);
        });
        console.log(packages);
        pageCount++;
        requestPage(getAllSearchResults);
    } else
        console.log("Last page. No results found");
}

// Get total pages number
function getPageNums() {
    var resNum = parseInt($('.centered.ruled').text(), 10);
    pages = Math.ceil(resNum / 20);
    console.log(resNum + " results found, "+pages+" page(s) to scave!");

    getAllSearchResults();
}

function requestPage(callback) {
    request(pageToVisit, function(error, response, body) {
        if (error)
            console.log("Error: " + error);
        // Check status code (200 is HTTP OK)
        if (response.statusCode === 200)
            $ = cheerio.load(body);
        callback();
    });
}

// Parse the document body to '$' var
function parseDocument() {
    console.log("searching page for '" + search + "'...");
    requestPage(getPageNums);
}

// init
parseDocument();
