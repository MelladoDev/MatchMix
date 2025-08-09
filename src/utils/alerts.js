export const makeAlert = (setAlert) => (message, type = "info", ms = 3500) => {
  setAlert({ message, type });
  if (ms) setTimeout(() => setAlert(null), ms);
};
