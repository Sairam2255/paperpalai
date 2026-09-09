const STORAGE_KEY = "paperpal-theme";

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "light";
  } catch {
    return "light";
  }
};

export const getStoredLanguage = () => {
  try {
    return localStorage.getItem("paperpal-language") || "English";
  } catch {
    return "English";
  }
};

export const applyStoredSettings = () => {
  const theme = getStoredTheme();

  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
};

export const listenForSettings = (onChange) => {
  const handler = (event) => {
    if (event.detail?.theme) {
      document.documentElement.dataset.theme = event.detail.theme;
      document.body.dataset.theme = event.detail.theme;
    }

    onChange?.(event.detail || {});
  };

  window.addEventListener("paperpal-settings-changed", handler);

  return () => {
    window.removeEventListener(
      "paperpal-settings-changed",
      handler
    );
  };
};