'use strict';

const express = require('express');
const butter = require('buttercms')('b60a008584313ed21803780bc9208557b3b49fbb');

var app = express()

app.set('view engine', 'jade');

// Routes
app.get('/', renderHome)
app.get('/p/:page', renderHome)
app.get('/category/:slug', renderCategory)
app.get('/author/:slug', renderAuthor)
app.get('/rss', renderRss)
app.get('/atom', renderAtom)
app.get('/sitemap', renderSitemap)
// Make sure this route is last
app.get('/:slug', renderPost)

app.listen(3000)

function renderHome(req, res) {
  var page = req.params.page || 1;

  butter.post.list({page_size: 10, page: page}).then(function(resp) {
    res.render('index', {
      title: 'Blog Homepage',
      posts: resp.data.data,
      next_page: resp.data.meta.next_page,
      previous_page: resp.data.meta.previous_page
    })
  })
}

function renderPost(req, res) {
  var slug = req.params.slug;

  butter.post.retrieve(slug).then(function(resp) {
    res.render('post', {
      title: resp.data.data.title,
      post: resp.data.data
    })
  })
}

function renderAuthor(req, res) {
  var slug = req.params.slug;

  butter.author.retrieve(slug, {include: 'recent_posts'}).
    then(function(resp) {
      res.render('author', {
        title: `${resp.data.data.first_name} ${resp.data.data.last_name}`,
        author: resp.data.data
      })
    })
}

function renderCategory(req, res) {
  var slug = req.params.slug;

  butter.category.retrieve(slug, {include: 'recent_posts'})
    .then(function(resp) {
      res.render('category', {
        title: resp.data.data.name,
        category: resp.data.data
      })
    })
}

function renderAtom(req, res) {
  res.set('Content-Type', 'text/xml');

  butter.feed.retrieve('atom').then(function(resp) {
    res.send(resp.data.data)
  })
}

function renderRss(req, res) {
  res.set('Content-Type', 'text/xml');

  butter.feed.retrieve('rss').then(function(resp) {
    res.send(resp.data.data)
  })
}

function renderSitemap(req, res) {
  res.set('Content-Type', 'text/xml');

  butter.feed.retrieve('sitemap').then(function(resp) {
    res.send(resp.data.data)
  })
}
