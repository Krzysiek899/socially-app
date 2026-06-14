import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, Compass, Ticket } from 'lucide-react';
import { fetchNotifications, markNotificationAsRead } from '../../redux/notification-center/notificationCenterSlice.ts';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { AppNavbar, Page, Section, Stack } from '../../shared/components/index.ts';
import { t } from '../../i18n/index.ts';
import './NotificationCenter.css';

export const NotificationCenterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, status, errorKey } = useSelector((state: RootState) => state.notificationCenter.notifications);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotifications());
    }
  }, [status, dispatch]);

  const groupedNotifications = useMemo(() => {
    const today = items.filter((n) => n.group === 'TODAY');
    const yesterday = items.filter((n) => n.group === 'YESTERDAY');
    return { today, yesterday };
  }, [items]);

  const handleNotificationClick = (id: string, isRead: boolean, type: string, referenceId: string) => {
    if (!isRead) {
      dispatch(markNotificationAsRead(id));
    }

    switch (type) {
      case 'USER_JOINED':
      case 'FRIEND_JOINED':
        navigate(`/app/users/${referenceId}`);
        break;
      case 'NEW_EVENT':
      case 'SYSTEM_APPROVAL':
        navigate(`/app/events/${referenceId}`);
        break;
      default:
        break;
    }
  };

  return (
    <main className="notifications-page">
      <AppNavbar active="notifications" />

      <Page maxWidth="xl">
        <Section spacing="md">
          <h1 className="notifications__title">Centrum powiadomień</h1>

          {status === 'loading' && <p>{t('common.loading')}</p>}
          {status === 'failed' && <p className="discover__state--error">{t(errorKey || 'notifications.errors.fetch_failed')}</p>}

          <Stack gap="6">
            {groupedNotifications.today.length > 0 && (
              <div className="notifications-group">
                <Stack gap="3">
                  {groupedNotifications.today.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onClick={() => handleNotificationClick(notif.id, notif.isRead, notif.type, notif.referenceId)}
                    />
                  ))}
                </Stack>
              </div>
            )}

            {groupedNotifications.yesterday.length > 0 && (
              <div className="notifications-group">
                <div className="notifications-group__divider">
                  <span>WCZORAJ</span>
                </div>
                <Stack gap="3">
                  {groupedNotifications.yesterday.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onClick={() => handleNotificationClick(notif.id, notif.isRead, notif.type, notif.referenceId)}
                    />
                  ))}
                </Stack>
              </div>
            )}
          </Stack>
        </Section>
      </Page>
    </main>
  );
};

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    referenceId: string;
    title: string;
    message: string;
    timeAgo: string;
    isRead: boolean;
    avatarUrl?: string;
    eventMeta?: {
      time: string;
      price: string;
    };
  };
  onClick: () => void;
}

const NotificationCard = ({ notification, onClick }: NotificationCardProps) => {
  return (
    <div
      className={`notification-card ${!notification.isRead ? 'notification-card--unread' : ''}`}
      onClick={onClick}
    >
      <div className="notification-card__icon-wrapper">
        {notification.avatarUrl ? (
          <img src={notification.avatarUrl} alt="avatar" className="notification-card__avatar" />
        ) : (
          <div className="notification-card__icon-placeholder">
            {notification.type === 'NEW_EVENT' ? <Compass size={24} /> : <Ticket size={24} />}
          </div>
        )}
      </div>

      <div className="notification-card__content">
        <h3 className="notification-card__title">{notification.title}</h3>
        <p className="notification-card__message">{notification.message}</p>

        {notification.eventMeta && (
          <div className="notification-card__meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> {notification.eventMeta.time}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ticket size={14} /> {notification.eventMeta.price}
            </span>
          </div>
        )}
      </div>

      <div className="notification-card__actions">
        <span className="notification-card__time">{notification.timeAgo}</span>
        {!notification.isRead && <span className="notification-card__unread-dot" />}
      </div>
    </div>
  );
};
