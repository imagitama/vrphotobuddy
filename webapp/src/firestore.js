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
  Photos: 'photos'
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
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  avatarUrl: 'avatarUrl',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isBanned: 'isBanned',
  banReason: 'banReason',
  isPatron: 'isPatron'
}

export const ProfileFieldNames = {
  vrchatUserId: 'vrchatUserId',
  vrchatUsername: 'vrchatUsername',
  discordUsername: 'discordUsername',
  twitterUsername: 'twitterUsername',
  telegramUsername: 'telegramUsername',
  youtubeChannelId: 'youtubeChannelId',
  twitchUsername: 'twitchUsername',
  patreonUsername: 'patreonUsername',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  bio: 'bio',
  notifyOnUnapprovedAssets: 'notifyOnUnapprovedAssets', // deprecated
  notificationEmail: 'notificationEmail',
  favoriteSpecies: 'favoriteSpecies',
  notificationPrefs: 'notificationPrefs',
  discordUserId: 'discordUserId',
  neosVrUsername: 'neosVrUsername',
  chilloutVrUsername: 'chilloutVrUsername'
}
