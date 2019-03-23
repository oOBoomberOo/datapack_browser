window.$ = window.jQuery = require('jquery');
const electron = require('electron').remote;
const firebase = electron.getGlobal('firebase');
const {ipcRenderer} = require('electron');

let auth = firebase.auth();

$('#login').click(() => {
	$('form').submit((e) => {
		e.preventDefault();
		const email = $('#email').val();
		const password = $('#password').val();
		auth.signInWithEmailAndPassword(email, password).catch(error => {
			if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
				$('#errorBox').text('User not found or wrong password.');
				$('#errorBox').removeClass('hide');
			};
		});
	});
});


let unsub = auth.onAuthStateChanged((firebaseUser) => {
	if (firebaseUser) {
		ipcRenderer.send('user:login', firebaseUser);
	}
}).then(unsub());
