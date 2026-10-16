type UnauthorizedListener = () => void;

const listeners = new Set<UnauthorizedListener>();

/**
 * Subscribes to "server says the session is invalid" events (HTTP 401 / expired
 * token). Used so a request layer that has no React context can trigger a
 * logout without coupling to the auth store directly.
 */
export const onUnauthorized = (listener: UnauthorizedListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitUnauthorized = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      if (__DEV__) {
        console.error("auth-events: unauthorized listener failed", error);
      }
    }
  });
};
