require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { shouldShowPrerenderedPage } = require("./prerender");
const { prerenderPage } = require("./prerender");

const port = process.env.PORT || 8000;
const app = express();
const targetFolder = "build_deploy";

// Handle Security HSTS, Force SSL
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Handle Security to decoded URL
app.use((req, res, next) => {
  let err = null;
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) return res.redirect("/404");

  next();

  return true;
});

// Route to handle "/"
app.get("/", async (req, res, next) => {
  if (shouldShowPrerenderedPage(req)) return prerenderPage(req, res);
  return next();
});

// Send files such as html, css, and js
app.use(express.static(path.join(__dirname, targetFolder)));

// Route to handle every routing
app.get("/*", (req, res) => {
  if (shouldShowPrerenderedPage(req)) return prerenderPage(req, res);
  return res.sendFile(path.join(__dirname, targetFolder, "index.html"));
});

app.listen(port);
console.log(`Running on PORT: ${port}`);
