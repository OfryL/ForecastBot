const Screenshot = require('./src/screenshot/screenshot');

Screenshot.getScreenshot('https://magicseaweed.com/Hilton-Surf-Report/3658/', 'forcast', __dirname).then(
    (path) => {
        console.log(path);
    }, (err) => {
        console.log(err)
    });
