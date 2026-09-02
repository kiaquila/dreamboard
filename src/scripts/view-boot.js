(function () {
  const EDITOR_ROUTE_HASH = "#editor";

  const initialView =
    window.location.hash === EDITOR_ROUTE_HASH ? "editor" : "landing";

  if (initialView === "editor") {
    document.documentElement.setAttribute("data-initial-view", "editor");
  }

  window.__dreamboardViewBoot = { initialView };
})();
