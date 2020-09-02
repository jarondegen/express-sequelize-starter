const express = require('express')
const tweetsRouter = express.Router();

tweetsRouter.get("/", (req, res) => {
    res.json({ message: "Test tweets index"});
  });

  module.exports = tweetsRouter;
