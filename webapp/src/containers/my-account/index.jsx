import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useMediaQuery } from 'react-responsive'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AvatarUploadForm from '../../components/avatar-upload-form'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import BioEditor from '../../components/bio-editor'
import NotificationSettings from '../../components/notification-settings'
import ConnectToTwitterForm from '../../components/connect-to-twitter-form'

import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { UserFieldNames } from '../../firestore'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  queryForTabletsOrBelow,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'

function WelcomeMessage() {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve your account details</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <BodyText>
      Hi,{' '}
      <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
        {user.username}
      </Link>
      !
    </BodyText>
  )
}

const analyticsCategoryName = 'MyAccount'

const patreonConnectFormTabIdx = 5

const getInitialTabIdx = () => {
  if (window.location.search.includes('code')) {
    return patreonConnectFormTabIdx
  }
  return 0
}

const TabPanel = ({ value, index, children }) =>
  value === index ? (
    <LazyLoad placeholder={<LoadingIndicator />}>{children}</LazyLoad>
  ) : null

const useStyles = makeStyles({
  tabsContainer: {
    display: 'flex',
    margin: '1rem 0',
    [mediaQueryForTabletsOrBelow]: {
      display: 'block'
    }
  },
  tabs: {
    marginRight: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: 0
    }
  },
  tabPanels: {
    flex: 1,
    [mediaQueryForTabletsOrBelow]: {
      margin: '1rem 0'
    }
  }
})

export default () => {
  const userId = useFirebaseUserId()
  const [, , user] = useUserRecord()
  const [activeTabIdx, setActiveTabIdx] = useState(getInitialTabIdx())
  const classes = useStyles()
  const isMobile = useMediaQuery({ query: queryForTabletsOrBelow })

  if (!userId || !user) {
    return <NoPermissionMessage />
  }

  // if they just signed up
  if (!user[UserFieldNames.username]) {
    return null
  }

  return (
    <>
      <Heading variant="h1">Your Account</Heading>
      <WelcomeMessage />

      <div className={classes.tabsContainer}>
        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          variant="scrollable"
          value={activeTabIdx}
          onChange={(event, newIdx) => setActiveTabIdx(newIdx)}
          className={classes.tabs}>
          <Tab label="Username" index={0} />
          <Tab label="Avatar" index={1} />
          <Tab label="Profile" index={2} />
          <Tab label="Settings" index={3} />
          <Tab label="Twitter" index={4} />
        </Tabs>
        <div className={classes.tabPanels}>
          <TabPanel value={activeTabIdx} index={0}>
            <Heading variant="h2">Username</Heading>
            <p>You can change your username as many times as you would like.</p>
            <UsernameEditor
              onSaveClick={() =>
                trackAction(analyticsCategoryName, 'Click save username')
              }
            />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={1}>
            <Heading variant="h2">Avatar</Heading>
            <p>
              Your avatar is shown on your profile, your comments and in lists
              of users.
            </p>
            <AvatarUploadForm
              onClick={() =>
                trackAction(analyticsCategoryName, 'Click avatar upload form')
              }
            />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={2}>
            <Heading variant="h2">Profile</Heading>
            <Heading variant="h3">Bio</Heading>
            <p>This bio is shown on your public user profile.</p>
            <BioEditor
              onSaveClick={() =>
                trackAction(analyticsCategoryName, 'Click save bio button')
              }
            />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={3}>
            <Heading variant="h2">Settings</Heading>
            <AdultContentToggle
              onClick={({ newValue }) =>
                trackAction(
                  analyticsCategoryName,
                  newValue === true
                    ? 'Enable adult content'
                    : 'Disable adult content'
                )
              }
            />
            <br />
            <Heading variant="h3">Notifications</Heading>
            <NotificationSettings />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={4}>
            <Heading variant="h2">Twitter</Heading>
            <p>Connect your Twitter account to post tweets.</p>
            <ConnectToTwitterForm />
          </TabPanel>
        </div>
      </div>
    </>
  )
}
