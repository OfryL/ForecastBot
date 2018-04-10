const Pageres = require('pageres');

module.exports.getScreenshot = function(url, fileName, workingDir) {
    const selectorValue = 'body > div.cover > div.cover-inner > div.pages.clear-left.clear-right > div > div.msw-fc.msw-js-forecast > div:nth-child(2) > div:nth-child(2) > div > div > div.msw-col-fluid > div > div:nth-child(2) > div > div';

    return new Promise(function (resolve, reject) {
        let options = {
            crop: true,
            filename: fileName,
            delay: 0,
            selector: selectorValue,
            userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
            + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g',
            script: __dirname + "/runOnSite.js"
        };

        console.log("getting screenshot started");
        console.time("screenshot");
        let pageres = new Pageres()
            .src(url, ['400X480'], options)
            .dest(workingDir)
            .run()
            .then(() => {
                console.timeEnd("screenshot");
                console.log('screenshot saved to ' + workingDir + '/' + fileName + '.png');
                resolve(workingDir + '/' + fileName + '.png');
            }, (err) => {
                console.log(err);
                reject(err);
            });
    });
};