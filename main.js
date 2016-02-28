'use strict';

const electron = require('electron');
const http = require('http');

/**
 * Module to control application life.
 */
const app = electron.app;

/**
 * Inter-process communication module.
 *
 * @type {*}
 */
const ipc = electron.ipcMain;

/**
 * A custom menu bar for the application.
 */
const Menu = electron.Menu;

/**
 * Module to create native browser window.
 */
const BrowserWindow = electron.BrowserWindow;

/**
 * Keep a global reference of the window object.
 *
 * If you don't, the window will be closed automatically when the JavaScript object is
 * garbage collected.
 *
 * @type {null | electron.BrowserWindow}
 */
var mainWindow = null;

/**
 * Configuration for application.
 *
 * @type {*}
 */
var configuration = require('./configuration');

/**
 * Generate default options for the http request.
 *
 * @returns {{protocol: string, hostname: *, port: *}}
 */
function etcdHttpOptions() {
    return {
        protocol: configuration.readSettings('etcdHttps') ? 'https:' : 'http:',
        hostname: configuration.readSettings('etcdHostname'),
        port: configuration.readSettings('etcdPort')
    };
}

/**
 * Get value for etcd key by path.
 *
 * @param keyPath
 * @param callback Callback to fire with the data from response once it is complete.
 * @returns {http.ClientRequest}
 */
function etcdGetKey(keyPath, callback) {
    var dataRecv = [];
    var httpOptions = etcdHttpOptions();

    httpOptions.method = 'GET';

    if (typeof(keyPath) == 'undefined' || !keyPath) {
        httpOptions.path = configuration.readSettings('etcdKeysPath');
    }
    else {
        if (keyPath.indexOf('/') == 0) {
            httpOptions.path = configuration.readSettings('etcdKeysPath') + keyPath;
        }
        else {
            httpOptions.path = configuration.readSettings('etcdKeysPath') + '/' + keyPath;
        }
    }

    var req = http.request(httpOptions, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(`headers: ${res.headers}`);
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
            //console.log(`BODY: ${chunk}`);
            dataRecv.push(chunk);
        });

        res.on('end', () => {
            console.log('No more data in response.');
            callback(dataRecv.join(''));
        })
    });

    req.on('error', (e) => {
        console.log(`Got error: ${e.message}`);
    });

    req.end();

    return req
}

app.on('ready', () => {
    mainWindow = new BrowserWindow({title: 'Caldwell etcd Manager', width: 800, height: 600});

    if (!configuration.readSettings('etcdHostname')) {
        configuration.saveSettings('etcdHostname', 'localhost');
    }

    if (!configuration.readSettings('etcdPort')) {
        configuration.saveSettings('etcdPort', 2379);
    }

    if (!configuration.readSettings('etcdHttps')) {
        configuration.saveSettings('etcdHttps', false);
    }

    if (!configuration.readSettings('etcdKeysPath')) {
        configuration.saveSettings('etcdKeysPath', '/v2/keys');
    }

    app.dock.bounce();
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function () {
        var etcdConnectionUrl = (configuration.readSettings('etcdHttps') ? 'https:' : 'http:') + '//' +
            configuration.readSettings('etcdHostname') + ':' + configuration.readSettings('etcdPort') +
            configuration.readSettings('etcdKeysPath');

        mainWindow.webContents.send('set-etcd-connection-url', etcdConnectionUrl);

        // Retrieve root key from etcd.
        etcdGetKey(null, (data) => {
            mainWindow.webContents.send('set-etcd-raw-content', data);
        });
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 * Keep a global reference to the about dialog.
 *
 * @type {null | electron.BrowserWindow}
 */
var aboutDialog = null;

ipc.on('open-about-dialog', () => {
    if (aboutDialog) {
        return;
    }

    aboutDialog = new BrowserWindow({
        toolbar: false,
        resizable: false,
        show: true,
        height: 200,
        width: 500
    });

    aboutDialog.loadURL('file://' + __dirname + '/app/about.html');

    aboutDialog.on('closed', function () {
        aboutDialog = null;
    });
});
