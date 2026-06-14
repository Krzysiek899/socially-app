import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import {
  acceptFriendRequestRequest,
  approveMyProfileRequest,
  fetchMyProfileRequest,
  fetchPublicProfileRequest,
  rejectFriendRequestRequest,
  sendFriendRequestRequest,
  submitProfileReviewRequest,
  unfriendUserRequest,
  updateMyProfileRequest,
} from '../../pages/profile/api/profileApi.ts';
import type {
  MyProfile,
  PublicProfile,
  PublicProfileReview,
} from '../../pages/profile/domain/profileModels.ts';
import type { CreateReviewRequestDTO, UpdateProfileRequestDTO } from '../../pages/profile/dto/profileSchemas.ts';

type ProfileStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type ProfileResourceState<TProfile> = {
  profile: TProfile | null;
  status: ProfileStatus;
  errorKey: string | null;
  currentRequestId: string | null;
};

type PublicProfileResourceState = ProfileResourceState<PublicProfile> & {
  requestedUserId: string | null;
};

type ProfileState = {
  myProfile: ProfileResourceState<MyProfile>;
  publicProfile: PublicProfileResourceState;
};

const createResourceState = <TProfile>(): ProfileResourceState<TProfile> => ({
  profile: null,
  status: 'idle',
  errorKey: null,
  currentRequestId: null,
});

const initialState: ProfileState = {
  myProfile: createResourceState(),
  publicProfile: {
    ...createResourceState(),
    requestedUserId: null,
  },
};

const getErrorKey = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
};

export const fetchMyProfile = createAsyncThunk<
  MyProfile,
  void,
  { state: RootState; rejectValue: string }
>('profile/fetchMyProfile', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    return await fetchMyProfileRequest(token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.fetch_failed'));
  }
});

export const fetchPublicProfile = createAsyncThunk<
  PublicProfile,
  string,
  { state: RootState; rejectValue: string }
>('profile/fetchPublicProfile', async (userId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    return await fetchPublicProfileRequest(userId, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.fetch_failed'));
  }
});

export const submitProfileReview = createAsyncThunk<
  PublicProfileReview,
  { userId: string; payload: CreateReviewRequestDTO },
  { state: RootState; rejectValue: string }
>('profile/submitProfileReview', async ({ userId, payload }, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    return await submitProfileReviewRequest(userId, payload, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.submit_review_failed'));
  }
});

export const updateMyProfile = createAsyncThunk<
  MyProfile,
  UpdateProfileRequestDTO,
  { state: RootState; rejectValue: string }
>('profile/updateMyProfile', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    return await updateMyProfileRequest(payload, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.update_failed'));
  }
});

export const approveMyProfile = createAsyncThunk<
  boolean,
  void,
  { state: RootState; rejectValue: string }
>('profile/approveMyProfile', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    const response = await approveMyProfileRequest(token, thunkApi.signal);
    return response.isApproved;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.approve_failed'));
  }
});

const refreshProfilesAfterRelationMutation = async (
  thunkApi: {
    dispatch: (action: unknown) => unknown;
    getState: () => RootState;
  },
  targetUserId: string,
): Promise<void> => {
  await thunkApi.dispatch(fetchMyProfile());

  const requestedUserId = thunkApi.getState().profile.publicProfile.requestedUserId;
  const publicUserId = requestedUserId ?? targetUserId;
  await thunkApi.dispatch(fetchPublicProfile(publicUserId));
};

export const sendFriendRequest = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('profile/sendFriendRequest', async (targetUserId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    const response = await sendFriendRequestRequest(targetUserId, token, thunkApi.signal);
    await refreshProfilesAfterRelationMutation(thunkApi, targetUserId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.friend_request_failed'));
  }
});

export const acceptFriendRequest = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('profile/acceptFriendRequest', async (targetUserId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    const response = await acceptFriendRequestRequest(targetUserId, token, thunkApi.signal);
    await refreshProfilesAfterRelationMutation(thunkApi, targetUserId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.friend_accept_failed'));
  }
});

export const rejectFriendRequest = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('profile/rejectFriendRequest', async (targetUserId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    const response = await rejectFriendRequestRequest(targetUserId, token, thunkApi.signal);
    await refreshProfilesAfterRelationMutation(thunkApi, targetUserId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.friend_reject_failed'));
  }
});

export const unfriendUser = createAsyncThunk<
  { ok: true },
  string,
  { state: RootState; rejectValue: string }
>('profile/unfriendUser', async (targetUserId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('profile.errors.unauthorized');
  }

  try {
    const response = await unfriendUserRequest(targetUserId, token, thunkApi.signal);
    await refreshProfilesAfterRelationMutation(thunkApi, targetUserId);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'profile.errors.friend_unfriend_failed'));
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state, action) => {
        state.myProfile.status = 'loading';
        state.myProfile.errorKey = null;
        state.myProfile.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        if (state.myProfile.currentRequestId !== action.meta.requestId) return;
        state.myProfile.profile = action.payload;
        state.myProfile.status = 'succeeded';
        state.myProfile.errorKey = null;
        state.myProfile.currentRequestId = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        if (state.myProfile.currentRequestId !== action.meta.requestId) return;
        if (action.meta.aborted) return;
        state.myProfile.status = 'failed';
        state.myProfile.errorKey = action.payload ?? action.error.message ?? 'profile.errors.fetch_failed';
        state.myProfile.currentRequestId = null;
      })

      .addCase(fetchPublicProfile.pending, (state, action) => {
        state.publicProfile.status = 'loading';
        state.publicProfile.errorKey = null;
        state.publicProfile.profile = null;
        state.publicProfile.requestedUserId = action.meta.arg;
        state.publicProfile.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        if (state.publicProfile.currentRequestId !== action.meta.requestId) return;
        state.publicProfile.profile = action.payload;
        state.publicProfile.status = 'succeeded';
        state.publicProfile.errorKey = null;
        state.publicProfile.currentRequestId = null;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        if (state.publicProfile.currentRequestId !== action.meta.requestId) return;
        if (action.meta.aborted) return;
        state.publicProfile.status = 'failed';
        state.publicProfile.errorKey = action.payload ?? action.error.message ?? 'profile.errors.fetch_failed';
        state.publicProfile.currentRequestId = null;
      })

      .addCase(submitProfileReview.fulfilled, (state, action) => {
        const currentProfile = state.publicProfile.profile;
        if (!currentProfile) {
          return;
        }

        const newReview = action.payload;
        const existingReviewIndex = currentProfile.reviews.findIndex((review) => review.id === newReview.id);

        if (existingReviewIndex >= 0) {
          const previous = currentProfile.reviews[existingReviewIndex];
          currentProfile.reviews[existingReviewIndex] = newReview;
          const total = currentProfile.rating * currentProfile.reviewsCount;
          currentProfile.rating = (total - previous.rating + newReview.rating) / currentProfile.reviewsCount;
          return;
        }

        currentProfile.reviews.unshift(newReview);
        const oldTotalScore = currentProfile.rating * currentProfile.reviewsCount;
        currentProfile.reviewsCount += 1;
        currentProfile.rating = (oldTotalScore + newReview.rating) / currentProfile.reviewsCount;
      })

      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile.profile = action.payload;
      })

      .addCase(approveMyProfile.fulfilled, (state, action) => {
        if (state.myProfile.profile) {
          state.myProfile.profile.isApproved = action.payload;
        }
      });
  },
});

export const profileReducer = profileSlice.reducer;
