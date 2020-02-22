const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyCuE0RbmYb9vBCdQ4Oqtx5J7FdJ6XE8yM4',
    authDomain: "survapp-37bfa.firebaseapp.com",
    projectId: "survapp-37bfa"
  });
  
  var db = firebase.firestore();
  console.log(db)