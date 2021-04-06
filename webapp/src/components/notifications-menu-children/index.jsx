import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ClearIcon from '@material-ui/icons/Clear'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import {
  CollectionNames,
  NotificationsFieldNames,
  UserFieldNames
} from '../../firestore'
import { createRef } from '../../utils'
import { quickDeleteRecord } from '../../firestore'
import { handleError } from '../../error-handling'
import * as routes from '../../routes'
import { NotificationEvents } from '../../notifications'

import FormattedDate from '../formatted-date'

const useStyles = makeStyles({
  desktopItem: {
    width: '500px'
  },
  // NOTE: MenuItem is set to flex
  anchor: {
    color: 'inherit',
    display: 'flex',
    width: '100%'
  },
  leftCol: {
    flex: 1
  },
  rightCol: {
    flexShrink: 1,
    marginLeft: '2%'
  },
  message: {
    wordBreak: 'normal',
    whiteSpace: 'normal',
    fontSize: '75%'
  },
  date: {
    fontSize: '50%'
  }
})

function Message({ parent, message, data }) {
  const collectionName = getCollectionNameForResult(parent)

  // I screwed up the message field so temporary thing until those notifications are purged
  if (message.indexOf('has created an amendment for your asset') !== -1) {
    return message
  }

  switch (message) {
    case '':
    // case 'Approved asset':
    //   return `Your asset "${parent[AssetFieldNames.title]}" was approved`
    case 'Created comment':
      switch (collectionName) {
        // case CollectionNames.Assets:
        //   return `${
        //     data && data.author ? data.author.username : 'Someone'
        //   } commented on asset "${parent[AssetFieldNames.title]}"`
        case CollectionNames.Users:
          return `${
            data && data.author ? data.author.username : 'Someone'
          } commented on your profile`
        default:
          console.log(
            `Unknown collection name for showing comment: ` + collectionName
          )
          return '????'
      }
    case 'Tagged user':
      switch (collectionName) {
        // case CollectionNames.Assets:
        //   return `${
        //     data && data.author
        //       ? data.author[UserFieldNames.username]
        //       : 'Someone'
        //   } tagged you in a comment of asset "${parent[AssetFieldNames.title]}"`
        case CollectionNames.Users:
          return `${
            data && data.author
              ? data.author[UserFieldNames.username]
              : 'Someone'
          } tagged you in a comment for user ${parent[UserFieldNames.username]}`
        default:
          console.log(
            `Unknown collection name for tagging user: ` + collectionName
          )
          return '????'
      }
    // case 'Amended tags':
    //   return `User "${
    //     data && data.creator ? data.creator[UserFieldNames.username] : 'Someone'
    //   }" amended tags for your asset ${parent[AssetFieldNames.title]}`
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return `Asset needs approval`
    case NotificationEvents.REPORT_CREATED:
      return 'Report created'
    default:
      console.log(`Unknown message for notification: ` + message)
      return '???'
  }
}

// TODO: Put somewhere common as re-use with activity component
function getCollectionNameForResult(result) {
  if (!result) {
    return ''
  }
  if (result.parentPath) {
    return result.parentPath
  }
  if (result.refPath) {
    return result.refPath.split('/')[0]
  }
  if (result.path) {
    return result.path.split('/')[0]
  }
  return ''
}

function getLinkUrl(parent, message) {
  const collectionName = getCollectionNameForResult(parent)

  switch (message) {
    case NotificationEvents.REPORT_CREATED:
      return routes.admin
  }

  switch (collectionName) {
    // case CollectionNames.Assets:
    //   return routes.viewAssetWithVar.replace(
    //     ':assetId',
    //     parent[AssetFieldNames.slug] || parent.id
    //   )
    case CollectionNames.Users:
      return routes.viewUserWithVar.replace(':userId', parent.id)
    default:
      return '/#unknown'
  }
}

export default ({ onClose, isMobile = false }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Notifications,
    userId
      ? [
          [
            NotificationsFieldNames.recipient,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId)
          ]
        ]
      : false, // do not query if not logged in
    {
      [options.limit]: 100,
      [options.orderBy]: [
        NotificationsFieldNames.createdAt,
        OrderDirections.DESC
      ],
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'notifications-menu-children'
    }
  )

  useEffect(() => {
    if (!results) {
      return
    }
    window.dispatchEvent(new Event('resize'))
  }, [results && results.length > 0])

  const menuItemClassName = isMobile ? classes.mobileItem : classes.desktopItem

  if (isLoading) {
    return <MenuItem disabled>Loading...</MenuItem>
  }

  if (isErrored) {
    return <MenuItem disabled>Failed to get notifications</MenuItem>
  }

  if (!results || !results.length) {
    return <MenuItem disabled>No notifications</MenuItem>
  }

  const onClearClick = (event, id) => {
    onClearNotification(id)

    // hide menu if no more notifications left
    if (results.length === 1) {
      onClose()
    }

    // Do not cause us to visit the link
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  const onClickLink = id => {
    onClearNotification(id)
    onClose()
  }

  const onClearNotification = async id => {
    try {
      await quickDeleteRecord(CollectionNames.Notifications, id)
    } catch (err) {
      console.error('Failed to delete notification', err)
      handleError(err)
    }
  }

  // Temporarily removed because the Firebase permissions are all dicky so this doesnt work
  // const onClearAllClick = async () => {
  //   try {
  //     await quickDeleteRecords(CollectionNames.Notifications, [
  //       [
  //         NotificationsFieldNames.recipient,
  //         Operators.EQUALS,
  //         createRef(CollectionNames.Users, userId)
  //       ]
  //     ])
  //   } catch (err) {
  //     console.error('Failed to delete all notifications for user', err)
  //     handleError(err)
  //   }
  // }

  return (
    <>
      {results.map(({ id, parent, message, createdAt, data }) => (
        <MenuItem key={id} className={menuItemClassName}>
          <Link
            to={getLinkUrl(parent, message)}
            onClick={() => onClickLink(id)}
            className={classes.anchor}>
            <div className={classes.leftCol}>
              <div className={classes.message}>
                <Message parent={parent} message={message} data={data} />
              </div>
              <div className={classes.date}>
                <FormattedDate date={createdAt} />
              </div>
            </div>
            <div
              className={classes.rightCol}
              onClick={event => onClearClick(event, id)}>
              <ClearIcon />
            </div>
          </Link>
        </MenuItem>
      ))}
      {/* <MenuItem className={menuItemClassName} onClick={onClearAllClick}>
        Clear All
      </MenuItem> */}
    </>
  )
}
