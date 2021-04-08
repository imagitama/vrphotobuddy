import React, { lazy, Suspense, useEffect } from 'react'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useHistory
} from 'react-router-dom'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { makeStyles } from '@material-ui/core/styles'
import { useMediaQuery } from 'react-responsive'

import * as routes from './routes'
import { darkTheme } from './themes'

// Do not lazy load these routes as they are very popular so they should load fast
import Home from './containers/home'
import AllPhotos from './containers/all-photos'
import MyPhotos from './containers/my-photos'
import AllAlbums from './containers/all-albums'
import MyAlbums from './containers/my-albums'
import ViewPhoto from './containers/view-photo'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
// import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'
import LoadingIndicator from './components/loading-indicator'
import BannedNotice from './components/banned-notice'

import useSearchTerm from './hooks/useSearchTerm'

import { scrollToTop } from './utils'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
  queryForMobiles
} from './media-queries'
import { UserFieldNames } from './firestore'
import useUserRecord from './hooks/useUserRecord'

const catchChunkDeaths = functionToImport =>
  functionToImport().catch(err => {
    if (err.message.includes('Loading chunk')) {
      // Warning: this could cause an infinite loop :)
      window.location.reload()
    }
    throw err
  })

const useStyles = makeStyles({
  mainContainer: {
    padding: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      maxWidth: '100vw',
      overflow: 'hidden'
    },
    [mediaQueryForMobiles]: {
      padding: '0.5rem'
    }
  },
  searchBar: {
    margin: '0 50px'
  }
})

// Lazy load these to improve performance (downloading and processing JS)
const Login = lazy(() => catchChunkDeaths(() => import('./containers/login')))
const SignUp = lazy(() => catchChunkDeaths(() => import('./containers/signup')))
const Logout = lazy(() => catchChunkDeaths(() => import('./containers/logout')))
const MyAccount = lazy(() =>
  catchChunkDeaths(() => import('./containers/my-account'))
)
const ErrorContainer = lazy(() =>
  catchChunkDeaths(() => import('./containers/error'))
)
const SetupProfile = lazy(() =>
  catchChunkDeaths(() => import('./containers/setup-profile'))
)

const SetupProfileRedirect = () => {
  const [, , user] = useUserRecord()
  const { push } = useHistory()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      return
    }

    if (!user[UserFieldNames.username]) {
      push(routes.setupProfile)
    }
  }, [location.pathname, user !== null])

  return null
}

const MainContent = () => {
  const searchTerm = useSearchTerm()
  const location = useLocation()

  useEffect(() => {
    scrollToTop(false)
  }, [location.pathname])

  if (searchTerm) {
    return <SearchResults />
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <SetupProfileRedirect />
      <Switch>
        {/* photos */}
        <Route exact path={routes.allPhotos} component={AllPhotos} />
        <Route exact path={routes.myPhotos} component={MyPhotos} />
        <Route exact path={routes.allAlbums} component={AllAlbums} />
        <Route exact path={routes.myAlbums} component={MyAlbums} />
        <Route exact path={routes.viewPhotoWithVar} component={ViewPhoto} />

        {/* auth */}
        <Route exact path={routes.login} component={Login} />
        <Route
          exact
          path={routes.loginForOAuth}
          component={() => <Login oauth />}
        />
        <Route exact path={routes.signUp} component={SignUp} />
        <Route exact path={routes.logout} component={Logout} />
        <Route exact path={routes.myAccount} component={MyAccount} />
        <Route exact path={routes.setupProfile} component={SetupProfile} />

        {/* core */}
        <Route exact path={routes.home} component={Home} />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </Suspense>
  )
}

export default () => {
  const classes = useStyles()
  const location = useLocation()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const searchTerm = useSearchTerm()

  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <PageHeader />
        <main className="main">
          <div className={classes.mainContainer}>
            <BannedNotice />
            {/* Temporarily removed to avoid an unnecessary query <Notices /> */}
            {/* <UnapprovedAssetsMessage />
            <PendingAssetAmendmentsMessage /> */}

            <MainContent />
          </div>
        </main>
        <PageFooter />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
