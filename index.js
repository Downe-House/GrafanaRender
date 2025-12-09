const express = require("express");
const fetch = require("node-fetch"); // If using Node 18+ you can remove this and use global fetch

const app = express();

app.get("/grafana/panel", async (req, res) => {
  const { uid, panel } = req.query;

  if (!uid || !panel) {
    return res.status(400).send("Missing uid or panel");
  }

  const grafanaUrl = `https://YOURSTACK.grafana.net/render/d-solo/${uid}/${panel}?width=1500&height=800`;

  try {
    const response = await fetch(grafanaUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GRAFANA_API_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch panel from Grafana");
    }

    if (req.query.debug) {
  const text = await response.text();
  console.log("GRAFANA RESP >>>", text);
  return res.send(text);
}

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set("Content-Type", "image/png");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Grafana proxy error:", error);
    res.status(500).send("Internal server error");
  }
});

// For local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

module.exports = app;
