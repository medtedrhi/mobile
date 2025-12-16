import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StackActions } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function RegisterScreen({ navigation }: any) {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'seller';
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      // Call register API to create account
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      // After registration, log in to get token and user
      const loginUser = await auth.login(email, password);
      // Redirect based on role (should be 'seller' for new registrations)
      const userRole = loginUser?.role;
      if (userRole === 'admin') {
        navigation.dispatch(StackActions.replace('Admin'));
      } else if (userRole === 'seller') {
        navigation.dispatch(StackActions.replace('Seller'));
      } else {
        navigation.dispatch(StackActions.replace('Catalogue'));
      }
    } catch (e: any) {
      Alert.alert('Register failed', e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput placeholder="Nom" placeholderTextColor="#999" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? 'Loading...' : 'Register'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="J'ai déjà un compte" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, color: '#111' }
});
