FROM php:5.6-cli
RUN mkdir -p /spider
WORKDIR /spider/
RUN ln -s /spider/start-crawl /usr/sbin/start-crawl
RUN ln -s /spider/shub-image-info /usr/sbin/shub-image-info
ADD . /spider/
