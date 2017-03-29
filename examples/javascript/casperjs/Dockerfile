#  Docker version 1.0.1, build 990021a

FROM ubuntu:16.04
MAINTAINER Fred Prieur <https://github.com/fprieur/docker-casperjs>

RUN apt-get update && apt-get upgrade -y
RUN apt-get install build-essential chrpath wget libssl-dev libxft-dev unzip python git -y

RUN apt-get install libfreetype6 libfreetype6-dev -y
RUN apt-get install libfontconfig1 libfontconfig1-dev -y

# Install phantomjs

ENV PHANTOMJS_VERSION 2.1.1

RUN echo https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 -P /home
RUN wget "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2" -P /home


RUN tar xvjf /home/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2
RUN mv phantomjs-$PHANTOMJS_VERSION-linux-x86_64 /usr/local/share/

RUN ln -sf /usr/local/share/phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
RUN ln -sf /usr/local/share/phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
RUN ln -sf /usr/local/share/phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/bin/phantomjs

# Install casperjs

WORKDIR /home
RUN git clone -b 1.1.4 https://github.com/casperjs/casperjs.git

RUN mv /home/casperjs /usr/local/share/casperjs-latest

RUN ln -sf /usr/local/share/casperjs-latest/bin/casperjs /usr/local/share/casperjs
RUN ln -sf /usr/local/share/casperjs-latest/bin/casperjs /usr/local/bin/casperjs
RUN ln -sf /usr/local/share/casperjs-latest/bin/casperjs /usr/bin/casperjs

RUN mkdir -p /scripts
ADD ./scripts/* /scripts/
RUN ln -s /scripts/start-crawl /usr/sbin/start-crawl
RUN ln -s /scripts/list-spiders /usr/sbin/list-spiders
RUN ln -s /scripts/test-crawl /usr/sbin/test-crawl

RUN mkdir -p /home/casperjs-files
ADD ./casperjs-files/* /home/casperjs-files/

# Default command
CMD ["/usr/bin/casperjs"]
