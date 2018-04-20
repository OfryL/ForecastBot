/*jshint esversion: 6 */

const moment = require('moment');
const config = require('config');
const Pageres = require('pageres');
const fs = require('fs');
const util = require('util');

const log4js = require('log4js');

const logger = log4js.getLogger("screenshot");

module.exports = function() {
  'use strict';

  const props = {};
  const selectorValue = 'body > div.cover > div.cover-inner > div.pages.clear-left.clear-right > div > div.msw-fc.msw-js-forecast > div:nth-child(2) > div:nth-child(2) > div > div > div.msw-col-fluid > div > div:nth-child(2) > div > div';

  function checkIfFileExist() {
    return new Promise(function(resolve, reject) {

      if (!fs.existsSync(props.fullFilePathNameExt)) {
        resolve(false);
      }

      const stats = fs.statSync(props.fullFilePathNameExt);

      const startDate = moment(new Date(util.inspect(stats.mtime)), 'YYYY-M-DD HH:mm:ss');
      const endDate = moment(new Date(), 'YYYY-M-DD HH:mm:ss');

      if (endDate.diff(startDate, 'days') === 0 && endDate.diff(startDate, 'hours') === 0){
        //isExist true
        resolve(true);
      } else {
        //isExist false
        resolve(false);
      }
    });
  }

  function getScreenshotFromWebPage(resolve, reject) {
    logger.debug("getting screenshot started");
    let pageres = new Pageres()
      .src(props.url, ['400X480'], props.options)
      .dest(props.workingDir)
      .run()
      .then(() => {
        logger.debug('screenshot saved to ' + props.fullFilePathNameExt);
        resolve(props.fullFilePathNameExt);
      }, (err) => {
        logger.error(err);
        reject(err);
      });
  }

  function getScreenshot(url, fileName, workingDir) {
    props.url = url;
    props.fileName = fileName;
    props.workingDir = workingDir;
    props.options = {
      crop: true,
      filename: fileName,
      delay: 0,
      selector: selectorValue,
      userAgent: config.get('Screenshots.userAgent'),
      script: __dirname + "/runOnSite.js"
    };

    props.fullFilePathNameExt = workingDir + '/' + fileName + '.png';

    return new Promise(function(resolve, reject) {
      checkIfFileExist().then((isExist) => {
        if (isExist) {
          logger.debug("screenshot exist");
          resolve(props.fullFilePathNameExt);
        } else {
          getScreenshotFromWebPage(resolve, reject);
        }
      });
    });
  }


  return {
    getScreenshot
  };

}();
