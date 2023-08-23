/**
 * This is the settings file for Node-RED to debug the nodes.
 */

const path = require('path');
const fs = require('fs');

const baseSettings = require(path.join(__dirname, 'node_modules/node-red/settings.js'));

let extraSettings = {};

if (fs.existsSync(path.join(__dirname, '.node-red-settings.js'))) {
    extraSettings = require(path.join(__dirname, '.node-red-settings.js'));
}

module.exports = {
    ...baseSettings,
    ...extraSettings,
    /** By default, all user data is stored in a directory called `.node-red` under
     * the user's home directory. To use a different location, the following
     * property can be used
     */
    userDir: path.join(__dirname, '.debug'),

    /** Node-RED scans the `nodes` directory in the userDir to find local node files.
     * The following property can be used to specify an additional directory to scan.
     */
    nodesDir: path.join(__dirname, 'dist')
};
