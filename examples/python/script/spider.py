#!/usr/bin/env python3
import json
import logging
import os
import time

logger = logging.getLogger('pipe-spider')

N = 10000


def get_timestamp():
    return int(time.time() * 1000)


class PipeWriter(object):

    def __init__(self, path):
        self.path = path
        self.pipe = open(path, 'w')

    def write(self, command, obj):
        self.pipe.write(command)
        self.pipe.write(' ')
        self.pipe.write(json.dumps(obj))
        self.pipe.write('\n')
        self.pipe.flush()

    def close(self):
        self.pipe.close()


class Spider(object):

    def __init__(self, writer):
        self.writer = writer

    def produce_item(self, it):
        self.writer.write('ITM', it)

    def produce_request(self, url, method, status, rs, duration):
        # https://doc.scrapinghub.com/api/requests.html#request-object
        request = dict(
            url=url,
            method=method,
            status=status,
            rs=rs,
            duration=duration,
            time=get_timestamp()
        )
        self.writer.write('REQ', request)

    def set_outcome(self, reason):
        self.writer.write('FIN', {'outcome': reason})


class CustomLoggingHandler(logging.Handler):

    def __init__(self, *args, **kwargs):
        writer = kwargs.pop('writer')
        super(CustomLoggingHandler, self).__init__(*args, **kwargs)
        self.writer = writer

    def emit(self, record):
        # https://doc.scrapinghub.com/api/logs.html#log-object
        log = dict(
            level=record.levelno,
            message=self.format(record),
            time=get_timestamp()
        )
        self.writer.write('LOG', log)


def setup_logging(writer):
    handler = CustomLoggingHandler(writer=writer)
    logging.basicConfig(level=logging.DEBUG, handlers=[handler])


def get_job_data():
    return json.loads(os.environ['SHUB_JOB_DATA'])


def main():
    start = time.time()
    job_data = get_job_data()
    spider_args = job_data.get('spider_args', {})
    pipe_path = os.environ['SHUB_FIFO_PATH']
    writer = PipeWriter(pipe_path)
    setup_logging(writer)
    spider = Spider(writer)
    logger.debug('Job data %s', job_data)
    for i in range(N):
        k = i % (N / 100)
        if k == 0:
            logger.info('%d log.info', i)
        else:
            logger.debug('%d log.debug', i)
        spider.produce_item({
            'id': i,
            'a': 1,
            'b': ['c', 'd'],
            'e': {'f': 'g'},
        })
        spider.produce_request(
            url='http://example.com/{}'.format(i),
            method='POST',
            status=200,
            rs=100500,
            duration=100,
        )
    logger.info('Done: %0.2f s', time.time() - start)
    spider.set_outcome('finished')
    writer.close()


if __name__ == '__main__':
    main()

