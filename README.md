# Ember-Dex
# Available at: https://ember-dex.firebaseapp.com
# Homework 4 moved to: https://ember-dex-framework.firebaseapp.com
Ember-Dex is a web application that allows users to track their favorite character from the popular Dark Souls video game series. Users can sign in to search for and view important character information, and also store personal notes.

![home page](/screenshots/home-page.png)

## Application Overview
* Frontend: HTML - vanilla CSS - vanilla JavaScript
* Backend: Firebase

## Compression
* We use https://htmlcompressor.com/compressor/ to significantly reduce the size of our HTML, CSS, and JavaScript
* For images we use [Paint.NET](http://www.getpaint.net/index.html) to convert our raw PNGs to smaller JPEG files

## HTML
We've written our app to have as few separate html files as needed. We want our app to provide the best experience possible, so we've created a single page design with everything app related inside of app.html. Our only other html file is team.html which can be navigated to from the sign-in page to view contact information. We decided to keep these separate so that our app does not need to load data unrelated to its actual use. We keep a very limited set of inline CSS in the head and leave the rest to our external style sheets. We also load the relevant JavaScript at the end of the body such that we can display the page before parsing the necessary code. For our published version we compress these to remove unneccessary bytes such as comments and white-space.

## CSS
Similar to our HTML, we've split our CSS into only app.css and team.css. Because of our single page design, we only need a single HTTP request to load all of the necessary styling information for the entire application. We also use special JavaScript functions at the bottom of our HTML to load these deferred. This improves our initial page response time.

## JavaScript
All of our external JavaScript code is split between app.js and service.js. These files hold all of the necessary  code for implementing a service worker, navigating between pages, and connecting with firebase for CRUD operations. Our service.js file is a standard service worker script that manages install, fetch, and activate requests so that we can provide a significantly better experience with cached content, as well as an offline experience in conjunction with our manifest.json file. Our app.js contains all of the code used for managing firebase interactions, navigating between  different pages within our single page framework, and using cached local storage as a fallback when the network is not available.

## File and Code Organization 
In order to keep the internals of our application as simple as possible we use a minimum number of folders and files. The github folder "ember-dex" contains all of the files used to host our application. In this folder we have a few files needed for firebase deployment and the two folders "public" and "raw". The folder "raw" contains the original code files and images before they have been compressed for production. The "public" folder is all of what we deploy, including the compressed HTML, CSS, JavaScript, JPEGS, manifest, and icons. We chose to organize our file structure in this way due to the relatively few files needed for our application. With everything located in one folder, it's straightforward to find files and make quick edits. Our code architecture follows these same principles. The application code itself uses app.html, app.css, and app.js with service.js separate due to service worker constraints. Each page of our application receives its own div tag and unique id, with users navigating between them by changing the div display from 'block' to 'none' in our JavaScript functions.  

## Navigation
* When opening our application, a splash page will appear until the minimum resources are loaded.
* Depending on if the user has not logged in yet, they will be greeted by our sign in page where they can sign in with email or google.
* If they have forgotten their password or wish to create an email account, they can navigate to separate pages to perform these actions.
* Once the user has signed in, they will automatically be sent to the home page.
* Every available character will be displayed here on the home page, and they can simply click on a potrait to be sent to the view character page to see relevant data and their personal notes corresponding to the clicked character.
* If the user wishes to change settings or log out, they can click the Options selector for these choices.

![siginin page](/screenshots/signin-page.png)

## Mobile
We have taken great care to desgin our application to be mobile friendly. For any screen under 500 pixels, we use special CSS rules to provide a better user experience.

![view character page mobile](/screenshots/view-character-page-mobile.png)

## Progressive Web Application
Using service workers, we have desgined our website to be a progressive web application

## Performance and Design
service workers, caching, single page

## Known Issues
firebase
