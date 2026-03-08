import React, { Suspense } from "react";

const RealMap = React.lazy(() => import("./RealMap"));

export default function DeferredMap(props) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center">
          Loading map...
        </div>
      }
    >
      <RealMap {...props} />
    </Suspense>
  );
}
