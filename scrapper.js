var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var pageRoot = "https://joopic.joobot.com";

var pageToVisit = "https://joopic.joobot.com/album/381573271650305034";
console.log("Visiting page " + pageToVisit);

var SEARCH_WORD = "";
// https://joopic.joobot.com/resource/objects/mid/381577049053070346/381573271650305034


var lastTime = new Date().getTime();
var dbUrl = ""
// var dbUrl = "https://api.mlab.com/api/1/databases/prudence/collections/photos?apiKey=5q2rhWYnQ5a2YX4HF89CyyrGO6f109Gk";

function addtoDatabase(imgUrl) {
    var options = {
        url: dbUrl,
        headers: { 'Content-type': "application/json" },
        json: { "url": imgUrl, "time": lastTime, }
    }
    console.log("POST sent.");

    request.post(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            console.log(error);
            console.log(response.statusCode);
            return
        }
        console.log("Added to Database");
        // console.log(body)

    });
}

var imgArray = new Array();

function scrap() {

    request(pageToVisit, function(error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);
            lastTime = new Date().getTime();

            var figures = $('figure')
            var counter = 0;
            figures.each(function(i, element) {
                var a = $(this).children()[0]
                var imgUrl = pageRoot + a.attribs.href;

                if (!imgArray.includes(imgUrl)) {
                    imgArray.push(imgUrl);
                    addtoDatabase(imgUrl);
                    counter +=1;
                }

            });
            console.log("Scrapped: " + figures.length +"; Inserted: " + counter);
        }
    });
}


function listDatabase() {
    request(dbUrl, function(error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
        body = JSON.parse(body)

        for(let i = 0;i<body.length; i++){
            imgArray.push(body[i].url)
        }
        console.log("Initialized at " + imgArray.length)
    });
}

var promise = new Promise(function(resolve, reject) {
    listDatabase()
    resolve("");
});


//For every second, scrap web
//If img not in imgArray, add to database and array
promise.then(function(result) {
    console.log(result);
    setInterval(scrap, 2000);
})