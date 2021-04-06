import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import firebase from 'firebase/app'
import * as Sentry from '@sentry/browser'
import ReactReduxFirebaseProvider from 'react-redux-firebase/lib/ReactReduxFirebaseProvider'
import store, { history } from './store'
import App from './App'
import { inDevelopment } from './environment'
import { changeSearchTerm } from './modules/app'
import './firebase'
import './global.css'

// if (!inDevelopment()) {
//   Sentry.init({
//     dsn:
//       'https://29d780084dd844fa9884a8b3ac50fc1e@o247075.ingest.sentry.io/5249930'
//   })
// }

history.listen(() => {
  store.dispatch(changeSearchTerm())
})

const target = document.querySelector('#root')

const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <App />
      </ReactReduxFirebaseProvider>
    </ConnectedRouter>
  </Provider>,
  target
)
