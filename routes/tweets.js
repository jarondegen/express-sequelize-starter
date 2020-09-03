const express = require('express')
const tweetsRouter = express.Router();
const db = require('../db/models');
const { Tweet, User } = db;
const { check, validationResult} = require('express-validator');
const { asyncHandler, handleValidationErrors } = require("../utils");
const { requireAuth } = require("../auth");
tweetsRouter.use(requireAuth);

const tweetNotFoundError = (tweetId) => {
  const err = new Error('The requested resource couldn\'t be found.');
  err.title = 'Tweet not found.';
  err.status = 404;
  err.errors = ['Tweet not found.']
  return err
};

tweetsRouter.get('/', asyncHandler(async (req,res,next)=> {
  const tweets = await Tweet.findAll({
    include: [{ model: User, as: "user", attributes: ["username"] }],
    order: [["createdAt", "DESC"]],
    attributes: ["message"],
  });

  res.json({tweets});
}));

tweetsRouter.get('/:id(\\d+)', asyncHandler(async (req,res,next)=> {
  const tweetId = req.params.id
  const tweet = await Tweet.findByPk(tweetId)
  const handler = tweetNotFoundError(tweetId)
  if (!tweet) {
    next(handler)
  }else{
  res.json(tweet);
  }
}));

const validator = [
  check('message')
    .exists({checkFalsy: true})
    .withMessage('tweet boi'),
  check('message')
    .isLength({max: 280})
    .withMessage('check ya length boi'),
  handleValidationErrors
]

tweetsRouter.post('/', validator, asyncHandler(async(req,res,next)=>{
  const {message} = req.body
  const newTweet = await Tweet.create({ message, userId: req.user.id });
  res.json({newTweet})
}));

tweetsRouter.put('/:id(\\d+)', validator, asyncHandler(async (req,res,next)=>{
  const tweetId = req.params.id
  const tweet = await Tweet.findByPk(tweetId)
  const handler = tweetNotFoundError(tweetId)
  if (!tweet) {
    next(handler)
  }else{
    const {message} = req.body;
    const newTweet = await tweet.update({message});
    res.json(newTweet);
  }
}));

tweetsRouter.delete('/:id(\\d+)', validator, asyncHandler(async (req,res,next)=>{
  const tweetId = req.params.id
  const tweet = await Tweet.findByPk(tweetId)
  const handler = tweetNotFoundError(tweetId)
  if (!tweet) {
    next(handler)
  }else{
    await tweet.destroy();
    res.redirect('/tweets');
  }
}));




module.exports = tweetsRouter;
