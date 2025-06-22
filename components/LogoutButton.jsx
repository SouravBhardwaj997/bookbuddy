import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import styles from "../assets/styles/profile.styles";
import { useAuthStore } from "../store/authStore";

const LogoutButton = () => {
  const { logout } = useAuthStore();
  const confirmLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "cancel", style: "cancel" },
      { text: "logout", onPress: () => logout(), style: "destructive" },
    ]);
  };
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={[COLORS.white]} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;
