/** localStorage keys of the JWT pair: written on sign-in, read on every request. */
export const ACCESS_TOKEN_KEY = "accessToken";

export const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Fired on `window` when the stored session is dropped because the server
 * rejected the refresh token, so the store signs the user out everywhere.
 */
export const SESSION_EXPIRED_EVENT = "examification:session-expired";

export const INITIAL_ROLE_REDIRECT_KEY = "examification:initial-role-redirect";

/** Followed by the attempt id; holds a running test attempt's answers. */
export const PRACTICE_TEST_ANSWERS_KEY_PREFIX = "practice-test-answers:";
