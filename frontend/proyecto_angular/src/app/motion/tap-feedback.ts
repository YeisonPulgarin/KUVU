/**
 * Pause, in ms, between choosing an option of a menu that closes (public mobile menu, mobile
 * drawer of the signed-in app) and closing it: long enough to see the chosen option change
 * (color, growing underline) on touch screens, where there is no hover. Navigation itself is
 * not delayed.
 */
export const TAP_FEEDBACK_MS = 320;
