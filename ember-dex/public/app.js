firebase.auth().onAuthStateChanged(function(user) {
    var splash = document.getElementById('splash');
    var signin = document.getElementById('signin');
    var home = document.getElementById('home');
    if (user) {
        signin.style.display = 'none';
        home.style.display = 'block';
        list_npc();
        load_profile_picture();
    } else {
        signin.style.display = 'block';
        home.style.display = 'none';
    }
    splash.style.display = 'none';
});

function google_sign_in() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function create_email_account() {
    var password = document.getElementById('make-password').value;
    var confirmation = document.getElementById('make-confirm-password').value;
    var result = document.getElementById('result-make-account');
    if (password !== confirmation) {
        result.innerHTML = 'Password and confirmation do not match.';
        result.style.display = 'block';
        return;
    }
    var email = document.getElementById('make-email').value;
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
        var signup = document.getElementById('signup');
        signup.style.display = 'none';
    }.bind(this)).catch(function(error) {
        result.innerHTML = '' + error.message;
        result.style.display = 'block';
    });
}

function email_sign_in() {
    var email = document.getElementById('account-email').value;
    var password = document.getElementById('account-password').value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var button = document.getElementById('email-sign-in');
        button.classList.add('feedback');
        button.innerHTML = errorMessage;
        setTimeout(reset_email_sign_in_button, 2000);
    });
}

function reset_email_sign_in_button() {
    var button = document.getElementById('email-sign-in');
    button.innerHTML = 'EMAIL SIGN IN';
    button.classList.remove('feedback');
}

function sign_out() {
    firebase.auth().signOut().then(function() {

    }, function(error) {

    });
}

var npcDict = [];
var npcNotes = [];

function list_npc() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();
    var grid = document.getElementById('home-main');
    var retrieving = document.getElementById('retrieving');

    database.ref('character/').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var name = childSnapshot.key;
            var data = childSnapshot.val();
            npcDict[name] = data;
            var characterCard = document.createElement('div');
            characterCard.style.backgroundImage = 'url("' + data.image + '")';
            characterCard.classList.add('character-card');
            var nameTag = document.createElement('div');
            nameTag.classList.add('name-tag');
            nameTag.innerHTML = name;
            characterCard.appendChild(nameTag);
            characterCard.onclick = () => view_character(name);
            grid.appendChild(characterCard); 
        });
        retrieving.style.display = 'none';
    });
}

function view_character(name) {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();

    var home = document.getElementById('home');
    var view = document.getElementById('view');
    var npc = document.getElementById('npc');
    var pic = document.getElementById('npc-picture');
    var history = document.getElementById('history');
    var location = document.getElementById('location');
    var covenant = document.getElementById('covenant');
    var souls = document.getElementById('souls');
    var items = document.getElementById('items');
    var merchant = document.getElementById('merchant');
    var quest = document.getElementById('quest');
    var notes = document.getElementById('notes');

    npc.innerHTML = name;
    pic.src = npcDict[name].image;
    history.innerHTML = npcDict[name].history;
    location.innerHTML = npcDict[name].location;
    covenant.innerHTML = npcDict[name].covenant;
    souls.innerHTML = npcDict[name].souls;
    items.innerHTML = npcDict[name].items;
    merchant.innerHTML = npcDict[name].merchant;
    quest.innerHTML = npcDict[name].quest;

    if (npcNotes[name]) {
        notes.value = npcNotes[name];
    } else {
        database.ref('users/' + user.uid + '/' + name).once('value').then(function(snapshot) {
            console.log(snapshot.key);
            console.log(snapshot.val());
            notes.value = npcNotes[name] = snapshot.val();
        }.bind(this)).catch(function(error) {

        });
    }

    home.style.display = 'none';
    view.style.display = 'block';
}

function save_notes() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();
    var npc = document.getElementById('npc').innerHTML;
    var writing = document.getElementById('notes').value;
    var button = document.getElementById('save-note-button');

    npcNotes[npc] = writing;

    database.ref('users/' + user.uid + '/' + npc).set(writing).then(function() {
        button.innerHTML = "notes saved!";
        button.classList.add('feedback');
        setTimeout(reset_save_button, 1500);
    }.bind(this)).catch(function(error) {
        button.innerHTML = "failed to save notes";
        button.classList.add('feedback');
        setTimeout(reset_save_button, 1500);
    });
}

function clear_notes() {
    var result = confirm('Are you sure you want to clear all of your notes?');
    if (!result)
        return;
    console.log('they want to delete!');
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var storage = firebase.storage();

    npcNotes = [];
    database.ref('users/' + user.uid).set(null);
}

function reset_save_button() {
    var button = document.getElementById('save-note-button');
    button.innerHTML = 'save notes';
    button.classList.remove('feedback');
}

function send_recovery_email() {
    var email = document.getElementById('recovery-email');
    var res = document.getElementById('recovery-result');
    firebase.auth().sendPasswordResetEmail(email.value).then(function() {
        res.innerHTML = 'steps for password recovery have been sent to ' + email.value;
    }, function(error) {
        res.innerHTML = '' + error;
    });
    res.style.display = 'block';
}

function load_profile_picture() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var storage = firebase.storage();
    var storageRef = firebase.storage().ref();
    var img = document.getElementById('profile-pic');
    
    storageRef.child('users/' + user.uid + '/profile.pic').getDownloadURL().then(function(url) {
        img.src = url;
    }).catch(function(error) {
        img.src = 'default-profile.jpg';
    });
}

function handle_picture(files) {
    var pic = files[0];
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var storage = firebase.storage();
    var storageRef = firebase.storage().ref();
    var picRef = storageRef.child('users/' + user.uid + '/profile.pic');
    var res = document.getElementById('upload-result');

    picRef.put(pic).then(function(snapshot) {
        res.innerHTML = 'Upload successful.';
        res.style.display = "block";
        load_profile_picture();
    }.bind(this)).catch(function(error) {
        res.innerHTML = 'Upload must be an image under 1MB.';
        res.style.display = "block";
    });
}

function delete_picture() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var storage = firebase.storage();
    var storageRef = firebase.storage().ref();
    var picRef = storageRef.child('users/' + user.uid + '/profile.pic');
    var res = document.getElementById('upload-result');

    picRef.delete().then(function() {
        res.innerHTML = 'Profile picture deleted.';
        res.style.display = "block";
        load_profile_picture();
    }).catch(function(error) {
        res.innerHTML = '' + error.message;
        res.style.display = "block";
    });
}

function view_to_home() {
    var view = document.getElementById('view');
    var home = document.getElementById('home');
    home.style.display = 'block';
    view.style.display = 'none';
}

function settings() {
    var home = document.getElementById('home');
    var options = document.getElementById('settings');
    home.style.display = 'none';
    options.style.display = 'block';
}

function settings_to_home() {
    var home = document.getElementById('home');
    var options = document.getElementById('settings');
    options.style.display = 'none';
    home.style.display = 'block';
}

function forgotten() {
    var signin = document.getElementById('signin');
    var forgot = document.getElementById('forgot');
    signin.style.display = 'none';
    forgot.style.display = 'block';
}

function forgotten_to_app() {
    var signin = document.getElementById('signin');
    var forgot = document.getElementById('forgot');
    signin.style.display = 'block';
    forgot.style.display = 'none';
}

function signup() {
    var signin = document.getElementById('signin');
    var signup = document.getElementById('signup');
    signin.style.display = 'none';
    signup.style.display = 'block';
}

function signup_to_app() {
    var signin = document.getElementById('signin');
    var signup = document.getElementById('signup');
    signin.style.display = 'block';
    signup.style.display = 'none';
}