FROM ruby:2-alpine
ENV LANG=C.UTF-8
RUN ln -sfT /app/crawler.rb /usr/local/bin/shub-image-info && \
    ln -sfT /app/crawler.rb /usr/local/bin/start-crawl

# Install bash to gain console access
RUN apk --no-cache add bash

COPY Gemfile Gemfile.lock ./
RUN apk --no-cache --virtual build-dependencies add build-base && \
    bundle install && \
    apk del build-dependencies

COPY . /app
CMD /bin/bash
