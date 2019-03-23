window.$ = window.jQuery = require('jquery');
const electron = require('electron').remote;
const firebase = electron.getGlobal('firebase');
const {ipcRenderer} = require('electron');

let auth = firebase.auth();
auth.signOut();
ipcRenderer.send('user:logout');
