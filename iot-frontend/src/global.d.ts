export {};

// Extending the Window interface to include __REACT_DEVTOOLS_GLOBAL_HOOK__
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}
