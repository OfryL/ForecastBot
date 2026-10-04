const fs = require('fs');
const path = require('path');
const Datastore = require('@seald-io/nedb');
const { dbDirPath } = require('../utils/consts');

const stores = new Map();

/**
 * Open (once) a persistent nedb datastore under lib/db.
 * The maintained @seald-io/nedb fork exposes promise-based *Async methods
 * and reads the same on-disk format as the original nedb.
 */
const openStore = (fileName) => {
  if (!stores.has(fileName)) {
    fs.mkdirSync(dbDirPath, { recursive: true });
    const db = new Datastore({ filename: path.join(dbDirPath, fileName), autoload: true });
    stores.set(fileName, db);
  }
  return stores.get(fileName);
};

module.exports = { openStore };
