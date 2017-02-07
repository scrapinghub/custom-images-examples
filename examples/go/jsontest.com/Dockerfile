FROM golang:1.6
RUN mkdir -p /spider
ADD . /spider/
WORKDIR /spider/
RUN go build /spider/shub-go-crawler.go
RUN ln -s /spider/start-crawl /usr/sbin/start-crawl
RUN ln -s /spider/list-spiders /usr/sbin/list-spiders
