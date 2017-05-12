// Adapted example from http://casperjs.org/
var system = require('system');
var fs = require('fs');

var fifopath = system.env.SHUB_FIFO_PATH;
var fifo = fifopath ? fs.open(fifopath, 'a+') : system.stdout;
var links;

var casper = require('casper').create({
    logLevel: "info",
    verbose: true,
    colorizerType: 'Dummy'
});

function getLinks() {
// Scrape the links from top-right nav of the website
    var links = document.querySelectorAll('ul.navigation li a');
    return Array.prototype.map.call(links, function (e) {
        return e.getAttribute('href')
    });
}

// Opens casperjs homepage
casper.start(casper.cli.options.url || 'http://casperjs.org/');

casper.then(function () {
    links = this.evaluate(getLinks);
});

casper.run(function () {
    for(var i in links) {
        fifo.write(
            JSON.stringify({"url": links[i], "date": new Date()})
        );
        fifo.write('\n');
    }
    fifo.flush();
    this.exit();
});
