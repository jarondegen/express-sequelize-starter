const express = require('express')
const tweetsRouter = express.Router();
const db = require('../db/models');
const { Tweet } = db;
const asyncHandler = (handler) => (req,res,next) => handler(req,res,next).catch(next)
const { check, validationResult} = require('express-validator');

const tweetNotFoundError = (tweetId) => {
  const err = new Error('The requested resource couldn\'t be found.');
  err.title = 'Tweet not found.';
  err.status = 404;
  err.errors = ['Tweet not found.']
  return err
}

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map((error) => error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    return next(err);
  }
  next();
};

// tweetsRouter.get("/", (req, res) => {
//     res.json({ message: "Test tweets index"});
//   });

tweetsRouter.get('/', asyncHandler(async (req,res,next)=> {
  const tweets = await Tweet.findAll({
    order: ["updatedAt"],
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
  const newTweet = await Tweet.create(req.body)
  res.json({newTweet})
}))

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
