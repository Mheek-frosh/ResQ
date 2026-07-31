import React from "react";
import type { Theme } from "../theme";
import { FauxMap } from "./FauxMap";

// TypeScript resolves this file while Metro automatically selects
// MapCanvas.native.tsx or MapCanvas.web.tsx for the running platform.
export function MapCanvas({ theme, mode }: { theme: Theme; mode?: "home" | "tracking" | "driver" }) {
  return <FauxMap theme={theme} mode={mode} />;
}
