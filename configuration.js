'use strict';

/**
 * Obtain a handle to the application "configuration" file.
 */
var nconf = require('nconf').file({file: getUserHome() + '/caldwell-config.json'});

/**
 * Saves settings via nconf, to a JSON configuration file.
 *
 * @param settingKey
 * @param settingValue
 */
function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

/**
 * Loads a JSON configuration file via nconf and returns the value for the given key.
 *
 * @param settingKey
 * @returns {*}
 */
function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

/**
 * Computes what the current user's home directory is based off of platform.
 *
 * @returns string
 */
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings
};
