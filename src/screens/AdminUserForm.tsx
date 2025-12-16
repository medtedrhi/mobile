import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";


export default function AdminUserForm({ navigation }: any) {
  const auth = useAuth();
  const route: any = useRoute();
  const userParam = route.params?.user;

  const [name, setName] = useState(userParam?.name || '');
  const [email, setEmail] = useState(userParam?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(userParam?.role || 'seller');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the route param changes, update form fields
    if (userParam) {
      setName(userParam.name || '');
      setEmail(userParam.email || '');
      setRole(userParam.role || 'seller');
    }
  }, [userParam]);

  async function onSubmit() {
    if (!name || !email || (userParam ? false : !password)) return Alert.alert('Validation', 'Please fill required fields');
    setLoading(true);
    try {
      if (userParam && userParam.id) {
        // Edit existing user via protected endpoint
        if (!auth.token) throw new Error('Admin token required');
        const res = await fetch(`${API_BASE_URL}/users/${userParam.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify({ name, email, role, ...(password ? { password } : {}) }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `HTTP ${res.status}`);
        }
        Alert.alert('Success', 'User updated');
        navigation.goBack();
        return;
      }

      // Create new user: prefer admin POST /users when authenticated, otherwise use public /register
      const url = auth.token ? `${API_BASE_URL}/users` : `${API_BASE_URL}/register`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      Alert.alert('Success', 'User created');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to save user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userParam ? 'Edit User' : 'Create User'}</Text>
      <TextInput placeholder="Name" placeholderTextColor="#888" value={name} onChangeText={setName} style={[styles.input, styles.inputText]} />
      <TextInput placeholder="Email" placeholderTextColor="#888" value={email} onChangeText={setEmail} style={[styles.input, styles.inputText]} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" placeholderTextColor="#888" value={password} onChangeText={setPassword} style={[styles.input, styles.inputText]} secureTextEntry />
      <View style={[styles.input, { padding: 0 }]}>
  <Picker
    selectedValue={role}
    onValueChange={(value) => setRole(value)}
    dropdownIconColor="#888"
    style={{ color: "#000" }}   
  >
    
    <Picker.Item label="Admin" value="admin" />
    <Picker.Item label="Seller" value="seller" />
  </Picker>
</View>

      <Button title={loading ? (userParam ? 'Saving...' : 'Creating...') : (userParam ? 'Save' : 'Create')} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  inputText: { color: '#000' }
});
