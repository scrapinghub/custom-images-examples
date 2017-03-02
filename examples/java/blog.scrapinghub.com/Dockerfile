FROM openjdk:8
RUN mkdir /spider
WORKDIR /spider
ADD . /spider
RUN ln -s /spider/start-crawl /usr/sbin/start-crawl
RUN ln -s /spider/list-spiders /usr/sbin/list-spiders
RUN wget -q https://jsoup.org/packages/jsoup-1.10.2.jar -O jsoup.jar
RUN wget -q http://central.maven.org/maven2/com/google/code/gson/gson/2.3.1/gson-2.3.1.jar -O gson.jar
RUN javac -cp jsoup.jar:gson.jar BlogSpider.java
