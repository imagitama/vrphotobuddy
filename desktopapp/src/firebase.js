const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
require('firebase/database')
require('firebase/functions')

const firebaseConfig = {
  apiKey: process.env.VRPHOTOBUDDY_FIREBASE_API_KEY,
  authDomain: process.env.VRPHOTOBUDDY_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VRPHOTOBUDDY_FIREBASE_DATABASE_URL,
  projectId: process.env.VRPHOTOBUDDY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VRPHOTOBUDDY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VRPHOTOBUDDY_FIREBASE_MESSAGING_SENDER_ID,
}

const firebaseApp = firebase.initializeApp(firebaseConfig)

if (
  process.env.VRPHOTOBUDDY_USE_EMULATORS ||
  process.env.VRPHOTOBUDDY_USE_FUNCTIONS_EMULATOR
) {
  console.info(`using functions emulator`)
  firebase.functions().useFunctionsEmulator('http://localhost:5000')
}

if (
  process.env.VRPHOTOBUDDY_USE_EMULATORS ||
  process.env.VRPHOTOBUDDY_USE_FIRESTORE_EMULATOR
) {
  console.info(`using firestore emulator`)
  firebase.firestore().useEmulator('localhost', 8080)
}

if (
  process.env.VRPHOTOBUDDY_USE_EMULATORS ||
  process.env.VRPHOTOBUDDY_USE_AUTH_EMULATOR
) {
  console.info(`using auth emulator`)
  firebase.auth().useEmulator('http://localhost:9099')
}

const callFunction = (name, data, inDevResult) => {
  // if (inDevelopment() && inDevResult) {
  //   return Promise.resolve(inDevResult)
  // }

  return firebase.app().functions().httpsCallable(name)(data)
}
module.exports.callFunction = callFunction

const functionNames = {
  uploadPhoto: 'uploadPhoto',
}
module.exports.functionNames = functionNames
