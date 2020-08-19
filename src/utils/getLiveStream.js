const converter = require('node-m3u8-to-mp4');

const test2 = async ({ liveUrl, savePath }) => converter(
  liveUrl,
  savePath,
  // (status, index, total) => {
  //   if (status === 'generating') {
  // console.log('extracting...');
  // } else if (status === 'downloading') {
  // console.log(
  //   `downloading process:${((index / total) * 100).toFixed(2)}%`,
  // );
  // } else if (status === 'combining') {
  // console.log(
  //   `combining mp4 process:${((index / total) * 100).toFixed(2)}%`,
  // );
  // } else {
  // console.log(status);
  // }
  // },
);

module.exports = test2;
