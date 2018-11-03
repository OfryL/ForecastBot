const moment = require('moment');
const config = require('config');
const phantom = require('phantom');
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

  const getElementFromDom = function() {
      var forcastDiv = document.querySelector('.msw-fc-current');
      forcastDiv.innerHTML = '<header class="clearfix"><h3 class="forecast-sub-title forecast-sub-title-fluidfixed nomargin-top"><div class="forecast-sub-title-fluid"><span class="visible-xs heavy">Current Conditions</span></div></h3></header>' 
          + forcastDiv.innerHTML;
      var parentNode = forcastDiv.parentNode;
      crditDiv = parentNode.querySelector('.msw-tide-vertical .nomargin-bottom');
      crditDiv.innerHTML = crditDiv.innerHTML
        + '<p class="nomargin-bottom"><small><strong>brought by @IsraelSurfBot</strong> Source: ' + document.URL.replace('https:\/\/','') + '</small></p>';
      return parentNode.getBoundingClientRect();
  };


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

  async function getScreenshotFromWebPage() {
    logger.debug("getting screenshot started");
    const start = new Date();
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open(props.url);

    const title = await page.property('title');
    logger.debug("phantomjs - page opened (" + status + "): " + title);

    await page.property('viewportSize', { width: screenshotWidth, height: screenshotHeight });
    const clipRect = await page.evaluate(getElementFromDom);
    await page.property('clipRect', {
      top:    clipRect.top,
      left:   clipRect.left,
      width:  clipRect.width,
      height: clipRect.height
    });

    logger.debug("phantomjs - start page render");
    await page.render(props.fullFilePathNameExt);

    await instance.exit();

    const end = new Date() - start;
    logger.debug("phantomjs - took %dms", end);

    return props.fullFilePathNameExt;
  }

  async function getScreenshot(url, fileName, workingDir) {
    props.url = url;
    props.fileName = fileName;
    props.workingDir = workingDir;
    props.options = {
      crop: true,
      filename: fileName,
      delay: 0,
      userAgent: config.get('Screenshots.userAgent'),
      script: __dirname + "/runOnSite.js"
    };

    props.fullFilePathNameExt = workingDir + '/' + fileName + '.png';

    let isExist = await checkIfFileExist();
    if (isExist) {
      logger.debug("screenshot exist");
    } else {
      await getScreenshotFromWebPage();
    }
    return props.fullFilePathNameExt;
  }

  return {
    getScreenshot
  };

}();
