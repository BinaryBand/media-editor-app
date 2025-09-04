import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Platform, StatusBar } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

import { Colors } from "./constants/Colors";
import { useColorScheme } from "./hooks/useColorScheme";
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={Colors[colorScheme ?? "light"].background}
        />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            headerStyle: {
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
            headerTintColor: Colors[colorScheme ?? "light"].text,
            tabBarStyle: Platform.select({
              ios: {
                position: "absolute",
              },
              default: {},
            }),
          }}
        >
          <Tab.Screen
            name="Music Player"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="musical-notes" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
