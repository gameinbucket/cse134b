if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service.js').then(function(registration) {
            // registration success
        }).catch(function(error) {
            console.log('service worker registration failed: ', error);
        });
    });
}

/*
 * npcFast: used for loading character cards as quickly as possible
 * npcDict: stores all static information on characters
 * npcNotes: stores user notes for each character
 * cards: list of character card elements
 */
var npcFast = [
    ['Eygon of Carim', 'eygon-of-carim.jpg', 'ds3'],
    ['Horace the Hushed', 'horace-the-hushed.jpg', 'ds3'],
    ['Sir Vilhelm', 'sir-vilhelm.jpg', 'ds3'],
    ['Solaire of Astora', 'solaire-of-astora.jpg', 'ds1'],
    ['Lonesome Galvan', 'lonesome-galvan.jpg', 'ds2'],
    ['Knight Lautrec', 'knight-lautrec.jpg', 'ds1'],
    ['Fire Keeper', 'fire-keeper.jpg', 'ds3'],
    ['Blacksmith Andre', 'blacksmith-andre.jpg', 'ds3'],
    ['Giant Blacksmith', 'giant-blacksmith.jpg', 'ds1'],
    ['Sif the Great Grey Wolf', 'sif-the-great-grey-wolf.jpg', 'ds1'],
    ['Crestfallen Saulden', 'crestfallen-saulden.jpg', 'ds2'],
    ['Emerald Herald', 'emerald-herald.jpg', 'ds2'],
    ['Siegward of Catarina', 'siegward-of-catarina.jpg', 'ds3'],
    ['Bell Keeper', 'bell-keeper.jpg', 'ds2'],
    ['Ingward', 'ingward.jpg', 'ds1'],
    ['Paladin Leeroy', 'paladin-leeroy.jpg', 'ds1'],
    ['Yoel of Londor', 'yoel-of-londor.jpg', 'ds3'],
    ['Ludleth of Courland', 'ludleth-of-courland.jpg', 'ds3'],
    ['Karla', 'karla.jpg', 'ds3'],
    ['Holy Knight Hodrick', 'holy-knight-hodrick.jpg', 'ds3'],
    ['Velka the Goddess of Sin', 'velka-the-goddess-of-sin.jpg', 'ds3'],
];
var npcDict = [];
var npcNotes = [];
var cards = [];

// apply filtering for every key
document.getElementById('search-box').onkeyup = filter_cards;

/* display login page and then home page when user signs in
 * if we cannot connect to firebase then go straight to the home page
 * when we go to the home page then load character cards and profile picture
 */
try {
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
} catch (e) {
    var splash = document.getElementById('splash');
    var signin = document.getElementById('signin');
    var home = document.getElementById('home');
    signin.style.display = 'none';
    home.style.display = 'block';
    splash.style.display = 'none';
    list_npc();
}

function google_sign_in() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

/* create an email and password account for the user
 * if there was a problem then display the erorr in a element block
 */
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

/* sign in with email and password
 * if there was a problem then briefly display the error inside the button 
 */
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
        // sign out was successful
    }, function(error) {
        // there was an error signing out
    });
}

// filter which cards show on the home page based on game selector and search text
function filter_cards() {
    var filter = document.getElementById('search-box').value.toLowerCase();
    var game = document.getElementById('search-filter').value;
    for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var n = c.data.name;
        var g = c.data.game;
        if ((game === 'all' || g === game) && (filter === '' || n.includes(filter)))
            cards[i].style.display = 'block';
        else
            cards[i].style.display = 'none';
    }
}

function list_npc() {
    /* if we have firebase then download all the npc data
     * and place it in localStorage if available
     */
    try {
        var user = firebase.auth().currentUser;
        if (user) {
            firebase.database().ref('character-final/').once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var name = childSnapshot.key;
                    var data = childSnapshot.val();
                    npcDict[name] = data;
                    if (typeof(Storage) !== 'undefined') {
                        for (var d in data) {
                            localStorage.setItem(name + ':' + d, data[d]);
                        }
                    }
                });
            });

            firebase.database().ref('users/' + user.uid + '/').once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var name = childSnapshot.key;
                    var notes = childSnapshot.val();
                    npcNotes[name] = notes;
                    if (typeof(Storage) !== 'undefined') {
                        localStorage.setItem(name + ':notes', notes);
                    }
                });
            });
        }
    } catch (e) {

    }

    /* create all the npc cards and place them on the home page
     * load the information quickly using npcFast data
     */
    var grid = document.getElementById('home-main');
    var retrieving = document.getElementById('retrieving');
    for (var i = 0; i < npcFast.length; i++) {
        var name = npcFast[i][0];
        var image = npcFast[i][1];
        var game = npcFast[i][2];
        var characterCard = document.createElement('div');
        characterCard.data = {name:name.toLowerCase(), game:game};
        characterCard.style.backgroundImage = 'url(' + image + ')';
        characterCard.classList.add('character-card');
        var nameTag = document.createElement('div');
        nameTag.classList.add('name-tag');
        nameTag.innerHTML = name;
        characterCard.appendChild(nameTag);
        characterCard.onclick = ((i) => () => view_character(i))(i);
        grid.appendChild(characterCard);
        cards.push(characterCard);
    }
    retrieving.style.display = 'none';
}

// check local storage for npc data and display it if available
function try_local_storage_to_npc(name) {
    if (typeof(Storage) !== 'undefined' && localStorage.getItem(name + ':history') !== null) {
        npcDict[name] = {};
        npcDict[name].history = localStorage.getItem(name + ':history');
        npcDict[name].location = localStorage.getItem(name + ':location');
        npcDict[name].covenant = localStorage.getItem(name + ':covenant');
        npcDict[name].souls = localStorage.getItem(name + ':souls');
        npcDict[name].items = localStorage.getItem(name + ':items');
        npcDict[name].merchant = localStorage.getItem(name + ':merchant');
        npcDict[name].quest = localStorage.getItem(name + ':quest');
        view_character_data(name);
    }
}

// update the view character page to show the selected npc information
function view_character_data(name) {
    document.getElementById('history').innerHTML = npcDict[name].history;
    document.getElementById('location').innerHTML = npcDict[name].location;
    document.getElementById('covenant').innerHTML = npcDict[name].covenant;
    document.getElementById('souls').innerHTML = npcDict[name].souls;
    document.getElementById('items').innerHTML = npcDict[name].items;
    document.getElementById('merchant').innerHTML = npcDict[name].merchant;
    document.getElementById('quest').innerHTML = npcDict[name].quest;
}

function view_character(index) {
    var online = true;
    var user;
    var database;

    // get firebase database if we have firebase
    try {
        user = firebase.auth().currentUser;
        if (!user) return;
        database = firebase.database();
    } catch (e) {
        online = false;
    }

    var home = document.getElementById('home');
    var view = document.getElementById('view');
    var npc = document.getElementById('npc');
    var pic = document.getElementById('npc-picture');
    var notes = document.getElementById('notes');

    var name = npcFast[index][0];

    npc.innerHTML = name;
    pic.src = npcFast[index][1];

    /* if we have the data cached then display immediately
     * otherwise check local storage and re-attempt to download from database
     */
    if (npcDict[name]) {
        view_character_data(name);
    } else {
        try_local_storage_to_npc(name);

        if (online) {
            firebase.database().ref('character-final/' + name).once('value').then(function(snapshot) {
                npcDict[name] = snapshot.val();
                view_character_data(name);
            });
        }
    }

    // same as npcDict we display cached data or check local storage and ask database
    if (npcNotes[name]) {
        notes.value = npcNotes[name];
    } else {
        if (typeof(Storage) !== 'undefined' && localStorage.getItem(name + ':notes') !== null) {
            notes.value = npcNotes[name] = localStorage.getItem(name + ':notes');
        } else {
            notes.value = npcNotes[name] = '';
        }

        if (online) {
            database.ref('users/' + user.uid + '/' + name).once('value').then(function(snapshot) {
                notes.value = npcNotes[name] = snapshot.val();
            }.bind(this)).catch(function(error) {

            });
        }
    }

    // once we have all the data then move from home to view page
    home.style.display = 'none';
    view.style.display = 'block';
}

// save notes written in textarea to the cache, local storage, and firebase
function save_notes() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var npc = document.getElementById('npc').innerHTML;
    var writing = document.getElementById('notes').value;
    var button = document.getElementById('save-note-button');

    npcNotes[npc] = writing;

    if (typeof(Storage) !== 'undefined') {
        localStorage.setItem(name + ':notes', writing);
    }

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

// delete cache, local storage, and database of all user written notes
function clear_notes() {
    var result = confirm('Are you sure you want to clear all of your notes?');
    if (!result)
        return;
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();

    if (typeof(Storage) !== 'undefined') {
        for (var i = 0; i < npcFast.length; i++) {
            localStorage.removeItem(npcFast[i][0] + ':notes');
        }
    }

    npcNotes = [];
    database.ref('users/' + user.uid).set(null);
}

function reset_save_button() {
    var button = document.getElementById('save-note-button');
    button.innerHTML = 'save notes';
    button.classList.remove('feedback');
}

// sends an email to the user for firebase password recovery / changing
function send_recovery_email() {
    var email = document.getElementById('recovery-email');
    var res = document.getElementById('recovery-result');
    firebase.auth().sendPasswordResetEmail(email.value).then(function() {
        res.innerHTML = 'steps for password recovery have been sent to ' + email.value;
        res.style.display = 'block';
    }, function(error) {
        res.innerHTML = '' + error;
        res.style.display = 'block';
    });
}

// sends an email to the user for firebase password recovery / changing
function send_reset_email() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var email = user.email;
    var res = document.getElementById('change-password-result');
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        res.innerHTML = 'steps for changing your password have been sent to ' + email;
        res.style.display = 'block';
    }, function(error) {
        res.innerHTML = '' + error;
        res.style.display = 'block';
    });
}

/* load the user's profile picture from firebase storage
 * first we check firebase database for a special picture key
 * this avoids a 404 error when there is no picture in storage
 */
function load_profile_picture() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var img = document.getElementById('profile-pic');
    database.ref('users/' + user.uid + '/picture').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            var storage = firebase.storage();
            var storageRef = firebase.storage().ref();
            storageRef.child('users/' + user.uid + '/profile.pic').getDownloadURL().then(function(url) {
                img.src = url;
            }).catch(function(error) {
                img.src = 'default-profile.jpg';
            });
        } else {
            img.src = 'default-profile.jpg';
        }
    }.bind(this)).catch(function(error) {
        img.src = 'default-profile.jpg';
    });
}

/* uses the file API to grab a local picture
 * sends it to firebase storage
 * if the picture does not meet firebase rule requirements then it is rejected
 * we store a picture key in the database so we know that the storage contains a picture for the user
 */
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
        var database = firebase.database();
        database.ref('users/' + user.uid + '/picture').set('true').then(function() {
            load_profile_picture();
        }.bind(this)).catch(function(error) {

        });
    }.bind(this)).catch(function(error) {
        res.innerHTML = 'Upload must be an image under 1MB.';
        res.style.display = "block";
    });
}

/* deletes the picture from storage
 * also deletes the picture key from database
 * resets the user to the default profile picture
 */
function delete_picture() {
    var user = firebase.auth().currentUser;
    if (!user)
        return;
    var database = firebase.database();
    var res = document.getElementById('upload-result');

    database.ref('users/' + user.uid + '/picture').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            database.ref('users/' + user.uid + '/picture').set(null).then(function(snapshot) {
                var storage = firebase.storage();
                var storageRef = firebase.storage().ref();
                var picRef = storageRef.child('users/' + user.uid + '/profile.pic');
                picRef.delete().then(function() {
                    res.innerHTML = 'Profile picture deleted.';
                    res.style.display = "block";
                    var img = document.getElementById('profile-pic');
                    img.src = 'default-profile.jpg';
                }).catch(function(error) {
                    res.innerHTML = '' + error.message;
                    res.style.display = "block";
                });
            }.bind(this)).catch(function(error) {
                res.innerHTML = '' + error.message;
                res.style.display = "block";
            });
        } else {
            res.innerHTML = 'There is no profile picture.';
            res.style.display = "block";
        }
    }.bind(this)).catch(function(error) {

    });
}

// using selector onchange event for options
function home_options() {
    var option = document.getElementById('home-dropdown');
    if (option.value === 'settings') settings();
    else if (option.value === 'logout') sign_out();
    option.value = 'options';
}

/*
 * the below functions are for changing between specific pages
 */
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