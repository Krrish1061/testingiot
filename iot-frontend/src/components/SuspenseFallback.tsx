import { ReactNode, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  children: ReactNode;
  isfallbackUndefined?: boolean;
}

function SuspenseFallback({ children, isfallbackUndefined = false }: Props) {
  return (
    <Suspense
      fallback={isfallbackUndefined ? undefined : <LoadingSpinner size={40} />}
    >
      {children}
    </Suspense>
  );
}

export default SuspenseFallback;
