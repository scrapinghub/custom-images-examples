<?php


class Spider {

    public $pipe;
    public $start_urls = Array(
        'http://httpbin.org/get?key=value',
        'http://httpbin.org/ip',
        'http://httpbin.org/cookies',
    );

    function __construct() {
        $this -> pipe = fopen($_ENV['SHUB_FIFO_PATH'], 'r+');
        $this -> log(20, 'SHUB_FIFO_PATH: ' . $_ENV['SHUB_FIFO_PATH']);
    }

    private function write_to_pipe($type, $dict) {
        fwrite($this -> pipe, $type . ' ' . json_encode($dict) . PHP_EOL);
        fflush($this -> pipe);
    }

    public function log($level, $message) {
        $this -> write_to_pipe('LOG', Array('level' => $level, 'message' => $message));
    }

    private function download($url) {
        $start_time = microtime(true);
        $content = file_get_contents($url);
        $request = Array(
            'url' => $url,
            'fp' => hash('md5', $url),
            'duration' => intval((microtime(true) - $start_time) * 1000),
            'status' => 200,
            'rs' => strlen($content),
            'method' => 'GET',
        );
        $this -> write_to_pipe('REQ', $request);
        return $content;
    }

    private function parse($response, $url) {
        $item = Array(
            'url' => $url,
            'content' => json_decode($response),
        );
        $this -> write_to_pipe('ITM', $item);
        return $item;
    }

    public function start_crawl() {
        $this -> log(20, 'Starting crawler');
        foreach ($this -> start_urls as $url)
            $this -> parse($this -> download($url), $url);
    }

    public function finish_crawl() {
        $this -> log(20, 'Closing crawler');
        $this -> write_to_pipe('FIN', Array('outcome' => 'finished'));
        fclose($this -> pipe);
    }

}


$spider = new Spider();
$spider -> start_crawl();
$spider -> finish_crawl();

?>
