export const storeResetFns = new Set<() => void>();

const resetAllStore = () => {
  storeResetFns.forEach((resetFn) => {
    resetFn();
  });
};

export default resetAllStore;
