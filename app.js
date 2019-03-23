const electron = require('electron');
const firebase = require('firebase');
const path = require('path');
const url = require('url');
const {app, BrowserWindow, Menu, ipcMain} = electron;


let config = {
	apiKey: "AIzaSyCtkVQZFlk9JADadJlItXet-Mg_IobqBOs",
	authDomain: "datapack-browser.firebaseapp.com",
	databaseURL: "https://datapack-browser.firebaseio.com",
	projectId: "datapack-browser",
	storageBucket: "datapack-browser.appspot.com",
	messagingSenderId: "462983795213"
};
firebase.initializeApp(config)

global.firebase = firebase;

let mainWin;
let subWin = {};
let databaseReference = firebase.database();
let userData = {
	username: null,
	email: null
};

process.env.NODE_ENV = 'development';

app.on('ready', () => {
	createMainWindow({webPreferences:{nodeIntegration: true}}, './app/html/app.html', null);
	
	const mainMenu = Menu.buildFromTemplate(mainTemplate);
	Menu.setApplicationMenu(mainMenu);
});

function createMainWindow(properties, page, menu) {
	mainWin = new BrowserWindow(properties);
	mainWin.loadURL(url.format({
		pathname: path.join(__dirname, page),
		protocol: 'file:',
		slashes: true
	}));
	mainWin.setMenu(menu);
	mainWin.on('closed', () => {
		app.quit();
	});
}

function createWindow(name, properties, page, menu) {
	if (!subWin[name]) {
		subWin[name] = new BrowserWindow(properties);
		subWin[name].loadURL(url.format({
			pathname: path.join(__dirname, page),
			protocol: 'file:',
			slashes: true
		}));
		subWin[name].setMenu(menu == null ? menu: Menu.buildFromTemplate(menu));
		subWin[name].on('closed', () => {
			subWin[name] = null;
		});
		subWin[name].webContents.toggleDevTools();
	}
}

function initMenu(menu) {
	if (process.platform == 'darwin') {
		menu.unshift({});
	}

	if (process.env.NODE_ENV !== 'production') {
		menu.push({
			label: 'DevTools',
			submenu: [
				{
					role: 'reload'
				},
				{
					label: 'Quit',
					accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
					click() {
						app.quit();
					}
				},
				{
					label: 'Developer Windows',
					accelerator: process.platform == 'darwin' ? 'Command+Shift+I': 'Ctrl+Shift+I',
					click(item, focusedWindow) {
						focusedWindow.toggleDevTools();
					}
				}
			]
		});
	}

	return menu;
}

function updateMenu(name, menu) {

	if (name === 'main') {
		mainWin.setMenu(menu == null ? menu: Menu.buildFromTemplate(menu));
	}
	else {
		subWin[name].setMenu(menu == null ? menu: Menu.buildFromTemplate(menu));
	}
}


ipcMain.on('user:login', (e, fbData, subscription) => {
	userData.email = fbData.email;
	let usernameRef = databaseReference.ref('username/' + fbData.uid);

	usernameRef.once('value').then((snap) => {
		userData.username = snap.val();
		let newMenuTemplate = userTemplate;
		newMenuTemplate[0].label = userData.username;
		updateMenu('main', newMenuTemplate);
	});

	subWin['login'].close();
	subWin['login'] = null;
});

ipcMain.on('user:logout', (e) => {
	userData = {username: null, email: null};
	let newMenuTemplate = guestTemplate;
	updateMenu('main', newMenuTemplate);
	
	subWin['logout'].close();
	subWin['logout'] = null;
});

ipcMain.on('message', (e, m) => {
	console.log(m);
});

ipcMain.on('update:menu', (e, name, menu) => {
	updateMenu(name, menu);
});

let userTemplate = [
	{
		label: '{username}',
		submenu: [
			{
				label: 'Logout',
				click() {
					createWindow('logout', {parent: mainWin, title: 'logout', show: false, webPreferences: {nodeIntegration: true}}, './app/html/logout.html', null);
				}
			}
		]
	}
];

let guestTemplate = [
	{
		label: 'Guest',
		submenu: [
			{
				label: 'Login',
				click() {
					createWindow('login', {parent: mainWin, width: 300, height: 300, title: 'login', resizable: false, webPreferences:{nodeIntegration: true}}, './app/html/login.html', null)
				}
			},
			{
				label: 'Register',
				click() {
					createWindow('register', {parent: mainWin, width: 600, height: 600, title: 'register', resizable: false, webPreferences:{nodeIntegration: true}}, './app/html/register.html', null)
				}
			}
		]
	}
];

let mainTemplate = guestTemplate;
mainTemplate = initMenu(mainTemplate);