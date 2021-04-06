export const NotificationEvents = {
  COMMENT_ON_USER: 'COMMENT_ON_USER'
}

export const NotificationMethods = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  DISCORD: 'DISCORD'
}

export const defaultNotificationPrefs = {
  events: {
    [NotificationEvents.COMMENT_ON_USER]: true
  },
  methods: {
    [NotificationMethods.WEB]: true,
    [NotificationMethods.EMAIL]: true,
    [NotificationMethods.DISCORD]: true
  }
}
