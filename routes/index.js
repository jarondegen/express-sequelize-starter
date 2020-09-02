const express = require('express')
const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
    res.json({ message: "Test index route" });
  });

  module.exports = indexRouter;
