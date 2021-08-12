const appInsights = require("applicationinsights");
appInsights
  .setup(process.env.APP_INSIGHTS_KEY)
  .setAutoDependencyCorrelation(true, true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(false)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

appInsights.defaultClient.context.tags[
  appInsights.defaultClient.context.keys.cloudRole
] = "NODE_CLIENT";

appInsights.start();

const express = require("express");
const app = express();
const axios = require("axios").default;
const schedule = require("node-schedule");

const port = process.env.PORT || 6060;
const serverUrl = process.env.SERVER_URL || "http://localhost:9090";

const callServer = async function (source) {
  const client = axios.create({
    baseURL: serverUrl,
    headers: {
      Source: source,
    },
  });
  const response = await client.get("/server");
  return response.data;
};

app.get("/client", async (_req, res) => {
  console.log(JSON.stringify(_req.headers, null, 2));
  let response = await callServer("on-demand");
  res.status(200).send(response.data);
});

app.listen(port, async () => {
  console.log(`Client is running on port: ${port}`);
  await callServer("on-startup");

  setTimeout(async () => {
    await callServer("on-startup-delayed");
  }, 1000);
});

schedule.scheduleJob("*/1 * * * *", async (event) => {
  console.log("schedule call to /server");
  await callServer("scheduled");
});

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
