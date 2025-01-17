const express = require("express");
const { urlShortener, getUrl } = require("../controllers/url.controller");

const router = express.Router();

router.post("/short-url", urlShortener);

router.get("/:shortId", getUrl);

module.exports = router;
