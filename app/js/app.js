window.$ = window.jQuery = require('jquery');

//const firebase = require('firebase');
const electron = require('electron').remote;
const firebase = electron.getGlobal('firebase');

let dbRef = firebase.database().ref().child('text');
