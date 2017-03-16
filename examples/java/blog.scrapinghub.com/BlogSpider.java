import com.google.gson.JsonObject;
import org.jsoup.Connection.Response;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


class FifoWriter {
    private BufferedWriter writer;

    public FifoWriter(String fifoPath) {
        Path shubFifo = Paths.get(fifoPath);
        try {
            writer = Files.newBufferedWriter(shubFifo);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void write(String data) {
        try {
            writer.write(data);
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}


public class BlogSpider {
    private FifoWriter writer;

    public BlogSpider() {
        String shubFifoPath = System.getenv("SHUB_FIFO_PATH");

        if (shubFifoPath != null) {
            writer = new FifoWriter(shubFifoPath);
        }
    }

    public void writeToFifo(String prefix, String payload) {
        String msg = String.format("%s %s\n", prefix, payload);

        if (writer != null) {
            writer.write(msg);
        } else {
            System.out.println();
        }
    }

    public String kumoRequestControlMessage(Response response, long time) {
        JsonObject reqMsg = new JsonObject();

        reqMsg.addProperty("time", time);
        reqMsg.addProperty("url", response.url().toString());
        reqMsg.addProperty("method", response.method().toString());
        reqMsg.addProperty("status", response.statusCode());
        reqMsg.addProperty("rs", response.body().length());
        reqMsg.addProperty("duration", 0);

        return reqMsg.toString();
    }

    public Document makeRequest(String url) {
        System.out.println(String.format("Fetching %s", url));
        try {
            long time = System.currentTimeMillis();

            Response response = Jsoup.connect(url).execute();
            writeToFifo("REQ", kumoRequestControlMessage(response, time));

            return response.parse();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void scrape(String url) {

        while (!url.isEmpty()) {
            Document doc = makeRequest(url);

            for (Element title: doc.select("h2.entry-title")) {
                JsonObject it = new JsonObject();
                it.addProperty("title", title.text());
                it.addProperty("url", title.select("a").attr("href"));
                writeToFifo("ITM", it.toString());
            }
            url = doc.select("div.prev-post > a").attr("href");
        }
    }

    public void finish() {
        JsonObject obj = new JsonObject();
        obj.addProperty("outcome", "finished");
        writeToFifo("FIN", obj.toString());
    }


    public static void main(String[] args) {
        BlogSpider spider = new BlogSpider();
        spider.scrape("http://blog.scrapinghub.com");
        spider.finish();
    }
}
