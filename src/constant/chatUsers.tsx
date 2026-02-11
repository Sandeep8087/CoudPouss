// Static user data for testing chat functionality
export const STATIC_USERS = {
  USER_1: {
    user_id: '0f4502db-5d85-4dfd-b71a-8c91418e479a',
    name: 'elder user',
    email: 'professionaltest2@yopmail.com',
    mobile: '3216549875',
    role: 'elderly_user',
    address: 'Pune, 342313',
  },
  USER_2: {
    user_id: 'c3aac822-d6e3-475d-962b-679fe4700c81',
    name: 'elder user',
    email: 'elderuser12345@yopmail.com',
    mobile: '9199900012',
    role: 'elderly_user',
    address: 'Pune,395010',
  },
};

/**
 * Get the peer user based on the current user's ID
 * Returns the other user as the peer for chat
 */
export function getPeerUser(currentUserId?: string) {
  if (!currentUserId) {
    // Default to USER_2 if no current user
    return {
      user_id: STATIC_USERS.USER_2.user_id,
      name: STATIC_USERS.USER_2.name,
      email: STATIC_USERS.USER_2.email,
      avatarUrl: undefined,
    };
  }

  // If current user is USER_1, return USER_2 as peer
  if (currentUserId === STATIC_USERS.USER_1.user_id) {
    return {
      user_id: STATIC_USERS.USER_2.user_id,
      name: STATIC_USERS.USER_2.name,
      email: STATIC_USERS.USER_2.email,
      avatarUrl: undefined,
    };
  }

  // Otherwise, return USER_1 as peer
  return {
    user_id: STATIC_USERS.USER_1.user_id,
    name: STATIC_USERS.USER_1.name,
    email: STATIC_USERS.USER_1.email,
    avatarUrl: undefined,
  };
}

/**
 * Convert provider/service data to peerUser format for chat
 * Maps provider data from API response to the format expected by ChatDetails screen
 */
export function convertProviderToPeerUser(provider?: any) {
  if (!provider) {
    return null;
  }

  return {
    user_id: provider?.id,
    name: provider?.full_name || provider?.first_name || '',
    email: provider?.email || '',
    avatarUrl: provider?.profile_photo_url || undefined,
  };
}
