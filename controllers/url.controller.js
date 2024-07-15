const shortid = require("shortid");
const Urls = require("../models/url.model");
exports.urlShortener = (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Please provide a valid url" });
    }
    const shortUrl = shortid.generate();
    Urls.create({ originalUrl: url, shortUrl })
      .then((data) => {
        res
          .status(200)
          .json({ message: "Url created successfully", data: data });
      })
      .catch((err) => {
        res.status(500).json({ message: "Something went wrong", err: err });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.getUrl = (req, res) => {
  try {
    const { shortId } = req.params;
    if (!shortId) {
      return res
        .status(400)
        .json({ message: "Please provide a valid shortId" });
    }
    Urls.findOne({ shortUrl: shortId })
      .then((data) => {
        if (!data) {
          return res
            .status(404)
            .json({ message: "No url found with this shortId" });
        }
        res.redirect(data.originalUrl);
      })
      .catch((err) => {
        res.status(500).json({ message: "Something went wrong", err: err });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};
