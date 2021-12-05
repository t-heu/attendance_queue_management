/* eslint-env browser */
/* global firebase */
/* eslint no-alert: off */
/* eslint no-implied-eval: off */

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (!firebaseUser) {
    firebase
      .auth()
      .signInWithEmailAndPassword('teste@teste.com', '123456')
      .catch(err => alert(err));
  }
});