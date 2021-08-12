package com.flysas;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.Map;

@SpringBootApplication
@RestController
@EnableScheduling
public class JavaClientApplication {

    private static final Logger logger = LoggerFactory.getLogger(JavaClientApplication.class);
    private final RestTemplate restTemplate;
    private final String serverUrl;

    public static void main(String[] args) {
        SpringApplication.run(JavaClientApplication.class, args);
    }

    public JavaClientApplication(@Value("${server.url}") String serverUrl) {
        this.restTemplate = new RestTemplate();
        this.serverUrl = serverUrl;
    }

    private String getServerResponse(String source) {
        String url = serverUrl + "/server";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Source", source);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        logger.info(String.format("Calling %s for source %s", url, source));
        return restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();
    }

    @GetMapping("/client")
    @ResponseBody
    public String client(@RequestHeader Map<String, String> headers) {
        logger.info(String.format("Request to /client with headers %s", headers));
        return getServerResponse("on-demand");
    }

    @PostConstruct
    public void callServerOnStartup() {
        getServerResponse("startup");
    }

    @Scheduled(fixedRate = 60000)
    public void callServerAtScheduledIntervals() {
        getServerResponse("scheduled");
    }

}
