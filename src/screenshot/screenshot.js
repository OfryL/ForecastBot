const moment = require('moment');
const config = require('config');
const urlToImage = require('url-to-image');
const sharp = require('sharp');
const fs = require('fs');
const util = require('util');

const log4js = require('log4js');

const logger = log4js.getLogger("screenshot");

const screenshotWidth = 360;
const screenshotHeight = 420;
const screenshotStartPos = 760;

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
    let tempFullFilePathNameExt = props.fullFilePathNameExt + '.full.png';
    urlToImage(props.url, tempFullFilePathNameExt, {width: screenshotWidth, height: screenshotHeight, verbose: false})
    .then(function() {
      logger.debug("getting screenshot done and saved to ${props.fullFilePathNameExt}");

      sharp(tempFullFilePathNameExt)
        .extract({left: 0, top: screenshotStartPos, width: screenshotWidth, height: screenshotHeight })
        .toFile(props.fullFilePathNameExt, function(err) {
          if (err) {
            logger.error('error croping screenshot: ' + err);
            reject(err);
          } else {
            resolve(props.fullFilePathNameExt);
          }
        });
    }).catch(function(err) {
        logger.error('error getting screenshot from site: ' + err);
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
