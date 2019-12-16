const express = require('express');
const item = require('../models/item');
const catchErrors = require('../lib/async-error');

const router = express.Router();

function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const item = await item.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('item/index', {item: item, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('item/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await item.findById(req.params.id);
  res.render('item/edit', {item: item});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await item.findById(req.params.id).populate('author');
  const answers = await Answer.find({question: question.id}).populate('author');
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await question.save();
  res.render('item/show', {question: question, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.content = req.body.content;
  question.tags = req.body.tags.split(" ").map(e => e.trim());

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/item');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/item');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var question = new Question({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/item');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/item/${req.params.id}`);
}));



module.exports = router;
