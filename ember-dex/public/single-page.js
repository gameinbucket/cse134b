firebase.auth().onAuthStateChanged(function(user) {
    var splash = document.getElementById('splash');
    var signin = document.getElementById('signin');
    var home = document.getElementById('home');
    if (user) {
        signin.style.display = 'none';
        home.style.display = 'block';
        list_characters();
    } else {
        signin.style.display = 'block';
        home.style.display = 'none';
    }
    splash.style.display = 'none';
});

function google_sign_in() {
    console.log('signing in with google');
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function create_email_account() {
    console.log('creating email account');
    var email = document.getElementById('account-email').value;
    var password = document.getElementById('account-password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('email account error ' + errorCode + ' ' + errorMessage);
    });
}

function email_sign_in() {
    console.log('signing in with email');
    var email = document.getElementById('account-email').value;
    var password = document.getElementById('account-password').value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('email sign in error ' + errorCode + ' ' + errorMessage);
    });
}

function sign_out() {
    firebase.auth().signOut().then(function() {
        console.log('sign out successful');
    }, function(error) {
        console.log('sign out error');
    });
}

function save_note() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();
    var viewCharacter = 'Solaire of Astora';
    var noteVal = document.getElementById('notes').value;

    database.ref('users/' + user.uid + '/' + viewCharacter).set({
        note: noteVal
    }).then(function() {

    }.bind(this)).catch(function(error) {
        console.error(error);
    });
}

function list_characters() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();
    var grid = document.getElementById('grid');
    var retrieving = document.getElementById('retrieving');

    database.ref('character/').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var name = childSnapshot.key;
            var data = childSnapshot.val();
            var characterCard = document.createElement('div');
            characterCard.style.width = '200px';
            characterCard.style.height = '200px';
            characterCard.style.margin = '5px';
            characterCard.style.float = 'left';
            characterCard.style.overflow = 'hidden';
            characterCard.style.color = 'red';
            characterCard.style.backgroundImage = 'url("' + data.image + '")';
            characterCard.innerHTML = data.history;
            grid.appendChild(characterCard); 
        });
        retrieving.style.display = 'none';
    });
}