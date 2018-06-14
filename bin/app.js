/**
 * Module dependencies.
 */
const express = require('express');
const path = require('path');
const fse = require('fs-extra');
const Async = require('async');
const dotenv = require('dotenv');
const logger = require('morgan');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const shell = require('shelljs');

if (fse.existsSync('.env'))
  dotenv.load({ path: '.env' });
else
  dotenv.load({ path: '.env.example' });

/**
 * Create Express server.
 */
 const app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.use(logger('production'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', { maxAge: 31557600000 }));
app.use(express.static('uploads'));

/*
 *  receive somethings....
 */

app.get('/index/:data?', function (req, res) {
  let data = req.params.data;
  data = decodeURIComponent(data)

  try{
    JSON.parse(data)
    fse.writeFile("hymnals-data/index.json", data, function(err) {
      if(err) {
          return console.log(err);
      }
      let cmd = `sh hymnals-data/hymnalupdates.sh update`
      // console.log(cmd);
      let child = shell.exec(cmd, {async:true, silent:true});
      child.stdout.on('data', function(data) {
          console.log(data)
        });
    });
    res.send('...')
  }catch(err){
    res.send(err+'.')
  }
  
})

app.get('/allhymns/:data?', function (req, res) {
  let data = req.params.data;
  data = decodeURIComponent(data)

  try{
    JSON.parse(data)
    fse.writeFile("hymnals-data/allhymns.json", data, function(err) {
      if(err) {
          return console.log(err);
      }
      let cmd = `sh hymnals-data/hymnalupdates.sh 'update allhymns'`
      // console.log(cmd);
      let child = shell.exec(cmd, {async:true, silent:true});
      child.stdout.on('data', function(data) {
          console.log(data)
        });
    });
    res.send('...')
  }catch(err){
    res.send(err+'.')
  }
  
})

app.get('/hymnals/:hymnal/:data?', function (req, res) {
  let data = req.params.data;
  let hymnal = req.params.hymnal;
  data = decodeURIComponent(data)

  try{
    JSON.parse(data)
    if (!fse.existsSync(`hymnals-data/${hymnal}`)){
      fse.mkdirSync(`hymnals-data/${hymnal}`);
    }
    fse.writeFile(`hymnals-data/${hymnal}/index.json`, data, function(err) {
      if(err) {
          return console.log(err);
      }
      let cmd = `sh hymnals-data/hymnalupdates.sh 'update ${hymnal}'`
      // console.log(cmd);
      let child = shell.exec(cmd, {async:true, silent:true});
      child.stdout.on('data', function(data) {
          console.log(data)
        });
    });
    res.send('...')
  }catch(err){
    res.send(err+'.')
  }
  
})

/**
 * 404
 */
app.route('*')
.get( function(req, res){
  res.status(404).send('404')
  //res.render('404');
})
.post( function(req, res){
  res.status(404).send('404')
});

/**
 * Error Handler
 */
app.use(function(err, req, res, next) {
  res.status(500).send('500')
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;