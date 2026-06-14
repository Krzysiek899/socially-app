import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchMyProfile, fetchPublicProfile } from '../profile/profileSlice.ts';
import type { RootState } from '../store.ts';
import {
  fetchGroupDetailsRequest,
  joinGroupRequest,
  leaveGroupRequest,
} from '../../pages/groups/api/groupApi.ts';
import type { GroupDetails } from '../../pages/groups/domain/groupModels.ts';

type GroupsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type GroupsState = {
  details: GroupDetails | null;
  status: GroupsStatus;
  errorKey: string | null;
  currentRequestId: string | null;
  requestedGroupId: string | null;
};

const initialState: GroupsState = {
  details: null,
  status: 'idle',
  errorKey: null,
  currentRequestId: null,
  requestedGroupId: null,
};

const getErrorKey = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
};

export const fetchGroupDetails = createAsyncThunk<
  GroupDetails,
  string,
  { state: RootState; rejectValue: string }
>('groups/fetchGroupDetails', async (groupId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('groups.errors.unauthorized');
  }

  try {
    return await fetchGroupDetailsRequest(groupId, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'groups.errors.fetch_failed'));
  }
});

const refreshAfterMembershipMutation = async (
  thunkApi: {
    dispatch: (action: unknown) => Promise<unknown>;
    getState: () => RootState;
  },
  groupId: string,
): Promise<void> => {
  await thunkApi.dispatch(fetchGroupDetails(groupId));
  await thunkApi.dispatch(fetchMyProfile());
  const requestedUserId = thunkApi.getState().profile.publicProfile.requestedUserId;
  if (requestedUserId) {
    await thunkApi.dispatch(fetchPublicProfile(requestedUserId));
  }
};

export const joinGroup = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('groups/joinGroup', async (groupId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('groups.errors.unauthorized');
  }

  try {
    const response = await joinGroupRequest(groupId, token, thunkApi.signal);
    await refreshAfterMembershipMutation(thunkApi, groupId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'groups.errors.join_failed'));
  }
});

export const leaveGroup = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('groups/leaveGroup', async (groupId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('groups.errors.unauthorized');
  }

  try {
    const response = await leaveGroupRequest(groupId, token, thunkApi.signal);
    await refreshAfterMembershipMutation(thunkApi, groupId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'groups.errors.leave_failed'));
  }
});

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupDetails.pending, (state, action) => {
        state.status = 'loading';
        state.errorKey = null;
        state.currentRequestId = action.meta.requestId;
        state.requestedGroupId = action.meta.arg;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.details = action.payload;
        state.status = 'succeeded';
        state.errorKey = null;
        state.currentRequestId = null;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        if (action.meta.aborted) {
          return;
        }

        state.status = 'failed';
        state.errorKey = action.payload ?? action.error.message ?? 'groups.errors.fetch_failed';
        state.currentRequestId = null;
      });
  },
});

export const groupsReducer = groupsSlice.reducer;
