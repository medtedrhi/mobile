import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader() {
  const auth = useAuth();
  const name = auth.user?.name || 'Admin';
  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.name}>{name}</Text>
      <Text style={styles.sub}>Admin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  name: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 11, color: '#666' }
});
