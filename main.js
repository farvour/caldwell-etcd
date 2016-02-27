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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
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

    var httpOptions = {
        protocol: configuration.readSettings('etcdHttps') ? 'https:' : 'http:',
        hostname: configuration.readSettings('etcdHostname'),
        port: configuration.readSettings('etcdPort'),
        path: configuration.readSettings('etcdKeysPath'),
        method: 'GET'
    };

    var req = http.request(httpOptions, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(`headers: ${res.headers}`);
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });

        res.on('end', () => {
            console.log('No more data in response.')
        })
    });

    req.on('error', (e) => {
        console.log(`Got error: ${e.message}`);
    });

    req.end();

    app.dock.bounce();

    // Load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows in an array if your app
        // supports multi windows, this is the time when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function () {
        var etcdConnectionUrl = (configuration.readSettings('etcdHttps') ? 'https:' : 'http:') + '//' +
            configuration.readSettings('etcdHostname') + ':' + configuration.readSettings('etcdPort') +
            configuration.readSettings('etcdKeysPath');

        mainWindow.webContents.send('set-etcd-connection-url', etcdConnectionUrl);
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar to stay active until the user
    // quits explicitly with Cmd + Q.
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the dock icon is clicked and there
    // are no other windows open.
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

ipc.on('open-about-dialog', function () {
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
