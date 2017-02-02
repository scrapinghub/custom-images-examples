#!/usr/bin/env ruby
require "anemone"
require "json"

if File.basename(Process::argv0) == "list-spiders"
  puts "blog"
  exit
end

begin
  outfile = File.open(ENV.fetch("SHUB_FIFO_PATH"), :mode => "w")
rescue IndexError
  outfile = STDOUT
end


BLOGPOST_LINK = /201\d\/\d\d\/\d\d\//
MORE_LINK = /page\/\d+/

Anemone.crawl("https://blog.scrapinghub.com", :verbose => true) do |anemone|
  anemone.focus_crawl do |page|
    page.links.select do |link|
      link.to_s.match(BLOGPOST_LINK) || link.to_s.match(MORE_LINK)
    end
  end

  anemone.on_pages_like(BLOGPOST_LINK) do |page|
    title = page.doc.css("h1.entry-title").text
    outfile.write JSON.generate({:title => title})
    outfile.write "\n"
  end
end
