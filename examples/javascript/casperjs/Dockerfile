FROM scrapinghub/scrapinghub-image-casperjs:0.0.6

# Install scripts to run crawl on Scrapy Cloud
ADD ./scripts/* /usr/sbin/
# Make scripts executable
RUN chmod +x /usr/sbin/start-crawl /usr/sbin/shub-image-info /usr/sbin/test-crawl

WORKDIR /app
ADD ./app /app
