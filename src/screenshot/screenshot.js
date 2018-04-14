/*jshint esversion: 6 */

const config = require('config');
const Pageres = require('pageres');

const log4js = require('log4js');

const logger = log4js.getLogger("screenshot");

module.exports.getScreenshot = function(url, fileName, workingDir) {
    const selectorValue = 'body > div.cover > div.cover-inner > div.pages.clear-left.clear-right > div > div.msw-fc.msw-js-forecast > div:nth-child(2) > div:nth-child(2) > div > div > div.msw-col-fluid > div > div:nth-child(2) > div > div';

    return new Promise(function (resolve, reject) {
        let options = {
            crop: true,
            filename: fileName,
            delay: 0,
            selector: selectorValue,
            userAgent: config.get('Screenshots.userAgent'),
            script: __dirname + "/runOnSite.js"
        };

        logger.debug("getting screenshot started");
        let pageres = new Pageres()
            .src(url, ['400X480'], options)
            .dest(workingDir)
            .run()
            .then(() => {
                logger.debug('screenshot saved to ' + workingDir + '/' + fileName + '.png');
                resolve(workingDir + '/' + fileName + '.png');
            }, (err) => {
                logger.error(err);
                reject(err);
            });
    });
};
