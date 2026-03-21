const listeners = new Set();

export const subscribeErrorMessage = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const showErrorMessage = (title = 'Error', message = 'Something went wrong') => {
  listeners.forEach((listener) => listener({ title, message }));
};
