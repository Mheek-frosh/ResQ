import React from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import type { Theme } from "../theme";
import { FauxMap } from "./FauxMap";

const region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035
};

const route = [
  { latitude: 6.521, longitude: 3.373 },
  { latitude: 6.5244, longitude: 3.3792 },
  { latitude: 6.531, longitude: 3.386 }
];

export function MapCanvas({ theme, mode = "home" }: { theme: Theme; mode?: "home" | "tracking" | "driver" }) {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return <FauxMap theme={theme} mode={mode} />;

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={region}
      showsCompass={false}
      showsPointsOfInterest={false}
      toolbarEnabled={false}
      customMapStyle={theme.dark ? darkMapStyle : lightMapStyle}
    >
      <Polyline coordinates={route} strokeColor="#FFFFFF" strokeWidth={8} />
      <Polyline coordinates={route} strokeColor={theme.primary} strokeWidth={5} />
      <Marker coordinate={route[1]!} pinColor={theme.primary} title="Your location" />
      <Marker coordinate={route[2]!} pinColor={theme.teal} title="CityCare Medical Centre" />
      <Marker
        coordinate={{ latitude: 6.528, longitude: 3.375 }}
        pinColor={mode === "driver" ? theme.danger : theme.primaryDark}
        title={mode === "tracking" ? "Your ResQ driver" : "Nearby ResQ driver"}
      />
    </MapView>
  );
}

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#EAF0F4" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#667085" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F8FAFC" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D8EDF7" }] }
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0E1D31" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9CB0C9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B1628" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#253850" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#102F46" }] }
];
