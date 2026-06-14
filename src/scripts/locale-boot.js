(function () {
  const COOKIE_NAME = "dreamboard_locale";
  const DEFAULT_LOCALE = "EN";
  const SUPPORTED_LOCALES = new Set(["EN", "RU", "ES"]);

  function readLocaleCookie() {
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (!cookie) {
      return "";
    }

    const rawValue = cookie.slice(COOKIE_NAME.length + 1);

    try {
      const normalized = decodeURIComponent(rawValue).toUpperCase();
      return SUPPORTED_LOCALES.has(normalized) ? normalized : "";
    } catch {
      return "";
    }
  }

  const locale = readLocaleCookie();
  const initialLocale = locale || DEFAULT_LOCALE;

  document.documentElement.lang = initialLocale.toLowerCase();

  if (locale && locale !== DEFAULT_LOCALE) {
    document.documentElement.setAttribute("data-locale-pending", "true");
  }

  const revealFallbackTimer = window.setTimeout(() => {
    document.documentElement.removeAttribute("data-locale-pending");
  }, 1500);

  window.__dreamboardLocaleBoot = {
    locale,
    initialLocale,
    reveal() {
      window.clearTimeout(revealFallbackTimer);
      document.documentElement.removeAttribute("data-locale-pending");
    },
  };
})();
