// Adapted example from http://casperjs.org/
var system = require('system');
var fs = require('fs');
var fifopath = system.env.SHUB_FIFO_PATH;
var fifo = fifopath ? fs.open(fifopath, 'a+') : system.stdout;
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
};

// Opens casperjs homepage
var links;

casper.start('http://casperjs.org/');

casper.then(function () {
    links = this.evaluate(getLinks);
});

casper.run(function () {
    var payload;
    for(var i in links) {
      payload = JSON.stringify({"url": links[i], "date": new Date()})
      fifo.write(payload);
      fifo.write('\n');
    }
    fifo.flush();
    this.exit();
});
