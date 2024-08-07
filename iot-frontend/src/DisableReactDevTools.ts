const disableReactDevTools = (): void => {
  const emptyFunction = (): void => undefined;
  const DEV_TOOLS = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (typeof DEV_TOOLS === "object") {
    for (const [key, value] of Object.entries(DEV_TOOLS)) {
      DEV_TOOLS[key] = typeof value === "function" ? emptyFunction : null;
    }
  }
};

export default disableReactDevTools;
