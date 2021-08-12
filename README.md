# Tracing problem for NodeJS Application Insight client.
When using tracing with Application Insights we've seen that it works when sending a request on demand between applications but not when sending scheduled requests (`node-schedule`), or requests on application startup.

We see that the application insights correlation headers are not being sent to the server in some cases.

These are the headers that end up the in server for the different use cases. Here we can see that the request-context headers are not complete during application startup and at scheduled intervals.

## nodejs client

### application startup requests
The nodejs client initiates a call to the server immediately upon application startup.
```
node_server_1  | {
node_server_1  |   "source": "on-startup",
node_server_1  |   "request-context": "appId=cid-v1:",
node_server_1  |   "user-agent": "axios/0.21.1",
node_server_1  | }
```

### application startup requests (delayed)
The nodejs client initiates a call to the server after a small delay after application startup.
```
node_server_1  | {
node_server_1  |   "source": "on-startup-delayed",
node_server_1  |   "request-context": "appId=cid-v1:65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "user-agent": "axios/0.21.1",
node_server_1  | }
```

### scheduled requests
The nodejs client initiates a call to the server at scheduled intervals (using `node-scheduler`)
```
node_server_1  | {
node_server_1  |   "source": "scheduled",
node_server_1  |   "request-context": "appId=cid-v1:65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "user-agent": "axios/0.21.1",
node_server_1  | }
```

### "on-demand" requests (requests initiated by an incoming request)
A request is made to the nodejs client and the client then initiates a call to the server.
```
node_server_1  | {
node_server_1  |   "source": "on-demand",
node_server_1  |   "request-context": "appId=cid-v1:65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "request-id": "|685c330fbf7b4743951f74de4435b8c0.f858ec4f993945cf.",
node_server_1  |   "x-ms-request-id": "685c330fbf7b4743951f74de4435b8c0",
node_server_1  |   "x-ms-request-root-id": "|685c330fbf7b4743951f74de4435b8c0.f858ec4f993945cf.",
node_server_1  |   "traceparent": "00-685c330fbf7b4743951f74de4435b8c0-f858ec4f993945cf-01",
node_server_1  |   "user-agent": "axios/0.21.1",
node_server_1  | }
```


## java client

Using a simple spring-boot java client having similar logic to the nodejs client, we see that headers are being sent in all cases: application startup, scheduled intervals, on-demand.

### application startup requests
The java client initiates a call to the server immediately upon application startup.
```
node_server_1  | {
node_server_1  |   "source": "startup",
node_server_1  |   "request-id": "|b1e92fb165e4d58698d344efed8bdb6b.ababd18db5a2c37f.",
node_server_1  |   "request-context": "appId=65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "traceparent": "00-b1e92fb165e4d58698d344efed8bdb6b-ababd18db5a2c37f-01",
node_server_1  |   "user-agent": "Java/11.0.12",
node_server_1  | }
```

### scheduled requests
The java client initiates a call to the server at scheduled intervals
```
node_server_1  | {
node_server_1  |   "source": "scheduled",
node_server_1  |   "request-id": "|1e7e4980443ac235da675eceefa58fd2.0fa519b17901e486.",
node_server_1  |   "request-context": "appId=65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "traceparent": "00-1e7e4980443ac235da675eceefa58fd2-0fa519b17901e486-01",
node_server_1  |   "user-agent": "Java/11.0.12",
node_server_1  | }
```

### "on-demand" requests (requests initiated by an incoming request)
A request is made to the java client and the client then initiates a call to the server.
```
node_server_1  | {
node_server_1  |   "source": "on-demand",
node_server_1  |   "request-id": "|c6a9df58736b881dfe7c91b148cd2efb.9b7e6bacf4efd642.",
node_server_1  |   "request-context": "appId=65671f72-5cc8-4676-88de-164e720bd7d0",
node_server_1  |   "traceparent": "00-c6a9df58736b881dfe7c91b148cd2efb-9b7e6bacf4efd642-01",
node_server_1  |   "user-agent": "Java/11.0.12",
node_server_1  | }
```




## How to reproduce
The server will output the request headers

1. Get a valid instrumentationKey from Azure Application Insights where you want the telemetry to end up
2. Run `APP_INSIGHTS_KEY=XXX-YYY-ZZZ docker compose up --build`
3. The nodejs and java clients will make a request on startup to the server
4. Wait a minute for the nodejs and java clients to send scheduled requests
5. Look at the console logs for node_server and note the difference in (and lack of) headers that are being sent for each type of request.
6. Wait a few minutes (why the painful delay Microsoft?) and check the graph in Application Insights. You will see that "node_client" is not connected to "node_server", however "java_client" is.
7. Run some "on-demand" requests to the nodejs client `curl http://localhost:6060/client` and after a few minutes in the app insights GUI you'll see that node_client is now connected to node_server.

## Useful links
https://www.npmjs.com/package/applicationinsights

https://www.npmjs.com/package/node-schedule

https://docs.microsoft.com/en-us/azure/azure-monitor/app/nodejs

https://docs.microsoft.com/en-us/azure/azure-monitor/app/correlation
