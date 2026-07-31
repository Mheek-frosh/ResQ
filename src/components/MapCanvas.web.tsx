import React from "react";
import type { Theme } from "../theme";
import { FauxMap } from "./FauxMap";

export function MapCanvas({ theme, mode }: { theme: Theme; mode?: "home" | "tracking" | "driver" }) {
  return <FauxMap theme={theme} mode={mode} />;
}
