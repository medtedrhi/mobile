import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StackActions } from '@react-navigation/native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const onSubmit = async () => {
    setLoading(true);
    try {
      const loginUser = await auth.login(email, password);
      // login() now returns the user object after fetchMe completes
      console.log('Login user:', loginUser);
      const role = loginUser?.role;
      console.log('User role:', role);
      if (!loginUser) {
        Alert.alert('Error', 'Failed to load user data. Please try again.');
        return;
      }
      if (role === 'admin') {
        navigation.dispatch(StackActions.replace('Admin'));
      } else if (role === 'seller') {
        navigation.dispatch(StackActions.replace('Seller'));
      } else {
        navigation.dispatch(StackActions.replace('Catalogue'));
      }
    } catch (e: any) {
      Alert.alert('Login failed', e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>
      <TextInput placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? 'Loading...' : 'Login'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Créer un compte" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, color: '#111' }
});
