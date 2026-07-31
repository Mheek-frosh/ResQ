import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { MapCanvas } from "./src/components/MapCanvas";
import { darkTheme, lightTheme, type Theme } from "./src/theme";

type Route =
  | "welcome"
  | "home"
  | "activity"
  | "remote"
  | "profile"
  | "emergency"
  | "tracking"
  | "payment"
  | "driver"
  | "driverRequest";
type ThemeMode = "light" | "dark" | "system";
type IconName = keyof typeof Ionicons.glyphMap;

const hospitals = [
  { name: "CityCare Medical Centre", distance: "1.2 km", eta: "4 min", emergency: true },
  { name: "St. Anne Hospital", distance: "2.4 km", eta: "7 min", emergency: true },
  { name: "Central Emergency Clinic", distance: "3.1 km", eta: "9 min", emergency: false }
];

function ResQApp() {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [route, setRoute] = useState<Route>("welcome");
  const [selectedHospital, setSelectedHospital] = useState(0);
  const [paymentRideType, setPaymentRideType] = useState<"Emergency" | "ResQ Ride">("ResQ Ride");
  const [toast, setToast] = useState("");
  const dark = themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");
  const theme = dark ? darkTheme : lightTheme;

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const navigate = (next: Route) => setRoute(next);
  const beginEmergency = () => {
    setPaymentRideType("Emergency");
    navigate("emergency");
  };

  return (
    <View style={[styles.app, { backgroundColor: theme.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      {route === "welcome" && (
        <WelcomeScreen
          theme={darkTheme}
          onContinue={() => navigate("home")}
        />
      )}
      {route === "home" && (
        <HomeScreen
          theme={theme}
          selectedHospital={selectedHospital}
          setSelectedHospital={setSelectedHospital}
          onEmergency={beginEmergency}
          onNormal={() => {
            setPaymentRideType("ResQ Ride");
            navigate("payment");
          }}
          onProfile={() => navigate("profile")}
        />
      )}
      {route === "activity" && <ActivityScreen theme={theme} />}
      {route === "remote" && (
        <RemoteBookingScreen
          theme={theme}
          onSubmit={(emergency) => {
            if (emergency) beginEmergency();
            else {
              setPaymentRideType("ResQ Ride");
              navigate("payment");
            }
          }}
        />
      )}
      {route === "profile" && (
        <ProfileScreen
          theme={theme}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onDriver={() => navigate("driver")}
          notify={setToast}
        />
      )}
      {route === "emergency" && (
        <EmergencyScreen
          theme={theme}
          hospital={hospitals[selectedHospital]!}
          onBack={() => navigate("home")}
          onAccepted={() => navigate("tracking")}
        />
      )}
      {route === "tracking" && (
        <TrackingScreen
          theme={theme}
          hospital={hospitals[selectedHospital]!}
          onBack={() => navigate("home")}
          onComplete={() => navigate("payment")}
          notify={setToast}
        />
      )}
      {route === "payment" && (
        <PaymentScreen
          theme={theme}
          rideType={paymentRideType}
          destination={hospitals[selectedHospital]!.name}
          onDone={() => navigate("home")}
        />
      )}
      {route === "driver" && (
        <DriverDashboard
          theme={theme}
          onProfile={() => navigate("profile")}
          onRequest={() => navigate("driverRequest")}
        />
      )}
      {route === "driverRequest" && (
        <DriverRequestScreen
          theme={theme}
          onDecline={() => navigate("driver")}
          onAccept={() => navigate("tracking")}
        />
      )}

      {(["home", "activity", "remote", "profile"] as Route[]).includes(route) && (
        <BottomNav route={route} onChange={navigate} theme={theme} />
      )}

      {!!toast && (
        <View style={[styles.toast, { backgroundColor: theme.text }]}>
          <Ionicons name="checkmark-circle" size={18} color={theme.bg} />
          <Text style={{ color: theme.bg, fontWeight: "700" }}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ResQApp />
    </SafeAreaProvider>
  );
}

function WelcomeScreen({
  theme,
  onContinue
}: {
  theme: Theme;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const entrance = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entrance, {
        toValue: 0,
        damping: 18,
        stiffness: 110,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      })
    ]).start();
  }, [entrance, opacity]);

  const signIn = () => {
    if (email.trim() && !email.includes("@")) {
      Alert.alert("Check your email", "Enter a valid email address to continue.");
      return;
    }
    onContinue();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.welcomeScroll,
          {
            paddingTop: insets.top + 28,
            paddingBottom: Math.max(insets.bottom + 24, 32)
          }
        ]}
      >
        <Animated.View
          style={[
            styles.welcomeContent,
            {
              opacity,
              transform: [{ translateY: entrance }]
            }
          ]}
        >
          <View style={styles.welcomeBrand}>
            <View style={[styles.welcomeBrandIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="medical" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.welcomeBrandText, { color: theme.text }]}>ResQ</Text>
          </View>

          <View style={styles.welcomeHeading}>
            <Text style={[styles.welcomeTitle, { color: theme.text }]}>Welcome back</Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.subtext }]}>
              Ready when you need a ride.{"\n"}Faster when it matters most.
            </Text>
          </View>

          <View style={styles.welcomeForm}>
            <Text style={[styles.welcomeLabel, { color: theme.text }]}>Email</Text>
            <View
              style={[
                styles.welcomeInputShell,
                {
                  backgroundColor: theme.surface,
                  borderColor: focused === "email" ? theme.primary : theme.border
                }
              ]}
            >
              <Ionicons name="mail-outline" size={19} color={focused === "email" ? theme.primary : theme.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={theme.muted}
                style={[styles.welcomeInput, { color: theme.text }]}
                accessibilityLabel="Email address"
              />
            </View>

            <Text style={[styles.welcomeLabel, { color: theme.text, marginTop: 20 }]}>Password</Text>
            <View
              style={[
                styles.welcomeInputShell,
                {
                  backgroundColor: theme.surface,
                  borderColor: focused === "password" ? theme.primary : theme.border
                }
              ]}
            >
              <Ionicons name="lock-closed-outline" size={19} color={focused === "password" ? theme.primary : theme.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                secureTextEntry={!passwordVisible}
                autoComplete="current-password"
                placeholder="Enter your password"
                placeholderTextColor={theme.muted}
                style={[styles.welcomeInput, { color: theme.text }]}
                accessibilityLabel="Password"
              />
              <Pressable
                onPress={() => setPasswordVisible((visible) => !visible)}
                hitSlop={10}
                accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
              >
                <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={21} color={theme.muted} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => Alert.alert("Password recovery", "A recovery-link simulation has been opened.")}
              style={styles.forgotAction}
            >
              <Text style={[styles.forgotText, { color: theme.primaryDark }]}>Forgot password?</Text>
            </Pressable>

            <Pressable
              onPress={signIn}
              style={({ pressed }) => [
                styles.welcomePrimary,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: pressed ? 0.985 : 1 }]
                }
              ]}
            >
              <Text style={styles.welcomePrimaryText}>Continue to ResQ</Text>
              <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.orText, { color: theme.muted }]}>or</Text>
            <View style={[styles.orLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.socialStack}>
            <SocialButton
              theme={theme}
              icon="logo-apple"
              label="Continue with Apple"
              onPress={onContinue}
            />
            <SocialButton
              theme={theme}
              icon="logo-google"
              iconColor="#4285F4"
              label="Continue with Google"
              onPress={onContinue}
            />
          </View>

          <Text style={[styles.prototypeNote, { color: theme.muted }]}>
            Front-end prototype · No account required
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HomeScreen({
  theme,
  selectedHospital,
  setSelectedHospital,
  onEmergency,
  onNormal,
  onProfile
}: {
  theme: Theme;
  selectedHospital: number;
  setSelectedHospital: (index: number) => void;
  onEmergency: () => void;
  onNormal: () => void;
  onProfile: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const entrance = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 0, useNativeDriver: true, damping: 18 }).start();
  }, [entrance]);

  return (
    <View style={styles.fill}>
      <Animated.View style={[styles.fill, { opacity: entrance.interpolate({ inputRange: [0, 24], outputRange: [1, 0.65] }) }]}>
        <MapCanvas theme={theme} mode="home" />
      </Animated.View>
      <View style={[styles.topBar, { top: insets.top + 10, backgroundColor: theme.elevated, shadowColor: theme.shadow }]}>
        <Pressable onPress={onProfile} style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <Text style={{ color: theme.primary, fontWeight: "800" }}>AM</Text>
        </Pressable>
        <Wordmark theme={theme} />
        <Pressable style={[styles.circleButton, { backgroundColor: theme.surfaceAlt }]} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
          <View style={[styles.notificationDot, { backgroundColor: theme.danger }]} />
        </Pressable>
        <Pressable onPress={onEmergency} style={[styles.sos, { backgroundColor: theme.danger }]}>
          <Ionicons name="medical" size={14} color="#FFFFFF" />
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      </View>

      <View style={[styles.mapActions, { bottom: sheetExpanded ? 550 : 438 }]}>
        <MapAction icon="layers-outline" theme={theme} />
        <MapAction icon="locate" theme={theme} />
      </View>

      <Animated.View
        style={[
          styles.homeSheet,
          {
            backgroundColor: theme.surface,
            paddingBottom: 104,
            transform: [{ translateY: entrance }],
            maxHeight: sheetExpanded ? Dimensions.get("window").height * 0.76 : 440
          }
        ]}
      >
        <Pressable onPress={() => setSheetExpanded((value) => !value)} style={styles.sheetHandleArea}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </Pressable>
        <View style={styles.sheetPad}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.eyebrow, { color: theme.success }]}>6 DRIVERS NEARBY</Text>
          </View>
          <Text style={[styles.homeTitle, { color: theme.text }]}>Where do you need help?</Text>
          <Text style={[styles.support, { color: theme.subtext }]}>Choose the fastest way to get there.</Text>

          <Pressable style={[styles.locationField, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={[styles.locationIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="navigate" size={17} color={theme.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>PICKUP</Text>
              <Text numberOfLines={1} style={[styles.fieldValue, { color: theme.text }]}>Current location · 24 Kingsway Road</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>

          <View style={styles.actionRow}>
            <PrimaryButton
              theme={theme}
              danger
              icon="medical"
              label="Emergency"
              onPress={onEmergency}
              style={styles.flex}
            />
            <PrimaryButton
              theme={theme}
              icon="car-sport"
              label="Book a ride"
              onPress={onNormal}
              style={styles.flex}
            />
          </View>

          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby hospitals</Text>
            <Pressable onPress={() => setSheetExpanded(true)}>
              <Text style={[styles.link, { color: theme.primary }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hospitalRow}>
            {hospitals.map((hospital, index) => (
              <Pressable
                key={hospital.name}
                onPress={() => setSelectedHospital(index)}
                style={[
                  styles.hospitalCard,
                  {
                    backgroundColor: selectedHospital === index ? theme.primarySoft : theme.bg,
                    borderColor: selectedHospital === index ? theme.primary : theme.border
                  }
                ]}
              >
                <View style={[styles.hospitalIcon, { backgroundColor: theme.surface }]}>
                  <Ionicons name="medkit" size={19} color={theme.teal} />
                </View>
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[styles.hospitalName, { color: theme.text }]}>{hospital.name}</Text>
                  <Text style={[styles.hospitalMeta, { color: theme.subtext }]}>{hospital.distance} · {hospital.eta}</Text>
                </View>
                <View style={[styles.openBadge, { backgroundColor: hospital.emergency ? "#DCFCE7" : theme.surfaceAlt }]}>
                  <Text style={{ color: hospital.emergency ? "#15803D" : theme.subtext, fontSize: 9, fontWeight: "800" }}>
                    {hospital.emergency ? "ER OPEN" : "CLINIC"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

function EmergencyScreen({
  theme,
  hospital,
  onBack,
  onAccepted
}: {
  theme: Theme;
  hospital: (typeof hospitals)[number];
  onBack: () => void;
  onAccepted: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const [autoCall, setAutoCall] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true })
      ])
    );
    animation.start();
    return () => {
      clearInterval(timer);
      animation.stop();
    };
  }, [pulse]);

  return (
    <View style={[styles.fill, { backgroundColor: theme.bg }]}>
      <LinearGradient
        colors={[theme.dangerDark, theme.dark ? "#5B1D2B" : "#F05252"]}
        style={[styles.emergencyHeader, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.screenHeader}>
          <Pressable onPress={() => setConfirmCancel(true)} style={styles.translucentButton}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.lightHeaderTitle}>Emergency active</Text>
          <View style={styles.translucentButton}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.searchVisual}>
          <Animated.View style={[styles.radarOuter, { transform: [{ scale: pulse }], opacity: pulse }]}>
            <View style={styles.radarMid}>
              <View style={styles.ambulanceCircle}>
                <Ionicons name="car-sport" size={34} color={theme.danger} />
              </View>
            </View>
          </Animated.View>
        </View>
        <Text style={styles.emergencyTitle}>Emergency request sent</Text>
        <Text style={styles.emergencySupport}>Finding the nearest available ResQ driver</Text>
      </LinearGradient>

      <ScrollView style={styles.flex} contentContainerStyle={[styles.screenPad, { paddingBottom: 36 }]}>
        <View style={[styles.elapsedCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>SEARCHING FOR</Text>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Medical-response driver</Text>
          </View>
          <View style={[styles.timerPill, { backgroundColor: theme.dangerSoft }]}>
            <Text style={[styles.timerText, { color: theme.danger }]}>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</Text>
          </View>
        </View>

        <JourneyCard theme={theme} hospital={hospital} />

        <View style={[styles.autoCallCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <View style={[styles.iconTile, { backgroundColor: theme.surface }]}>
            <Ionicons name="call" size={20} color={theme.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Emergency backup</Text>
            <Text style={[styles.smallText, { color: theme.subtext }]}>Call your emergency contact if no driver accepts within 60 seconds.</Text>
          </View>
          <Switch value={autoCall} onValueChange={setAutoCall} trackColor={{ true: theme.primary }} />
        </View>

        <PrimaryButton theme={theme} icon="flash" label="Simulate driver accepting" onPress={onAccepted} />
        <Pressable onPress={() => Alert.alert("Emergency contact", "Calling Mama · +234 801 234 5678 (simulation)")} style={styles.textAction}>
          <Ionicons name="call-outline" size={18} color={theme.primary} />
          <Text style={[styles.link, { color: theme.primary }]}>Call emergency contact now</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={confirmCancel}
        theme={theme}
        title="Cancel emergency request?"
        message="Only cancel if you no longer need urgent transport."
        confirmLabel="Yes, cancel request"
        onClose={() => setConfirmCancel(false)}
        onConfirm={onBack}
      />
    </View>
  );
}

function TrackingScreen({
  theme,
  hospital,
  onBack,
  onComplete,
  notify
}: {
  theme: Theme;
  hospital: (typeof hospitals)[number];
  onBack: () => void;
  onComplete: () => void;
  notify: (message: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [progress, setProgress] = useState(1);

  return (
    <View style={styles.fill}>
      <MapCanvas theme={theme} mode="tracking" />
      <View style={[styles.trackingTop, { top: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={[styles.circleButtonLarge, { backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <View style={[styles.etaCard, { backgroundColor: theme.surface }]}>
          <View>
            <Text style={[styles.fieldLabel, { color: theme.success }]}>DRIVER ARRIVING</Text>
            <Text style={[styles.etaTitle, { color: theme.text }]}>4 minutes</Text>
          </View>
          <View style={[styles.etaIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="car-sport" size={22} color={theme.primary} />
          </View>
        </View>
      </View>

      <View style={[styles.trackingSheet, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={[styles.handle, { backgroundColor: theme.border, alignSelf: "center", marginBottom: 18 }]} />
        <View style={styles.driverRow}>
          <View style={[styles.driverAvatar, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.driverInitials, { color: theme.primary }]}>DK</Text>
            <View style={[styles.verified, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.flex}>
            <View style={styles.inline}>
              <Text style={[styles.driverName, { color: theme.text }]}>Daniel Kalu</Text>
              <Ionicons name="star" size={14} color={theme.amber} />
              <Text style={[styles.rating, { color: theme.subtext }]}>4.9</Text>
            </View>
            <Text style={[styles.smallText, { color: theme.subtext }]}>White Toyota Corolla · RESQ 247</Text>
            <View style={styles.inline}>
              <View style={[styles.medicalBadge, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="medical" size={11} color={theme.primary} />
                <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "800" }}>FIRST AID TRAINED</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={() => notify("Calling Daniel…")} style={[styles.circleButtonLarge, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="call" size={20} color={theme.primary} />
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          {["Assigned", "Arriving", "Picked up", "Hospital"].map((label, index) => (
            <Pressable key={label} onPress={() => setProgress(index)} style={styles.progressItem}>
              <View style={styles.progressTrackWrap}>
                <View style={[styles.progressDot, { backgroundColor: index <= progress ? theme.primary : theme.border }]} />
                {index < 3 && <View style={[styles.progressLine, { backgroundColor: index < progress ? theme.primary : theme.border }]} />}
              </View>
              <Text style={[styles.progressLabel, { color: index <= progress ? theme.text : theme.muted }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.quickActions}>
          {[
            ["chatbubble-outline", "Message"],
            ["share-social-outline", "Share trip"],
            ["shield-checkmark-outline", "Safety"]
          ].map(([icon, label]) => (
            <Pressable key={label} onPress={() => notify(`${label} opened`)} style={[styles.quickAction, { backgroundColor: theme.bg }]}>
              <Ionicons name={icon as IconName} size={18} color={theme.primary} />
              <Text style={[styles.quickLabel, { color: theme.text }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.actionRow}>
          <PrimaryButton theme={theme} label="Complete demo trip" icon="checkmark" onPress={onComplete} style={styles.flex} />
          <Pressable onPress={() => setConfirmCancel(true)} style={[styles.cancelIcon, { borderColor: theme.danger }]}>
            <Ionicons name="close" size={22} color={theme.danger} />
          </Pressable>
        </View>
        <Text numberOfLines={1} style={[styles.destinationText, { color: theme.subtext }]}>Destination · {hospital.name}</Text>
      </View>
      <ConfirmModal
        visible={confirmCancel}
        theme={theme}
        title="Cancel this ride?"
        message="Your driver is already on the way. Emergency rides should only be cancelled when help is no longer needed."
        confirmLabel="Cancel ride"
        onClose={() => setConfirmCancel(false)}
        onConfirm={onBack}
      />
    </View>
  );
}

function PaymentScreen({
  theme,
  rideType,
  destination,
  onDone
}: {
  theme: Theme;
  rideType: "Emergency" | "ResQ Ride";
  destination: string;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState("Card");
  const [success, setSuccess] = useState(false);
  const total = rideType === "Emergency" ? "₦8,500" : "₦4,200";

  if (success) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.successCircle, { backgroundColor: "#DCFCE7" }]}>
          <Ionicons name="checkmark" size={44} color={theme.success} />
        </View>
        <Text style={[styles.successTitle, { color: theme.text }]}>Payment successful</Text>
        <Text style={[styles.centerCopy, { color: theme.subtext }]}>Your ResQ ride is confirmed. A receipt has been saved to Activity.</Text>
        <View style={[styles.referenceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>RIDE REFERENCE</Text>
          <Text style={[styles.reference, { color: theme.text }]}>RQ-2407-8821</Text>
        </View>
        <PrimaryButton theme={theme} label="Return home" icon="home" onPress={onDone} style={{ width: "100%" }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: theme.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader theme={theme} title="Confirm payment" onBack={onDone} top={insets.top} />
      <ScrollView contentContainerStyle={[styles.screenPad, { paddingBottom: 36 }]}>
        <View style={[styles.summaryCard, { backgroundColor: theme.primaryDark }]}>
          <View style={styles.inlineBetween}>
            <View>
              <Text style={styles.summaryEyebrow}>{rideType.toUpperCase()}</Text>
              <Text style={styles.summaryTotal}>{total}</Text>
            </View>
            <View style={styles.summaryIcon}><Ionicons name={rideType === "Emergency" ? "medical" : "car-sport"} size={26} color="#FFFFFF" /></View>
          </View>
          <View style={styles.summaryDivider} />
          <Text numberOfLines={1} style={styles.summaryDestination}>24 Kingsway Road → {destination}</Text>
          <Text style={styles.summaryMeta}>4.8 km · 12 min · Includes service fee</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Payment method</Text>
        {([
          { icon: "card", label: "Card", detail: "•••• 4821" },
          { icon: "logo-apple", label: "Apple Pay", detail: "Fast and secure" },
          { icon: "cash-outline", label: "Cash", detail: "Pay your driver" }
        ] as const).map(({ icon, label, detail }) => (
          <Pressable
            key={label}
            onPress={() => setMethod(label)}
            style={[styles.paymentMethod, { backgroundColor: theme.surface, borderColor: method === label ? theme.primary : theme.border }]}
          >
            <View style={[styles.iconTile, { backgroundColor: theme.surfaceAlt }]}>
              <Ionicons name={icon} size={21} color={theme.text} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{label}</Text>
              <Text style={[styles.smallText, { color: theme.subtext }]}>{detail}</Text>
            </View>
            <View style={[styles.radio, { borderColor: method === label ? theme.primary : theme.muted }]}>
              {method === label && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
            </View>
          </Pressable>
        ))}

        <View style={styles.promoRow}>
          <TextInput placeholder="Promo code" placeholderTextColor={theme.muted} style={[styles.promoInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} />
          <Pressable style={[styles.applyButton, { backgroundColor: theme.primarySoft }]}><Text style={[styles.link, { color: theme.primary }]}>Apply</Text></Pressable>
        </View>
        {rideType === "Emergency" && (
          <View style={[styles.notice, { backgroundColor: theme.dangerSoft }]}>
            <Ionicons name="information-circle" size={20} color={theme.danger} />
            <Text style={[styles.smallText, { color: theme.subtext, flex: 1 }]}>Emergency fare includes priority dispatch and medical-response equipment.</Text>
          </View>
        )}
        <PrimaryButton theme={theme} label={`Pay ${total}`} icon="lock-closed" onPress={() => setSuccess(true)} />
        <Text style={[styles.secureText, { color: theme.muted }]}>Payments are simulated in this prototype</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RemoteBookingScreen({ theme, onSubmit }: { theme: Theme; onSubmit: (emergency: boolean) => void }) {
  const insets = useSafeAreaInsets();
  const [emergency, setEmergency] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Add passenger details", "Enter a name and phone number to continue.");
      return;
    }
    onSubmit(emergency);
  };

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: theme.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 120 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Book for someone else</Text>
        <Text style={[styles.screenSubtitle, { color: theme.subtext }]}>Request a ResQ ride for a family member, friend, or patient.</Text>

        <View style={[styles.segment, { backgroundColor: theme.surface }]}>
          <Pressable onPress={() => setEmergency(false)} style={[styles.segmentItem, !emergency && { backgroundColor: theme.primary }]}>
            <Ionicons name="car-sport" size={17} color={!emergency ? "#FFFFFF" : theme.subtext} />
            <Text style={{ color: !emergency ? "#FFFFFF" : theme.subtext, fontWeight: "800" }}>Normal ride</Text>
          </Pressable>
          <Pressable onPress={() => setEmergency(true)} style={[styles.segmentItem, emergency && { backgroundColor: theme.danger }]}>
            <Ionicons name="medical" size={17} color={emergency ? "#FFFFFF" : theme.subtext} />
            <Text style={{ color: emergency ? "#FFFFFF" : theme.subtext, fontWeight: "800" }}>Emergency</Text>
          </Pressable>
        </View>

        <LabeledInput theme={theme} label="Passenger name" icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} />
        <LabeledInput theme={theme} label="Phone number" icon="call-outline" placeholder="+234 000 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <LabeledInput theme={theme} label="Pickup location" icon="navigate-outline" placeholder="Search or choose on map" />
        <LabeledInput theme={theme} label="Hospital or destination" icon="location-outline" placeholder="Where are they going?" />
        <LabeledInput theme={theme} label="Relationship" icon="people-outline" placeholder="e.g. Parent, friend, patient" />
        <LabeledInput theme={theme} label="Medical note (optional)" icon="document-text-outline" placeholder="Mobility needs, symptoms, helpful context" multiline />
        <PrimaryButton
          theme={theme}
          danger={emergency}
          icon={emergency ? "medical" : "checkmark"}
          label={emergency ? "Request emergency ride" : "Continue to payment"}
          onPress={submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ActivityScreen({ theme }: { theme: Theme }) {
  const insets = useSafeAreaInsets();
  const rides = [
    { date: "Today, 10:24", route: "Kingsway Rd → CityCare", type: "Emergency", amount: "₦8,500", icon: "medical" as IconName },
    { date: "Jul 27, 18:06", route: "Marina → Lekki Phase 1", type: "ResQ Ride", amount: "₦4,200", icon: "car-sport" as IconName },
    { date: "Jul 23, 09:40", route: "Yaba → St. Anne Hospital", type: "For Ada", amount: "₦5,100", icon: "people" as IconName }
  ];
  return (
    <ScrollView style={[styles.fill, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 110 }}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Activity</Text>
      <Text style={[styles.screenSubtitle, { color: theme.subtext }]}>Your recent rides and emergency requests.</Text>
      <View style={[styles.statsCard, { backgroundColor: theme.primaryDark }]}>
        <View><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Trips</Text></View>
        <View style={styles.statDivider} />
        <View><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>People helped</Text></View>
        <View style={styles.statDivider} />
        <View><Text style={styles.statValue}>42m</Text><Text style={styles.statLabel}>Time saved</Text></View>
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Recent rides</Text>
      {rides.map((ride) => (
        <Pressable key={ride.date} style={[styles.rideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.rideIcon, { backgroundColor: ride.type === "Emergency" ? theme.dangerSoft : theme.primarySoft }]}>
            <Ionicons name={ride.icon} size={20} color={ride.type === "Emergency" ? theme.danger : theme.primary} />
          </View>
          <View style={styles.flex}>
            <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.text }]}>{ride.route}</Text>
            <Text style={[styles.smallText, { color: theme.subtext }]}>{ride.date} · {ride.type}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{ride.amount}</Text>
            <Text style={[styles.completed, { color: theme.success }]}>Completed</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ProfileScreen({
  theme,
  themeMode,
  setThemeMode,
  onDriver,
  notify
}: {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  onDriver: () => void;
  notify: (message: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const menu = [
    ["heart-outline", "Emergency contacts", "2 contacts"],
    ["card-outline", "Payments", "Visa •••• 4821"],
    ["notifications-outline", "Notifications", "Enabled"],
    ["shield-checkmark-outline", "Safety centre", "Tips and tools"],
    ["help-circle-outline", "Help & support", "We’re here 24/7"]
  ];
  return (
    <ScrollView style={[styles.fill, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 112 }}>
      <View style={styles.profileHero}>
        <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.profileInitials}>AM</Text>
        </View>
        <Text style={[styles.profileName, { color: theme.text }]}>Alex Morgan</Text>
        <Text style={[styles.smallText, { color: theme.subtext }]}>alex@example.com · +234 801 234 5678</Text>
        <View style={[styles.safetyBadge, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
          <Text style={{ color: theme.primary, fontWeight: "800", fontSize: 11 }}>SAFETY PROFILE COMPLETE</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Appearance</Text>
      <View style={[styles.themeSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            style={[styles.themeOption, themeMode === mode && { backgroundColor: theme.primary }]}
          >
            <Ionicons
              name={mode === "light" ? "sunny-outline" : mode === "dark" ? "moon-outline" : "phone-portrait-outline"}
              size={17}
              color={themeMode === mode ? "#FFFFFF" : theme.subtext}
            />
            <Text style={{ color: themeMode === mode ? "#FFFFFF" : theme.subtext, fontWeight: "700", textTransform: "capitalize" }}>{mode}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {menu.map(([icon, label, detail], index) => (
          <Pressable key={label} onPress={() => notify(`${label} opened`)} style={[styles.menuRow, index < menu.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Ionicons name={icon as IconName} size={21} color={theme.primary} />
            <View style={styles.flex}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{label}</Text>
              <Text style={[styles.smallText, { color: theme.subtext }]}>{detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onDriver} style={[styles.driverModeCard, { backgroundColor: theme.primaryDark }]}>
        <View style={styles.driverModeIcon}><Ionicons name="speedometer" size={24} color="#FFFFFF" /></View>
        <View style={styles.flex}>
          <Text style={styles.driverModeTitle}>Switch to driver mode</Text>
          <Text style={styles.driverModeCopy}>Manage requests, trips and earnings</Text>
        </View>
        <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
      </Pressable>
    </ScrollView>
  );
}

function DriverDashboard({
  theme,
  onProfile,
  onRequest
}: {
  theme: Theme;
  onProfile: () => void;
  onRequest: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [online, setOnline] = useState(false);
  return (
    <View style={styles.fill}>
      <MapCanvas theme={theme} mode="driver" />
      <View style={[styles.driverHeader, { top: insets.top + 10, backgroundColor: theme.surface }]}>
        <Pressable onPress={onProfile} style={[styles.avatar, { backgroundColor: theme.primarySoft }]}><Text style={{ color: theme.primary, fontWeight: "800" }}>DK</Text></Pressable>
        <View style={styles.flex}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>GOOD MORNING</Text>
          <Text style={[styles.driverName, { color: theme.text }]}>Daniel</Text>
        </View>
        <View style={[styles.onlinePill, { backgroundColor: online ? "#DCFCE7" : theme.bg }]}>
          <View style={[styles.liveDot, { backgroundColor: online ? theme.success : theme.muted }]} />
          <Text style={{ color: online ? "#15803D" : theme.subtext, fontWeight: "800", fontSize: 11 }}>{online ? "ONLINE" : "OFFLINE"}</Text>
        </View>
      </View>
      <View style={[styles.driverSheet, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={[styles.handle, { backgroundColor: theme.border, alignSelf: "center", marginBottom: 18 }]} />
        <View style={styles.inlineBetween}>
          <View>
            <Text style={[styles.fieldLabel, { color: online ? theme.success : theme.muted }]}>{online ? "READY FOR REQUESTS" : "YOU’RE CURRENTLY OFFLINE"}</Text>
            <Text style={[styles.driverSheetTitle, { color: theme.text }]}>{online ? "Let’s help someone today" : "Go online when ready"}</Text>
          </View>
          <Switch value={online} onValueChange={setOnline} trackColor={{ true: theme.success }} />
        </View>
        <View style={styles.earningsGrid}>
          <StatCard theme={theme} icon="wallet-outline" value="₦24,850" label="Today" />
          <StatCard theme={theme} icon="time-outline" value="6h 20m" label="Online" />
          <StatCard theme={theme} icon="car-outline" value="8" label="Trips" />
        </View>
        <View style={[styles.acceptanceCard, { backgroundColor: theme.bg }]}>
          <View><Text style={[styles.cardTitle, { color: theme.text }]}>Weekly performance</Text><Text style={[styles.smallText, { color: theme.subtext }]}>92% acceptance · 4.9 rating</Text></View>
          <View style={[styles.scoreCircle, { borderColor: theme.success }]}><Text style={{ color: theme.success, fontWeight: "900" }}>A+</Text></View>
        </View>
        <PrimaryButton
          theme={theme}
          icon={online ? "notifications" : "power"}
          label={online ? "Simulate emergency request" : "Go online"}
          onPress={() => online ? onRequest() : setOnline(true)}
        />
      </View>
    </View>
  );
}

function DriverRequestScreen({
  theme,
  onDecline,
  onAccept
}: {
  theme: Theme;
  onDecline: () => void;
  onAccept: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(18);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (seconds === 0) onDecline();
  }, [seconds, onDecline]);

  return (
    <View style={[styles.fill, { backgroundColor: theme.bg }]}>
      <View style={{ height: "43%" }}><MapCanvas theme={theme} mode="driver" /></View>
      <View style={[styles.requestBanner, { paddingTop: insets.top + 10, backgroundColor: theme.danger }]}>
        <View style={styles.inline}>
          <View style={styles.alertIcon}><Ionicons name="medical" size={20} color={theme.danger} /></View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>Emergency request</Text>
            <Text style={styles.bannerCopy}>1.8 km away · Alert active</Text>
          </View>
          <View style={styles.countdown}><Text style={styles.countdownText}>{seconds}</Text></View>
        </View>
      </View>
      <View style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.inlineBetween}>
          <View>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>PASSENGER</Text>
            <Text style={[styles.requestName, { color: theme.text }]}>Alex Morgan</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: theme.dangerSoft }]}>
            <Ionicons name="flash" size={12} color={theme.danger} />
            <Text style={{ color: theme.danger, fontWeight: "900", fontSize: 10 }}>PRIORITY</Text>
          </View>
        </View>
        <JourneyCard theme={theme} hospital={hospitals[0]!} />
        <View style={[styles.emergencyNote, { backgroundColor: theme.dangerSoft }]}>
          <Ionicons name="document-text" size={19} color={theme.danger} />
          <View style={styles.flex}>
            <Text style={[styles.fieldLabel, { color: theme.danger }]}>EMERGENCY NOTE</Text>
            <Text style={[styles.smallText, { color: theme.text }]}>Passenger reports chest discomfort and needs a calm pickup.</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={onDecline} style={[styles.declineButton, { borderColor: theme.border }]}>
            <Text style={[styles.buttonLabel, { color: theme.text }]}>Decline</Text>
          </Pressable>
          <PrimaryButton theme={theme} label="Accept request" icon="checkmark" onPress={onAccept} style={styles.flex} />
        </View>
      </View>
    </View>
  );
}

function BottomNav({ route, onChange, theme }: { route: Route; onChange: (route: Route) => void; theme: Theme }) {
  const insets = useSafeAreaInsets();
  const items: { route: Route; icon: IconName; activeIcon: IconName; label: string }[] = [
    { route: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
    { route: "activity", icon: "receipt-outline", activeIcon: "receipt", label: "Activity" },
    { route: "remote", icon: "people-outline", activeIcon: "people", label: "For someone" },
    { route: "profile", icon: "person-outline", activeIcon: "person", label: "Profile" }
  ];
  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => {
        const active = route === item.route;
        return (
          <Pressable key={item.route} onPress={() => onChange(item.route)} style={styles.navItem}>
            <View style={[styles.navIconWrap, active && { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={active ? item.activeIcon : item.icon} size={21} color={active ? theme.primary : theme.muted} />
            </View>
            <Text style={[styles.navLabel, { color: active ? theme.primary : theme.muted }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrimaryButton({
  theme,
  label,
  icon,
  onPress,
  danger,
  style
}: {
  theme: Theme;
  label: string;
  icon?: IconName;
  onPress: () => void;
  danger?: boolean;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: danger ? theme.danger : theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style
      ]}
    >
      {icon && <Ionicons name={icon} size={19} color="#FFFFFF" />}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SocialButton({
  theme,
  icon,
  iconColor,
  label,
  onPress
}: {
  theme: Theme;
  icon: IconName;
  iconColor?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.78 : 1
        }
      ]}
    >
      <Ionicons name={icon} size={22} color={iconColor ?? theme.text} />
      <Text style={[styles.socialButtonText, { color: theme.text }]}>{label}</Text>
      <View style={{ width: 22 }} />
    </Pressable>
  );
}

function Wordmark({ theme }: { theme: Theme }) {
  return (
    <View style={styles.wordmark}>
      <View style={[styles.wordmarkIcon, { backgroundColor: theme.primary }]}>
        <Ionicons name="medical" size={13} color="#FFFFFF" />
      </View>
      <Text style={[styles.wordmarkText, { color: theme.text }]}>ResQ</Text>
    </View>
  );
}

function MapAction({ icon, theme }: { icon: IconName; theme: Theme }) {
  return (
    <Pressable style={[styles.mapAction, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
      <Ionicons name={icon} size={20} color={theme.text} />
    </Pressable>
  );
}

function ScreenHeader({ theme, title, onBack, top }: { theme: Theme; title: string; onBack: () => void; top: number }) {
  return (
    <View style={[styles.standardHeader, { paddingTop: top + 8, backgroundColor: theme.bg }]}>
      <Pressable onPress={onBack} style={[styles.circleButtonLarge, { backgroundColor: theme.surface }]}>
        <Ionicons name="chevron-back" size={22} color={theme.text} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <View style={{ width: 46 }} />
    </View>
  );
}

function JourneyCard({ theme, hospital }: { theme: Theme; hospital: (typeof hospitals)[number] }) {
  return (
    <View style={[styles.journeyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.journeyRail}>
        <View style={[styles.journeyDot, { backgroundColor: theme.primary }]} />
        <View style={[styles.journeyLine, { backgroundColor: theme.border }]} />
        <View style={[styles.journeyDot, { backgroundColor: theme.teal }]} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.fieldLabel, { color: theme.muted }]}>PICKUP</Text>
        <Text style={[styles.journeyValue, { color: theme.text }]}>24 Kingsway Road</Text>
        <View style={{ height: 18 }} />
        <Text style={[styles.fieldLabel, { color: theme.muted }]}>HOSPITAL</Text>
        <Text style={[styles.journeyValue, { color: theme.text }]}>{hospital.name}</Text>
      </View>
      <View style={[styles.etaPill, { backgroundColor: theme.primarySoft }]}>
        <Text style={{ color: theme.primary, fontWeight: "900", fontSize: 11 }}>{hospital.eta}</Text>
      </View>
    </View>
  );
}

function LabeledInput({
  theme,
  label,
  icon,
  placeholder,
  multiline,
  ...inputProps
}: {
  theme: Theme;
  label: string;
  icon: IconName;
  placeholder: string;
  multiline?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputShell, multiline && { minHeight: 92, alignItems: "flex-start" }, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name={icon} size={20} color={theme.primary} style={multiline ? { marginTop: 3 } : undefined} />
        <TextInput
          {...inputProps}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          style={[styles.textInput, multiline && { minHeight: 68, textAlignVertical: "top" }, { color: theme.text }]}
        />
      </View>
    </View>
  );
}

function StatCard({ theme, icon, value, label }: { theme: Theme; icon: IconName; value: string; label: string }) {
  return (
    <View style={[styles.statMini, { backgroundColor: theme.bg }]}>
      <Ionicons name={icon} size={18} color={theme.primary} />
      <Text style={[styles.statMiniValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.smallText, { color: theme.subtext }]}>{label}</Text>
    </View>
  );
}

function ConfirmModal({
  visible,
  theme,
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm
}: {
  visible: boolean;
  theme: Theme;
  title: string;
  message: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.modalIcon, { backgroundColor: theme.dangerSoft }]}>
            <Ionicons name="alert" size={26} color={theme.danger} />
          </View>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: theme.subtext }]}>{message}</Text>
          <Pressable onPress={onConfirm} style={[styles.modalDanger, { borderColor: theme.danger }]}>
            <Text style={{ color: theme.danger, fontWeight: "800" }}>{confirmLabel}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.modalKeep}>
            <Text style={{ color: theme.primary, fontWeight: "800" }}>Keep request active</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  fill: { flex: 1 },
  flex: { flex: 1 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  inlineBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topBar: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 58,
    borderRadius: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  avatar: { width: 39, height: 39, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  wordmark: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1, justifyContent: "center" },
  wordmarkIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  wordmarkText: { fontSize: 20, fontWeight: "900", letterSpacing: -0.7 },
  circleButton: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  circleButtonLarge: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  notificationDot: { position: "absolute", right: 8, top: 7, width: 6, height: 6, borderRadius: 3 },
  sos: { height: 37, borderRadius: 13, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 4 },
  sosText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", letterSpacing: 0.4 },
  mapActions: { position: "absolute", right: 15, gap: 8 },
  mapAction: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  homeSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
    overflow: "hidden"
  },
  sheetHandleArea: { height: 26, alignItems: "center", justifyContent: "center" },
  handle: { width: 42, height: 5, borderRadius: 4 },
  sheetPad: { paddingHorizontal: 20 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  homeTitle: { fontSize: 25, fontWeight: "900", letterSpacing: -0.8 },
  support: { fontSize: 14, marginTop: 3, marginBottom: 15 },
  locationField: { height: 58, borderWidth: 1, borderRadius: 18, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  locationIcon: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 9, lineHeight: 13, fontWeight: "900", letterSpacing: 0.8 },
  fieldValue: { fontSize: 14, fontWeight: "700", marginTop: 1 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  primaryButton: { minHeight: 56, borderRadius: 18, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  link: { fontSize: 13, fontWeight: "800" },
  hospitalRow: { gap: 10, paddingRight: 20 },
  hospitalCard: { width: 270, minHeight: 66, borderWidth: 1, borderRadius: 18, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  hospitalIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  hospitalName: { fontSize: 13, fontWeight: "800" },
  hospitalMeta: { fontSize: 11, marginTop: 3 },
  openBadge: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8 },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, minHeight: 78, flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navIconWrap: { width: 42, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 10, fontWeight: "800" },
  emergencyHeader: { minHeight: 375, paddingHorizontal: 20, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  screenHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  translucentButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  lightHeaderTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  searchVisual: { height: 175, alignItems: "center", justifyContent: "center" },
  radarOuter: { width: 158, height: 158, borderRadius: 79, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  radarMid: { width: 112, height: 112, borderRadius: 56, backgroundColor: "rgba(255,255,255,0.17)", alignItems: "center", justifyContent: "center" },
  ambulanceCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  emergencyTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", textAlign: "center", letterSpacing: -0.6 },
  emergencySupport: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center", marginTop: 6 },
  screenPad: { padding: 20, gap: 14 },
  elapsedCard: { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "800" },
  timerPill: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12 },
  timerText: { fontSize: 16, fontWeight: "900", fontVariant: ["tabular-nums"] },
  journeyCard: { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: "row", gap: 12 },
  journeyRail: { width: 14, alignItems: "center", paddingVertical: 4 },
  journeyDot: { width: 10, height: 10, borderRadius: 5 },
  journeyLine: { width: 2, height: 37 },
  journeyValue: { fontSize: 13, fontWeight: "700" },
  etaPill: { alignSelf: "center", paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10 },
  autoCallCard: { borderRadius: 20, borderWidth: 1, padding: 13, flexDirection: "row", alignItems: "center", gap: 11 },
  iconTile: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  smallText: { fontSize: 12, lineHeight: 17 },
  textAction: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  trackingTop: { position: "absolute", left: 15, right: 15, flexDirection: "row", gap: 10 },
  etaCard: { flex: 1, minHeight: 76, borderRadius: 21, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#0F172A", shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  etaTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  etaIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  trackingSheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 18, shadowColor: "#0F172A", shadowOpacity: 0.18, shadowRadius: 22, elevation: 18 },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  driverAvatar: { width: 57, height: 57, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  driverInitials: { fontSize: 18, fontWeight: "900" },
  verified: { position: "absolute", width: 18, height: 18, borderRadius: 9, right: -4, bottom: -3, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  driverName: { fontSize: 17, fontWeight: "900" },
  rating: { fontSize: 12, fontWeight: "700" },
  medicalBadge: { marginTop: 5, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 3 },
  progressRow: { flexDirection: "row", marginTop: 22, marginBottom: 18 },
  progressItem: { flex: 1 },
  progressTrackWrap: { flexDirection: "row", alignItems: "center" },
  progressDot: { width: 11, height: 11, borderRadius: 6 },
  progressLine: { height: 3, flex: 1 },
  progressLabel: { fontSize: 9, fontWeight: "700", marginTop: 7 },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, borderRadius: 14, minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  quickLabel: { fontSize: 11, fontWeight: "800" },
  cancelIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  destinationText: { fontSize: 11, textAlign: "center", marginTop: 10 },
  standardHeader: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  summaryCard: { borderRadius: 24, padding: 20 },
  summaryEyebrow: { color: "rgba(255,255,255,0.68)", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  summaryTotal: { color: "#FFFFFF", fontSize: 31, fontWeight: "900", marginTop: 2 },
  summaryIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  summaryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.18)", marginVertical: 15 },
  summaryDestination: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  summaryMeta: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 5 },
  paymentMethod: { borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 11, height: 11, borderRadius: 6 },
  promoRow: { flexDirection: "row", gap: 8 },
  promoInput: { flex: 1, height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 14 },
  applyButton: { width: 82, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  notice: { borderRadius: 15, padding: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  secureText: { textAlign: "center", fontSize: 11 },
  centerScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 15 },
  successCircle: { width: 92, height: 92, borderRadius: 46, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6 },
  centerCopy: { fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 320 },
  referenceCard: { width: "100%", borderRadius: 18, borderWidth: 1, padding: 17, alignItems: "center" },
  reference: { fontSize: 18, fontWeight: "900", letterSpacing: 1, marginTop: 4 },
  screenTitle: { fontSize: 29, fontWeight: "900", letterSpacing: -0.8 },
  screenSubtitle: { fontSize: 14, lineHeight: 20, marginTop: 5, marginBottom: 22 },
  segment: { padding: 5, borderRadius: 18, flexDirection: "row", marginBottom: 22 },
  segmentItem: { flex: 1, minHeight: 45, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "800", marginBottom: 7 },
  inputShell: { minHeight: 56, borderRadius: 17, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  textInput: { flex: 1, minHeight: 54, fontSize: 14 },
  statsCard: { borderRadius: 23, padding: 19, flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 24 },
  statValue: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", textAlign: "center" },
  statLabel: { color: "rgba(255,255,255,0.67)", fontSize: 10, marginTop: 3, textAlign: "center" },
  statDivider: { width: 1, height: 35, backgroundColor: "rgba(255,255,255,0.18)" },
  rideCard: { borderRadius: 19, borderWidth: 1, padding: 13, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 },
  rideIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  completed: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  profileHero: { alignItems: "center", marginBottom: 24 },
  profileAvatar: { width: 82, height: 82, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  profileInitials: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  profileName: { fontSize: 23, fontWeight: "900", marginTop: 11 },
  safetyBadge: { marginTop: 10, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5 },
  themeSelector: { borderRadius: 18, borderWidth: 1, padding: 5, flexDirection: "row", marginBottom: 20 },
  themeOption: { flex: 1, minHeight: 43, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  menuCard: { borderRadius: 21, borderWidth: 1, paddingHorizontal: 14, overflow: "hidden" },
  menuRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12 },
  driverModeCard: { borderRadius: 21, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  driverModeIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  driverModeTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  driverModeCopy: { color: "rgba(255,255,255,0.68)", fontSize: 11, marginTop: 3 },
  driverHeader: { position: "absolute", left: 14, right: 14, height: 66, borderRadius: 21, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 10, elevation: 6, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12 },
  onlinePill: { borderRadius: 11, paddingHorizontal: 9, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 5 },
  driverSheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 19, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 20, elevation: 16 },
  driverSheetTitle: { fontSize: 21, fontWeight: "900", letterSpacing: -0.5, marginTop: 2 },
  earningsGrid: { flexDirection: "row", gap: 8, marginTop: 18 },
  statMini: { flex: 1, borderRadius: 17, padding: 12 },
  statMiniValue: { fontSize: 15, fontWeight: "900", marginTop: 8 },
  acceptanceCard: { borderRadius: 18, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  requestBanner: { position: "absolute", left: 0, right: 0, top: 0, paddingHorizontal: 20, paddingBottom: 14 },
  alertIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  bannerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  bannerCopy: { color: "rgba(255,255,255,0.76)", fontSize: 11, marginTop: 2 },
  countdown: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },
  countdownText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] },
  requestCard: { position: "absolute", left: 0, right: 0, bottom: 0, top: "38%", borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, padding: 20 },
  requestName: { fontSize: 23, fontWeight: "900" },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, flexDirection: "row", alignItems: "center", gap: 3 },
  emergencyNote: { borderRadius: 17, padding: 12, flexDirection: "row", gap: 9, marginTop: 12 },
  declineButton: { minHeight: 56, paddingHorizontal: 22, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  buttonLabel: { fontSize: 15, fontWeight: "900" },
  modalScrim: { flex: 1, backgroundColor: "rgba(1,8,20,0.58)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 390, borderRadius: 26, padding: 22, alignItems: "center" },
  modalIcon: { width: 55, height: 55, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 21, fontWeight: "900", marginTop: 15, textAlign: "center" },
  modalMessage: { fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7, marginBottom: 18 },
  modalDanger: { minHeight: 51, width: "100%", borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  modalKeep: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  toast: { position: "absolute", top: (NativeStatusBar.currentHeight ?? 18) + 14, alignSelf: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 8, zIndex: 100 },
  welcomeScroll: {
    flexGrow: 1,
    paddingHorizontal: 24
  },
  welcomeContent: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center"
  },
  welcomeBrand: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 9
  },
  welcomeBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.34,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6
  },
  welcomeBrandText: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.8
  },
  welcomeHeading: {
    alignItems: "center",
    marginTop: 44,
    marginBottom: 38
  },
  welcomeTitle: {
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.8
  },
  welcomeSubtitle: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  welcomeForm: {
    width: "100%"
  },
  welcomeLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9
  },
  welcomeInputShell: {
    height: 60,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 17
  },
  welcomeInput: {
    flex: 1,
    height: 58,
    fontSize: 14
  },
  forgotAction: {
    minHeight: 47,
    alignSelf: "flex-end",
    justifyContent: "center"
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "800"
  },
  welcomePrimary: {
    height: 59,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 6,
    shadowColor: "#2563EB",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  welcomePrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900"
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 30
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth
  },
  orText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  socialStack: {
    gap: 13
  },
  socialButton: {
    height: 58,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "800"
  },
  prototypeNote: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 25
  }
});
