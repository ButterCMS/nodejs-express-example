'use strict';

const express = require('express');
const butter = require('buttercms')('e389441bfb10ccd3228e5adb47ccb98a8183eca7');
const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs');

// Routes
app.get('/', renderHome)
app.get('/blog', renderBlogHome)
app.get('/blog/:slug', renderPost)

app.get('/category/:slug', renderCategory)
app.get('/author/:slug', renderAuthor)

app.get('/rss', renderRss)
app.get('/atom', renderAtom)
app.get('/sitemap', renderSitemap)

// Location Pages in Butter
app.get('/locations/:slug', renderPage)

// Start server
app.listen(process.env.PORT || 3000)


function renderPage(req, res) {
  var slug = req.params.slug || 1;

  butter.content.retrieve(['location_pages[slug='+slug+']']).then(function(resp) {
    var content = resp.data.data;

    // location_pages is a collection so we access the first and only item
    var location = content.location_pages[0];

    res.render('location', {
      location: location
    })
  });
}

function renderHome(req, res) {

  // Display list of location pages on our homepage.
  butter.content.retrieve(['location_pages']).then(function(resp) {
    var content = resp.data.data;
    var location_pages = content.location_pages;

    butter.post.list({page_size: 4, page: 1}).then(function(postResp) {
      var posts = postResp.data.data;
      
      res.render('index', {
        locations: location_pages,
        posts: posts
      })
    });
  });
}

function renderBlogHome(req, res) {
  var page = req.params.page || 1;

  butter.post.list({page_size: 10, page: page}).then(function(resp) {
    res.render('bloghome', {
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
      post: resp.data.data,
      published: new Date(resp.data.data.published)
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
