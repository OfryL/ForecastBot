const path = require('path');
const moment = require('moment');
const config = require('config');
const phantom = require('phantom');
const fs = require('fs');
const util = require('util');

const logger = require('../../logger/telegramLogger')('app_screenshot');
const phantomLogger = require('../../logger/telegramLogger')('phantom');

phantomLogger.level = 'warn';

const screenshotWidth = 360;
const screenshotHeight = 420;
// const screenshotStartPos = 760;

module.exports = (function () {
  const props = {};

  /* eslint-disable */
  const getElementFromDom = function() {
    var forecastDiv = document.querySelector('.msw-fc-current');
    forecastDiv.innerHTML = '<header class="clearfix"><h3 class="forecast-sub-title forecast-sub-title-fluidfixed nomargin-top"><div class="forecast-sub-title-fluid"><span class="visible-xs heavy">Current Conditions</span></div></h3></header>'
      + forecastDiv.innerHTML;
    var parentNode = forecastDiv.parentNode;
    crditDiv = parentNode.querySelector('.msw-tide-vertical .nomargin-bottom');
    crditDiv.innerHTML = crditDiv.innerHTML
      + '<p class="nomargin-bottom"><small><strong>brought by @IsraelSurfBot</strong> Source: ' + document.URL.replace('https:\/\/','') + '</small></p>';
    return parentNode.getBoundingClientRect();
  };
  /* eslint-enable */

  async function checkIfFileExist() {
    if (!fs.existsSync(props.forecastFilePathNameExt)) {
      return false; // isExist = false
    }

    const stats = fs.statSync(props.forecastFilePathNameExt);

    const startDate = moment(new Date(util.inspect(stats.mtime)), 'YYYY-M-DD HH:mm:ss');
    const endDate = moment(new Date(), 'YYYY-M-DD HH:mm:ss');

    if (endDate.diff(startDate, 'days') === 0 && endDate.diff(startDate, 'hours') === 0) {
      return true; // isExist = true
    }
    return false; // isExist = false - file is too old
  }

  async function getScreenshotFromWebPage() {
    logger.debug('getting screenshot started');
    const start = new Date();
    const instance = await phantom.create([], {
      logger: phantomLogger,
    });
    const page = await instance.createPage();

    const status = await page.open(props.url);

    const title = await page.property('title');
    logger.debug(`phantomjs - page opened (${status}): ${title}`);

    logger.debug(`phantomjs - render to ${props.fullForecastFilePathNameExt}`);
    await page.render(props.fullForecastFilePathNameExt);
    await page.property('viewportSize', { width: screenshotWidth, height: screenshotHeight });
    const clipRect = await page.evaluate(getElementFromDom);
    await page.property('clipRect', {
      top: clipRect.top,
      left: clipRect.left,
      width: clipRect.width,
      height: clipRect.height,
    });

    logger.debug(`phantomjs - render to ${props.forecastFilePathNameExt}`);
    await page.render(props.forecastFilePathNameExt);

    await instance.exit();

    const end = new Date() - start;
    logger.debug('phantomjs - took %dms', end);

    return props.forecastFilePathNameExt;
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
    };

    props.forecastFilePathNameExt = path.join(workingDir, `${fileName}.png`);
    props.fullForecastFilePathNameExt = path.join(workingDir, `${fileName}.full.png`);

    const isExist = await checkIfFileExist();
    if (isExist) {
      logger.debug('screenshot exist');
    } else {
      await getScreenshotFromWebPage();
    }
    return props.forecastFilePathNameExt;
  }

  return {
    getScreenshot,
  };
}());
