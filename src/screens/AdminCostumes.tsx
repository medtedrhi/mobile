import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, StackActions, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function HeaderTitleCostumes() {
  const auth = useAuth();
  return <Text style={styles.headerTitle}>{auth.user?.name || 'Costumes'}</Text>;
}

function HeaderRightLogout() {
  const auth = useAuth();
  const navigation = useNavigation();
  return <Button title="Logout" onPress={async () => { await auth.logout(); navigation.dispatch(StackActions.replace('Catalogue')); }} />;
}

export default function AdminCostumes({ navigation }: any) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [costumes, setCostumes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCostumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/costumes`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => null);
      setCostumes(Array.isArray(data) ? data : (data?.costumes || []));
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: HeaderTitleCostumes,
      headerRight: HeaderRightLogout,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchCostumes();
    }, [fetchCostumes])
  );

  async function onDelete(id: number) {
    Alert.alert('Confirm', 'Supprimer ce costume ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          const headers: Record<string,string> = { 'Content-Type': 'application/json' };
          if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
          const res = await fetch(`${API_BASE_URL}/costumes/${id}`, { method: 'DELETE', headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setCostumes(costumes.filter(c => c.id !== id));
        } catch (e: any) {
          Alert.alert('Erreur', e.message || 'Impossible de supprimer');
        }
      } }
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Costumes</Text>
      <Button title="Create Costume" onPress={() => navigation.navigate('AdminCostumeForm')} />
      {loading ? <ActivityIndicator style={styles.spinner} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : (
        <FlatList
          data={costumes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.price} — {item.seller_id ? `seller:${item.seller_id}` : ''}</Text>
              </View>
              <View style={styles.spacerWidth8} />
              <Button title="Edit" onPress={() => navigation.navigate('AdminCostumeForm', { costume: item })} />
              <View style={{ width: 8 }} />
              <Button title="Delete" color="#b00020" onPress={() => onDelete(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontWeight: '700' },
  meta: { color: '#666' }
  ,
  headerTitle: { fontWeight: '700' },
  spinner: { marginTop: 12 },
  errorText: { color: '#b00020', marginTop: 12 },
  flex1: { flex: 1 },
  spacerWidth8: { width: 8 }
});
