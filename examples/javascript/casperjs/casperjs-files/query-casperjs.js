var casper = require('casper').create();
var links;
var fs = require('fs');
var system = require('system');
var env = system.env;

var fifop = env.SHUB_FIFO_PATH;
var fifo;
var fifoIsPipe = false;
if (typeof fifop != 'undefined') {
    fifo = fs.open(fifop, 'a+');
    fifoIsPipe = true;
} else {
    fifo = system.stdout;
}

function writeItem(stream, item) {
    var output = JSON.stringify(item);
    stream.write('ITM ' + output + '\n');
}

var logLevels = {
        "debug": 10,
        "info": 20,
        "warning": 30,
        "error": 40
    }

function writeLog(stream, log) {
    var output = JSON.stringify({
        "time": Date.now(),
        "message": log.message,
        "level": logLevels[log.level]
    });
    stream.write('LOG ' + output + '\n');
}

function writeRequest(stream, response) {
    var output = JSON.stringify(response);
    stream.write('REQ ' + output + '\n');
}

function writeFinished(stream, outcome) {
    var output = JSON.stringify({
            "outcome": outcome
        });
    stream.write('FIN ' + output + '\n');
}

casper.on('log', function(log) {
    writeLog(fifo, log);
});

casper.on('http.status.200', function(response) {
    writeRequest(fifo, {
        duration: 0,    // this is wrong obviously
        status: 200,
        rs: this.getPageContent().length,
        url: response.url,
        method: 'GET'
    });
})

function getLinks() {
    // Scrape the links from top-right nav of the website
    var links = document.querySelectorAll('ul.navigation li a');
    return Array.prototype.map.call(links, function (e) {
        return e.getAttribute('href')
    });
}

// Opens casperjs homepage
casper.start('http://casperjs.org/');

casper.then(function () {
    links = this.evaluate(getLinks);
});

casper.run(function () {

    for(var i in links) {
        var item = {"url": links[i], "date": new Date()}
        writeItem(fifo, item);
    }
    writeFinished(fifo, "finished");
    fifo.flush();
    if (fifoIsPipe) {
        fifo.close();
    }
    this.exit();
});
