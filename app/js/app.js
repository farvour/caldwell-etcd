'use strict';

/**
 * Main process remoting capability module.
 *
 * @type {*}
 */
const remote = require('remote');

/**
 * Inter-process communication module.
 *
 * @type {*}
 */
const ipc = require('electron').ipcRenderer;

/**
 *
 * @type {{about: App.about, cd: App.cd, setPath: App.setPath}}
 */
var App = {
    /**
     * Show the "about" window.
     */
    about: () => {
        ipc.send('open-about-dialog');
    },

    /**
     * Change key directory for side-bar links.
     *
     * @param anchor
     */
    cd: (anchor) => {
        anchor = $(anchor);

        $('#left-nav li').removeClass('active');
        $('#left-nav i').removeClass('icon-white');

        anchor.closest('li').addClass('active');
        anchor.find('i').addClass('icon-white');

        this.setPath(anchor.attr('new-key-path'));
    },

    /**
     * Set path for the key explorer.
     *
     * @param path
     */
    setPath: (path) => {
        this['address-bar'].set(path);
    }
};

ipc.on('set-etcd-connection-url', (e, url) => {
    $('#etcd-connection-url').text(url);
});

ipc.on('set-etcd-raw-content', (e, text) => {
    $('#etcd-raw-content').text(text);
});

$(document).ready(() => {
    console.log("Main window DOM is ready!");

    //var folder = new folder_view.Folder($('#right-content-value'));
    //var addressBar = new address_bar.AddressBar($('#address-bar'));

    //folder.open(process.cwd());
    //addressBar.set(process.cwd());

    //App.folder = folder;
    //App.addressBar = addressBar;

    //folder.on('navigate', function (dir, mime) {
    //    if (mime.type == 'folder') {
    //        addressBar.enter(mime);
    //    } else {
    //        shell.openItem(mime.path);
    //    }
    //});

    //addressBar.on('navigate', function (dir) {
    //    folder.open(dir);
    //});

    // Side-bar entries.
    //$('[nw-path]').bind('click', function (event) {
    //    event.preventDefault();
    //    App.cd(this);
    //});
});
