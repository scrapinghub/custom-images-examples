package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "time"
)

type Item struct {
    Url string `json:"url"`
    Rawcontent string `json:"raw_content"`
}

type Request struct {
    Url string `json:"url"`
    Fp string `json:"fp"`
    Duration int `json:"duration"`
    Status int `json:"status"`
    Rs int `json:"rs"`
    Method string `json:"method"`
}

    
func write_to_pipe(pipe *os.File, line_type string, content string) {
    pipe.WriteString(fmt.Sprintf("%s %s\n", line_type, content))
}

func shub_log(pipe *os.File, level int, message string) {
    var line string = fmt.Sprintf("{\"level\": %d, \"message\": \"%s\"}", level, message)
    write_to_pipe(pipe, "LOG", line)
}

func check_error(e error) {
    if e != nil {
        log.Fatal(e)
    }
}


func main() {

    var start_urls = []string {
        "http://ip.jsontest.com",
        "http://date.jsontest.com",
        "http://echo.jsontest.com/key/value/one/two",
        "http://www.example.org",
    }

    // start crawler
    pipe, e := os.OpenFile(os.Getenv("SHUB_FIFO_PATH"), os.O_RDWR|os.O_APPEND, 0660)
    check_error(e)
    defer pipe.Close()
    shub_log(pipe, 20, fmt.Sprintf("Opened pipe: %s", os.Getenv("SHUB_FIFO_PATH")))

    // iterate over start urls, download them and yield items
    shub_log(pipe, 20, "Starting crawler")
    for _, url := range start_urls {
        time_start := time.Now()
        response, e := http.Get(url)
        check_error(e)
        var body []byte
        body, e = ioutil.ReadAll(response.Body)
        check_error(e)
        defer response.Body.Close()
        
        // emit request
        req := Request {
            Url: url,
            Fp: url,
            Duration: int(time.Now().Sub(time_start)/time.Millisecond),
            Status: response.StatusCode,
            Rs: len(body),
            Method: "GET",
        }
        json_response, e := json.Marshal(req)
        check_error(e)
        write_to_pipe(pipe, "REQ", string(json_response))

        // emit item
        item := Item {
            Url: url,
            Rawcontent: string(body),
        }
        json_item, e := json.Marshal(item)
        check_error(e)
        write_to_pipe(pipe, "ITM", string(json_item))
    }

    // finish crawler
    shub_log(pipe, 20, "Closing crawler")
    write_to_pipe(pipe, "FIN", "{\"outcome\": \"finished\"}")

}
