import { UserFieldNames, PhotoFieldNames } from './firestore'

export function canEditUsers(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}

export function canEditComments(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}

export function canEditPhoto(user, photo) {
  if (!user) {
    return false
  }
  if (user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]) {
    return true
  }
  if (user.id === photo[PhotoFieldNames.createdBy].id) {
    return true
  }
  return false
}
