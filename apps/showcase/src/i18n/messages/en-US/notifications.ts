export const notificationsMessages = {
  'shell.link.notifications': 'Notifications',

  'notifications.panel.title': 'Notifications',

  'notifications.bell.ariaLabel': 'Notifications',
  'notifications.bell.unreadAria': '{count} unread notifications',

  'notifications.list.loading': 'Loading notifications…',
  'notifications.list.error': 'We could not load your notifications.',
  'notifications.list.loadMore': 'Load more',

  'notifications.section.today': 'Today',
  'notifications.section.thisWeek': 'This week',
  'notifications.section.thisMonth': 'This month',
  'notifications.section.previous': 'Previous',

  'notifications.followRequests.title': 'Follow requests',
  'notifications.followRequests.back': 'Back to notifications',
  'notifications.followRequests.summary.title': 'Follow requests',
  'notifications.followRequests.summary.openLabel': 'Open follow requests',
  'notifications.followRequests.summary.subtitle.one':
    '{username} requested to follow you',
  'notifications.followRequests.summary.subtitle.many':
    '{username} + {count} readers',
  'notifications.followRequests.feedAction': ' requested to follow you.',
  'notifications.followRequests.profileLinkLabel': 'Open {username} profile',
  'notifications.followRequests.empty': 'No pending follow requests.',
  'notifications.followRequests.loading': 'Loading follow requests...',
  'notifications.followRequests.error':
    'Unable to load follow requests right now.',
  'notifications.followRequests.accept': 'Accept',
  'notifications.followRequests.decline': 'Delete',
  'notifications.followRequests.accepting': 'Accepting...',
  'notifications.followRequests.declining': 'Deleting...',
  'notifications.followRequests.accept.success': 'Follow request accepted.',
  'notifications.followRequests.decline.success': 'Follow request deleted.',
  'notifications.followRequests.accept.error':
    'Unable to accept this request right now.',
  'notifications.followRequests.decline.error':
    'Unable to delete this request right now.',
  'notifications.followRequests.loadMore': 'Load more',
  'notifications.followRequests.loadingMore': 'Loading more...',

  'notifications.roomJoinRequests.title': 'Room join requests',
  'notifications.roomJoinRequests.back': 'Back to notifications',
  'notifications.roomJoinRequests.summary.title': 'Room join requests',
  'notifications.roomJoinRequests.summary.openLabel': 'Open room join requests',
  'notifications.roomJoinRequests.summary.subtitle.one':
    '{roomName} has a pending request',
  'notifications.roomJoinRequests.summary.subtitle.many':
    '{roomName} + {count} more rooms',
  'notifications.roomJoinRequests.summary.subtitle.fallback':
    'Pending join requests need review',
  'notifications.roomJoinRequests.empty': 'No pending room join requests.',
  'notifications.roomJoinRequests.list.pending.one': '1 pending request',
  'notifications.roomJoinRequests.list.pending.other':
    '{count} pending requests',

  'notifications.empty.title': 'You are all caught up',
  'notifications.empty.body':
    'New notifications about your reading life will show up here.',

  'notifications.category.announcements': 'Announcements',
  'notifications.category.meetings': 'Meetings',
  'notifications.category.polls': 'Polls',
  'notifications.category.comments': 'Comments',
  'notifications.category.security': 'Security',

  'notifications.type.room.meeting_updated': 'A meeting was updated',
  'notifications.type.room.meeting_cancelled': 'A meeting was cancelled',
  'notifications.type.room.poll_closed': 'A poll you voted in closed',
  'notifications.type.room.announcement_created': 'New announcement',
  'notifications.type.comment.on_my_activity':
    'Someone commented on your activity',
  'notifications.type.comment.on_my_discussion':
    'Someone commented on your discussion',
  'notifications.type.comment.reply_to_my_comment':
    'Someone replied to your comment',
  'notifications.type.comment.liked': 'Someone liked your comment',
  'notifications.rich.more': 'more',
  'notifications.rich.context.inRoom': ' in ',
  'notifications.rich.actorSuffix.comment.liked': ' liked your comment',
  'notifications.rich.actorSuffix.comment.on_my_activity':
    ' commented on your activity',
  'notifications.rich.actorSuffix.comment.on_my_discussion':
    ' commented on your discussion',
  'notifications.rich.actorSuffix.comment.reply_to_my_comment':
    ' replied to your comment',
  'notifications.rich.actorSuffix.room.meeting_updated': ' updated a meeting',
  'notifications.rich.actorSuffix.room.meeting_cancelled':
    ' cancelled a meeting',
  'notifications.rich.actorSuffix.room.announcement_created':
    ' posted a new announcement',
  'notifications.rich.actorSuffix.room.poll_closed': ' closed a poll',

  'notifications.preferences.title': 'Notifications',
  'notifications.preferences.description':
    'These controls manage notification types emitted through the notifications system. Account-security email stays mandatory in the auth flow and is not managed here.',
  'notifications.preferences.channel.inApp': 'App',
  'notifications.preferences.channel.email': 'Email',
  'notifications.preferences.saveError':
    'We could not update that preference. Please try again.',
} as const;
