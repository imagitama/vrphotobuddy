import { UserFieldNames, TransactionFieldNames } from './hooks/useDatabaseQuery'

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
