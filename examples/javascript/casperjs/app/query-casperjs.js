// Adapted example from http://casperjs.org/
var system = require('system');
var fs = require('fs');

var fifopath = system.env.SHUB_FIFO_PATH;
var fifo = fifopath ? fs.open(fifopath, 'a+') : system.stdout;

function writeCmd(command, payload) {
  fifo.write(command);
  fifo.write(' ');
  fifo.write(JSON.stringify(payload));
  fifo.write('\n');
}

var casper = require('casper').create({
    logLevel: "info"
});

casper.on('log', function(log) {
    var levels = {"debug": 10, "info": 20, "warning": 30, "error": 40};
    writeCmd('LOG', {
        "time": Date.now(),
        "message": log.message,
        "level": levels[log.level]
    });
});

casper.on('page.resource.received', function(response) {
    writeCmd('REQ', {
        duration: 0,    // this is wrong obviously
        status: response.status,
        rs: this.getPageContent().length,
        url: response.url,
        method: 'GET'
    });
});

casper.on('exit', function(status) {
    writeCmd("FIN", {outcome: "finished"});
    fifo.flush();
});

function getLinks() {
// Scrape the links from top-right nav of the website
    var links = document.querySelectorAll('ul.navigation li a');
    return Array.prototype.map.call(links, function (e) {
        return e.getAttribute('href')
    });
}

// Opens casperjs homepage
var links;

casper.start(casper.cli.options.url || 'http://casperjs.org/');

casper.then(function () {
    links = this.evaluate(getLinks);
});

casper.run(function () {
    for(var i in links) {
      writeCmd("ITM", {"url": links[i], "date": new Date()})
    }
    this.exit();
});
