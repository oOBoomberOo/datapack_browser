window.$ = window.jQuery = require('jquery');
const electron = require('electron').remote;
const firebase = electron.getGlobal('firebase');
const {ipcRenderer} = require('electron');
const validChar = '/^[0-9a-zA-Z_]+$/';

let auth = firebase.auth();
let dbRef = firebase.database().ref();


$('#register').click(() => {
	$('form').submit((e) => {
		e.preventDefault();
		const username = $('#username').val();
		const email = $('#email').val();
		const password = $('#password').val();

		if (username.match(validChar)) {
			let dataRef = dbRef.child('existing_id/' + username.toLowerCase());
			dataRef.on('value', (snap) => {
				let result = snap.val();
				if (result) {
					$('#errorBox').text('User already exists');
					$('#errorBox').removeClass('hide');
				}
				else if (false) {
					auth.createUserWithEmailAndPassword(email, password).catch(error => {
						console.log(error.code);
					});
				}
			});
		}
		else {
			$('#errorBox').html('<p>Invalid Character.</p><p>You can only use A-z, 0-9 and _.</p>');
			$('#errorBox').removeClass('hide');
		}
	});
});


let unsub = auth.onAuthStateChanged((firebaseUser) => {
	if (firebaseUser) {
		ipcRenderer.send('user:login', firebaseUser);
		unsub();
	}
});
