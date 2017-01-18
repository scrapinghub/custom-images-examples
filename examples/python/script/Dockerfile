FROM python:3
RUN mkdir -p /spider
WORKDIR /spider/
RUN ln -s /spider/start-crawl /usr/sbin/start-crawl
RUN ln -s /spider/list-spiders /usr/sbin/list-spiders
ADD . /spider/
