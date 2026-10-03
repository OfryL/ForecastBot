const os = require('os');
const https = require('https');
const consts = require('../../utils/consts');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} Bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

const fetchWanIp = () => new Promise((resolve, reject) => {
  const req = https.get('https://api.ipify.org', { timeout: 5000 }, (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => resolve(body.trim()));
  });
  req.on('timeout', () => req.destroy(new Error('timeout')));
  req.on('error', reject);
});

const formatDuration = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const opHelp = (ctx) => ctx.reply([
  'Available admin cmds:',
  `/${consts.subscriberListCmd}`,
  `/${consts.subscriberMulticastCmd} <text>`,
  `/${consts.sendForecastNowCmd}`,
  `/${consts.getDbFileCmd}`,
  `/${consts.getOsInfoCmd}`,
  `/${consts.getUptimeCmd}`,
  `/${consts.getWanIpCmd}`,
  `/${consts.getIpCmd}`,
].join('\n'));

const getOsInfo = (ctx) => ctx.reply([
  `platform: ${os.platform()} (${os.arch()})`,
  `hostname: ${os.hostname()}`,
  `node: ${process.version}`,
  `free mem: ${formatBytes(os.freemem())} / ${formatBytes(os.totalmem())}`,
  `process rss: ${formatBytes(process.memoryUsage().rss)}`,
].join('\n'));

const getUptime = (ctx) => ctx.reply([
  `os uptime: ${formatDuration(os.uptime())}`,
  `bot uptime: ${formatDuration(process.uptime())}`,
].join('\n'));

const getWanIp = async (ctx) => {
  try {
    await ctx.reply(await fetchWanIp());
  } catch (err) {
    await ctx.reply(`Failed to resolve WAN ip: ${err.message}`);
  }
};

const getIp = (ctx) => {
  const addresses = Object.entries(os.networkInterfaces())
    .flatMap(([name, infos]) => infos
      .filter((i) => !i.internal)
      .map((i) => `${name}: ${i.address}`));
  return ctx.reply(addresses.join('\n') || 'no external interfaces');
};

module.exports = {
  opHelp,
  getOsInfo,
  getUptime,
  getWanIp,
  getIp,
};
