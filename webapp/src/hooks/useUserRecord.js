import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import firebase from 'firebase/app'
import { Map, is } from 'immutable'
import { formatRawDoc } from './useDatabaseQuery'
import { CollectionNames } from '../firestore'
import useFirebaseUserId from './useFirebaseUserId'
import {
  USER_LOADED,
  USER_UNLOADED,
  USER_IS_LOADING,
  USER_IS_DONE_LOADING
} from '../modules/user'

let isSubscribed = false

const getRecordSelector = fieldToSubscribeTo => {
  return ({ user }) => {
    if (user.record) {
      if (fieldToSubscribeTo) {
        if (fieldToSubscribeTo === 'id') {
          return user.id
        }
        return user.record.get(fieldToSubscribeTo)
      }
      return user.record.toJS()
    }
    return null
  }
}

// Allow subscribing to individual field names as useSelector only does a shallow comparison
// and we do not want to re-render huge components when they toggle stuff like adult content ¯\_(ツ)_/¯
export default fieldToSubscribeTo => {
  const uid = useFirebaseUserId()
  const isLoading = useSelector(({ user }) => user.isLoading)
  const isErrored = useSelector(({ user }) => user.isErrored)
  const record = useSelector(
    getRecordSelector(fieldToSubscribeTo),
    fieldToSubscribeTo ? undefined : is
  )
  const dispatch = useDispatch()
  const unsubscribeRef = useRef()
  const lastKnownUidRef = useRef()

  useEffect(() => {
    // If they logged out
    if (lastKnownUidRef.current && !uid) {
      dispatch({
        type: USER_UNLOADED
      })
    }

    // Store for future checks if logged out
    lastKnownUidRef.current = uid

    if (!uid) {
      dispatch({
        type: USER_IS_DONE_LOADING
      })
      return
    }

    // Only let 1 hook ever do the subscription to avoid any performance impacts
    // for having 100 components subscribe to the query
    if (isSubscribed === true) {
      return
    }

    isSubscribed = true

    async function main() {
      try {
        // catch weird edge case immediately after signup
        if (!uid) {
          return
        }

        dispatch({
          type: USER_IS_LOADING
        })

        unsubscribeRef.current = firebase
          .firestore()
          .collection(CollectionNames.Users)
          .doc(uid)
          .onSnapshot(async result => {
            const formattedResult = await formatRawDoc(result)

            dispatch({
              type: USER_LOADED,
              record: Map(formattedResult)
            })
          })
      } catch (err) {
        console.error('Failed to useUserRecord', { uid }, err)
      }
    }

    main()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        isSubscribed = false
      }
    }
  }, [uid, lastKnownUidRef.uid === uid])

  return [isLoading, isErrored, record]
}
