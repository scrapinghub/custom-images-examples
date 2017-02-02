FROM ruby:2-alpine
ENV LANG=C.UTF-8
RUN ln -sfT /app/crawler.rb /usr/local/bin/list-spiders && \
    ln -sfT /app/crawler.rb /usr/local/bin/start-crawl

# Install bash to gain console access
RUN apk --no-cache add bash

ENV LD_LIBRARY_PATH=/lib
RUN apk update && apk add ca-certificates wget && update-ca-certificates && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub \
        https://raw.githubusercontent.com/sgerrand/alpine-pkg-glibc/master/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.23-r3/glibc-2.23-r3.apk && \
    apk add glibc-2.23-r3.apk

COPY Gemfile Gemfile.lock ./
RUN apk --no-cache --virtual build-dependencies add build-base && \
    bundle install && \
    apk del build-dependencies

COPY . /app
