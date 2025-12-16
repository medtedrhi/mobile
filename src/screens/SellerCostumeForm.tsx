import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { useRoute } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

export default function SellerCostumeForm({ navigation }: any) {
  const auth = useAuth();
  const route: any = useRoute();
  const costumeParam = route.params?.costume;

  const [name, setName] = useState(costumeParam?.name || '');
  const [description, setDescription] = useState(costumeParam?.description || '');
  const [price, setPrice] = useState(costumeParam?.price ? String(costumeParam.price) : '');
  const [imageUrl, setImageUrl] = useState(costumeParam?.image_url || costumeParam?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (costumeParam) {
      setName(costumeParam.name || '');
      setDescription(costumeParam.description || '');
      setPrice(costumeParam.price ? String(costumeParam.price) : '');
      setImageUrl(costumeParam.image_url || costumeParam.imageUrl || '');
    }
  }, [costumeParam]);

  async function pickImage() {
    try {
      const image = await ImagePicker.openPicker({
        width: 1024,
        height: 1024,
        cropping: false,
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      if (!image.data) {
        Alert.alert('Error', 'Could not read image data');
        return;
      }

      setUploading(true);
      try {
        const base64Image = `data:${image.mime};base64,${image.data}`;
        
        const res = await fetch(`${API_BASE_URL}/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setImageUrl(data.url);
        Alert.alert('Success', 'Image uploaded!');
      } catch (e: any) {
        Alert.alert('Upload Error', e.message || 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    } catch (e: any) {
      if (e.code === 'E_CANCELLED') {
        return; // User cancelled, don't show error
      }
      Alert.alert('Error', e.message || 'Failed to pick image');
    }
  }

  async function onSubmit() {
    if (!name) return Alert.alert('Validation', 'Name is required');
    setLoading(true);
    try {
      const body: any = { name, description, price: parseFloat(price) || 0 };
      if (imageUrl) body.image_url = imageUrl;
      if (auth.user?.id) body.seller_id = auth.user.id;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

      if (costumeParam && costumeParam.id) {
        // Edit existing costume
        const res = await fetch(`${API_BASE_URL}/costumes/${costumeParam.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }
        Alert.alert('Success', 'Costume updated');
        navigation.goBack();
        return;
      }

      // Create new costume
      const res = await fetch(`${API_BASE_URL}/costumes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{costumeParam ? 'Edit Costume' : 'Create Costume'}</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={[styles.input, styles.inputText]}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.inputText]}
      />
      <TextInput
        placeholder="Price"
        placeholderTextColor="#888"
        value={price}
        onChangeText={setPrice}
        style={[styles.input, styles.inputText]}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Costume Image</Text>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>📷 No image</Text>
        </View>
      )}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
        <Text style={styles.uploadButtonText}>
          {uploading ? 'Uploading...' : 'Pick Image from Gallery'}
        </Text>
      </TouchableOpacity>

      <Button
        title={
          loading
            ? costumeParam
              ? 'Saving...'
              : 'Creating...'
            : costumeParam
            ? 'Save'
            : 'Create'
        }
        onPress={onSubmit}
        disabled={loading || uploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  inputText: { fontSize: 15, color: '#000' },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#1f7a8c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
