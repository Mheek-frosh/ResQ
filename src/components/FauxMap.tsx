import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Theme } from "../theme";

type Props = {
  theme: Theme;
  mode?: "home" | "tracking" | "driver";
};

export function FauxMap({ theme, mode = "home" }: Props) {
  const road = theme.dark ? "#273A52" : "#FFFFFF";
  const minorRoad = theme.dark ? "#1E3047" : "#DDE6EC";
  const block = theme.dark ? "#15263B" : "#DDE7E8";
  const route = theme.primary;
  const roads: Array<{
    top: `${number}%`;
    left: `${number}%`;
    rotate: number;
    width: number;
    color: string;
  }> = [
    { top: "12%", left: "58%", rotate: -21, width: 120, color: road },
    { top: "56%", left: "33%", rotate: 18, width: 160, color: road },
    { top: "79%", left: "75%", rotate: -8, width: 140, color: road },
    { top: "33%", left: "2%", rotate: 73, width: 180, color: road },
    { top: "8%", left: "14%", rotate: 91, width: 210, color: road },
    { top: "62%", left: "2%", rotate: 90, width: 210, color: road },
    { top: "18%", left: "8%", rotate: 0, width: 130, color: minorRoad },
    { top: "72%", left: "5%", rotate: 0, width: 90, color: minorRoad }
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.map }]} accessibilityLabel="Illustrated map of nearby roads">
      <View style={[styles.park, { backgroundColor: theme.dark ? "#12322F" : "#DCEDE4" }]} />
      <View style={[styles.water, { backgroundColor: theme.dark ? "#102F46" : "#D5EBF4" }]} />
      {roads.map(({ top, left, rotate, width, color }, index) => (
        <View
          key={index}
          style={[
            styles.road,
            {
              top,
              left,
              width,
              backgroundColor: color,
              transform: [{ rotate: `${rotate}deg` }]
            }
          ]}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <View
          key={`block-${item}`}
          style={[
            styles.block,
            {
              backgroundColor: block,
              top: `${15 + (item % 3) * 25}%`,
              left: `${12 + item * 14}%`,
              transform: [{ rotate: item % 2 ? "7deg" : "-5deg" }]
            }
          ]}
        />
      ))}

      <Text style={[styles.label, { color: theme.muted, top: "19%", left: "12%" }]}>WEST DISTRICT</Text>
      <Text style={[styles.label, { color: theme.muted, top: "63%", left: "59%" }]}>MEDICAL ROW</Text>
      <Text style={[styles.street, { color: theme.subtext, top: "42%", left: "31%" }]}>Independence Ave</Text>

      <View style={[styles.route, { backgroundColor: route, transform: [{ rotate: "-30deg" }] }]} />
      <View style={[styles.routeTwo, { backgroundColor: route, transform: [{ rotate: "35deg" }] }]} />

      <MapPin theme={theme} kind="user" style={{ top: "47%", left: "45%" }} />
      <MapPin theme={theme} kind="hospital" style={{ top: "18%", left: "68%" }} />
      <MapPin theme={theme} kind="hospital" style={{ top: "68%", left: "18%" }} />
      <MapPin theme={theme} kind={mode === "tracking" ? "ambulance" : "driver"} style={{ top: "35%", left: "68%" }} />
      {mode === "driver" && <MapPin theme={theme} kind="alert" style={{ top: "67%", left: "58%" }} />}
    </View>
  );
}

function MapPin({
  theme,
  kind,
  style
}: {
  theme: Theme;
  kind: "user" | "hospital" | "ambulance" | "driver" | "alert";
  style: object;
}) {
  const config = {
    user: { bg: theme.primary, icon: "navigate" as const, color: "#FFFFFF" },
    hospital: { bg: theme.teal, icon: "medical" as const, color: "#FFFFFF" },
    ambulance: { bg: "#FFFFFF", icon: "car-sport" as const, color: theme.primary },
    driver: { bg: theme.elevated, icon: "car" as const, color: theme.text },
    alert: { bg: theme.danger, icon: "alert" as const, color: "#FFFFFF" }
  }[kind];

  return (
    <View style={[styles.pinWrap, style]}>
      {(kind === "user" || kind === "alert") && (
        <View style={[styles.pulse, { backgroundColor: config.bg, opacity: 0.18 }]} />
      )}
      <View style={[styles.pin, { backgroundColor: config.bg, borderColor: theme.surface }]}>
        <Ionicons name={config.icon} size={kind === "hospital" ? 17 : 15} color={config.color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  park: {
    position: "absolute",
    width: 160,
    height: 110,
    borderRadius: 48,
    top: "9%",
    left: "-10%",
    transform: [{ rotate: "-12deg" }]
  },
  water: {
    position: "absolute",
    width: 110,
    height: 420,
    borderRadius: 60,
    top: "34%",
    right: -75,
    transform: [{ rotate: "12deg" }]
  },
  road: { position: "absolute", height: 11, borderRadius: 9 },
  block: { position: "absolute", width: 52, height: 38, borderRadius: 8, opacity: 0.8 },
  label: { position: "absolute", fontSize: 9, fontWeight: "700", letterSpacing: 1.3 },
  street: { position: "absolute", fontSize: 10, fontWeight: "600", transform: [{ rotate: "-30deg" }] },
  route: {
    position: "absolute",
    height: 7,
    width: 150,
    borderRadius: 8,
    left: "38%",
    top: "44%",
    opacity: 0.92
  },
  routeTwo: {
    position: "absolute",
    height: 7,
    width: 86,
    borderRadius: 8,
    left: "27%",
    top: "54%",
    opacity: 0.92
  },
  pinWrap: { position: "absolute", width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  pulse: { position: "absolute", width: 42, height: 42, borderRadius: 21 },
  pin: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  }
});
