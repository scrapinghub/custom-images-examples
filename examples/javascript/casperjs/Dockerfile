FROM scrapinghub/scrapinghub-image-casperjs:0.0.4

# Install scripts to run crawl on Scrapy Cloud
ADD ./scripts/* /usr/sbin/
# Make scripts executable
RUN chmod +x /usr/sbin/start-crawl /usr/sbin/list-spiders /usr/sbin/test-crawl

WORKDIR /app
ADD ./app /app
