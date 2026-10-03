const converter = require('node-m3u8-to-mp4');

// Captures an HLS (m3u8) live stream to an mp4 file. Requires ffmpeg on PATH.
const getLiveStream = ({ liveUrl, savePath }) => converter(liveUrl, savePath);

module.exports = getLiveStream;
