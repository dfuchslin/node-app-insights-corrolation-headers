const appInsights = require("applicationinsights");
appInsights
  .setup(process.env.APP_INSIGHTS_KEY)
  .setAutoDependencyCorrelation(true, true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(false)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

appInsights.defaultClient.context.tags[
  appInsights.defaultClient.context.keys.cloudRole
] = "NODE_SERVER";

appInsights.start();

const express = require("express");
const app = express();

const port = process.env.PORT || 9090;

app.get("/server", (_req, res) => {
  console.log(JSON.stringify(_req.headers, null, 2));
  res.status(200).send("ok");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
