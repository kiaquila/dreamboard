(function () {
  const EDITOR_ROUTE_HASH = "#editor";

  const initialView =
    window.location.hash === EDITOR_ROUTE_HASH ? "editor" : "landing";

  if (initialView === "editor") {
    document.documentElement.setAttribute("data-initial-view", "editor");

    // The editor shell is styled through body.is-editor-active. app.js is a
    // deferred module, so without this the first paint of a direct #editor
    // load would use the pre-active mobile layout and then snap.
    document.body.classList.add("is-editor-active");
  }

  window.__dreamboardViewBoot = { initialView };
})();
