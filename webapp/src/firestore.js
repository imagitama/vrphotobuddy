import firebase from 'firebase/app'
import { isRef, mapRefToDoc } from './utils'

// intended for simple, one-time FIRE AND FORGET delete of a record eg. notifications
// do NOT use for anything else - use a React hook with nice UI
export function quickDeleteRecord(collectionName, id) {
  return firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .delete()
}

// as above - one-time FIRE AND FORGET delete of records eg. clear all notifications
export async function quickDeleteRecords(collectionName, whereClauses) {
  const query = firebase.firestore().collection(collectionName)

  if (!whereClauses || !whereClauses.length) {
    throw new Error('Need where clauses')
  }

  whereClauses.forEach(([fieldName, operator, value]) => {
    if (isRef(value)) {
      value = mapRefToDoc(value)
    }

    query.where(fieldName, operator, value)
  })

  const { docs } = await query.get()

  console.log(docs)

  return Promise.all(docs.map(doc => doc.ref.delete()))
}

export async function quickReadRecord(collectionName, id) {
  const doc = await firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .get()

  return doc.data()
}

export async function doesDocumentExist(collectionName, id) {
  const doc = await firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .get()

  return doc.exists
}

export const CollectionNames = {
  Users: 'users',
  Comments: 'comments',
  Notices: 'notices',
  History: 'history',
  Endorsements: 'endorsements',
  Profiles: 'profiles',
  Mail: 'mail',
  Summaries: 'summaries',
  Notifications: 'notifications',
  Polls: 'polls',
  PollResponses: 'pollResponses',
  GuestUsers: 'guestUsers',
  Likes: 'likes',
  Special: 'special',
  Tweets: 'tweets',
  UserMeta: 'userMeta',
  DiscordMessages: 'discordMessages',
  ViewCache: 'viewCache',
  Photos: 'photos',
  Albums: 'albums'
}

export const NotificationsFieldNames = {
  recipient: 'recipient',
  message: 'message',
  parent: 'parent',
  isRead: 'isRead',
  createdAt: 'createdAt'
}

export const GuestUsersFieldNames = {
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
}

export const UserFieldNames = {
  username: 'username',
  avatarUrl: 'avatarUrl',
  banReason: 'banReason',
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  isBanned: 'isBanned'
}

export const PhotoFieldNames = {
  sourceUrl: 'sourceUrl',
  largeUrl: 'largeUrl',
  mediumUrl: 'mediumUrl',
  smallUrl: 'smallUrl',
  title: 'title',
  description: 'description',
  privacy: 'privacy', // 0 = public, 1 = private
  status: 'status', // 0 = active, 1 = deleted
  isAdult: 'isAdult',
  tags: 'tags',
  album: 'album',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}

export const AlbumFieldNames = {
  title: 'title',
  description: 'description',
  coverImageUrl: 'coverImageUrl',
  privacy: 'privacy', // 0 = public, 1 = private
  status: 'status', // 0 = active, 1 = deleted
  isAdult: 'isAdult',
  tags: 'tags',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}
