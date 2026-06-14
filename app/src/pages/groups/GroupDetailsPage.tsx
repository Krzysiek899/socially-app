import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { t } from '../../i18n/index.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { fetchGroupDetails, joinGroup, leaveGroup } from '../../redux/groups/groupsSlice.ts';
import { Button, useNotifications } from '../../shared/components/index.ts';
import { useSmartBack } from '../../shared/hooks/useSmartBack.ts';
import { ProfileSurface } from '../profile/components/ProfileSurface.tsx';
import { GroupDetailsCard } from './components/GroupDetailsCard.tsx';

export const GroupDetailsPage = (): React.JSX.Element => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { details, status, errorKey } = useAppSelector((state) => state.groups);
  const currentUserId = useAppSelector((state) => state.auth.session?.userId ?? null);
  const [isMutating, setIsMutating] = React.useState(false);
  const goBack = useSmartBack('/app');

  const loadGroup = React.useCallback(() => {
    if (!groupId) {
      return;
    }

    void dispatch(fetchGroupDetails(groupId));
  }, [dispatch, groupId]);

  React.useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const handleMembershipAction = React.useCallback(async () => {
    if (!groupId || !details) {
      return;
    }

    setIsMutating(true);

    try {
      if (details.isMember) {
        await dispatch(leaveGroup(groupId)).unwrap();
      } else {
        await dispatch(joinGroup(groupId)).unwrap();
      }
    } catch (errorKeyFromApi: unknown) {
      notify({
        variant: 'error',
        message: t(
          typeof errorKeyFromApi === 'string'
            ? errorKeyFromApi
            : 'groups.errors.fetch_failed',
        ),
      });
    } finally {
      setIsMutating(false);
    }
  }, [details, dispatch, groupId, notify]);

  const handleMemberProfileClick = React.useCallback((memberId: string) => {
    if (currentUserId && memberId === currentUserId) {
      navigate('/app/profile');
      return;
    }

    navigate(`/app/users/${memberId}`);
  }, [currentUserId, navigate]);

  return (
    <ProfileSurface
      heading={t('groups.details.title')}
      isContentReady={details !== null}
      status={status}
      errorKey={errorKey}
      onRetry={loadGroup}
    >
      {details ? (
        <React.Fragment>
          <div style={{ paddingBottom: '0.25rem' }}>
            <Button type="button" variant="secondary" size="sm" onClick={goBack}>
              <ArrowLeft size={16} style={{ marginRight: '6px' }} />
              {t('common.back')}
            </Button>
          </div>
          <GroupDetailsCard
            details={details}
            actionLabel={details.isMember ? t('groups.actions.leave') : t('groups.actions.join')}
            actionDisabled={isMutating}
            onAction={handleMembershipAction}
            onMemberProfileClick={handleMemberProfileClick}
          />
        </React.Fragment>
      ) : null}
    </ProfileSurface>
  );
};
