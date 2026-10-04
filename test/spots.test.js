const test = require('node:test');
const assert = require('node:assert/strict');
const {
  spots, findSpot, getSpotFromCommand, getDefaultSpot,
} = require('../src/utils/spots');

test('every spot has coordinates and a report url', () => {
  Object.values(spots).forEach((spot) => {
    assert.equal(typeof spot.lat, 'number');
    assert.equal(typeof spot.lon, 'number');
    assert.match(spot.url, /^https:\/\//);
    assert.equal(spots[spot.key], spot);
  });
});

test('findSpot is case and separator insensitive', () => {
  assert.equal(findSpot('haifa'), spots.Haifa);
  assert.equal(findSpot('Tel-Aviv'), spots.TelAviv);
  assert.equal(findSpot('tel aviv'), spots.TelAviv);
  assert.equal(findSpot('nowhere'), null);
  assert.equal(findSpot(undefined), null);
});

test('getSpotFromCommand parses arguments and /spot_ commands', () => {
  assert.equal(getSpotFromCommand('/getforecast'), getDefaultSpot());
  assert.equal(getSpotFromCommand('/getforecast Haifa'), spots.Haifa);
  assert.equal(getSpotFromCommand('/getforecast@IsraelSurfBot ashdod'), spots.Ashdod);
  assert.equal(getSpotFromCommand('/spot_Ashqelon'), spots.Ashqelon);
  assert.equal(getSpotFromCommand('/spot_Ashqelon@IsraelSurfBot'), spots.Ashqelon);
  assert.equal(getSpotFromCommand('/spot_unknown'), getDefaultSpot());
  assert.equal(getSpotFromCommand(''), getDefaultSpot());
});
