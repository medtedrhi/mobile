import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { useNavigation, StackActions, useRoute } from '@react-navigation/native';

function HeaderTitleCreate() {
  const auth = useAuth();
  return <Text style={styles.headerTitle}>{auth.user?.name || 'Create'}</Text>;
}

function HeaderRightLogout() {
  const auth = useAuth();
  const navigation = useNavigation();
  return <Button title="Logout" onPress={async () => { await auth.logout(); navigation.dispatch(StackActions.replace('Catalogue')); }} />;
}

export default function AdminCostumeForm({ navigation }: any) {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const route: any = useRoute();
  const costumeParam = route.params?.costume;

  useEffect(() => {
    if (costumeParam) {
      setName(costumeParam.name || '');
      setDescription(costumeParam.description || '');
      setPrice(costumeParam.price ? String(costumeParam.price) : '');
      setImageUrl(costumeParam.image_url || costumeParam.imageUrl || '');
    }
  }, [costumeParam]);

  async function onSubmit() {
    if (!name) return Alert.alert('Validation', 'Name is required');
    setLoading(true);
    try {
      const body: any = { name, description, price: parseFloat(price) || 0 };
      if (imageUrl) body.image_url = imageUrl;
      if (auth.user?.id) body.seller_id = auth.user.id;

      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

      if (costumeParam && costumeParam.id) {
        // Edit existing costume
        const res = await fetch(`${API_BASE_URL}/costumes/${costumeParam.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }
        Alert.alert('Success', 'Costume updated');
        navigation.goBack();
        return;
      }

      // Create new costume
      const res = await fetch(`${API_BASE_URL}/costumes`, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }
      Alert.alert('Success', 'Costume created');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Unable to save');
    } finally {
      setLoading(false);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: costumeParam ? () => <Text style={styles.headerTitle}>{auth.user?.name || 'Edit'}</Text> : HeaderTitleCreate,
      headerRight: HeaderRightLogout,
    });
  }, [navigation, auth.user, costumeParam]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{costumeParam ? 'Edit Costume' : 'Create Costume'}</Text>
      <TextInput placeholder="Name" placeholderTextColor="#888" value={name} onChangeText={setName} style={[styles.input, styles.inputText]} />
      <TextInput placeholder="Description" placeholderTextColor="#888" value={description} onChangeText={setDescription} style={[styles.input, styles.inputText]} />
      <TextInput placeholder="Price" placeholderTextColor="#888" value={price} onChangeText={setPrice} style={[styles.input, styles.inputText]} keyboardType="numeric" />
      <TextInput placeholder="Image URL" placeholderTextColor="#888" value={imageUrl} onChangeText={setImageUrl} style={[styles.input, styles.inputText]} />
      <Button title={loading ? (costumeParam ? 'Saving...' : 'Creating...') : (costumeParam ? 'Save' : 'Create')} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  inputText: { color: '#000' }
});
