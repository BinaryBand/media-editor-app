import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, Title } from "react-native-paper";

import { useColorScheme } from "../hooks/useColorScheme";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#F5F5F5";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Settings</Title>
          <Text>Settings functionality coming soon...</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
