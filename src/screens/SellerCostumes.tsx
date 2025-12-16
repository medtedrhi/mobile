import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, StackActions, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function HeaderCreate() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('SellerCostumeForm')}>
      <Text style={styles.createBtnText}>Create</Text>
    </TouchableOpacity>
  );
}

export default function SellerCostumes({ navigation }: any) {
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
      const data = await res.json();
      const allCostumes = Array.isArray(data) ? data : (data?.costumes || []);
      // Filter to show only costumes belonging to this seller
      const myCostumes = allCostumes.filter((c: any) => c.seller_id === auth.user?.id);
      setCostumes(myCostumes);
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerRight: HeaderCreate,
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
      {loading ? <ActivityIndicator style={styles.spinner} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : (
        <FlatList
          data={costumes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.price} — {item.description}</Text>
              </View>
              <View style={styles.spacerWidth8} />
              <Button title="Edit" onPress={() => navigation.navigate('SellerCostumeForm', { costume: item })} />
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
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontWeight: '700' },
  meta: { color: '#666' },
  spinner: { marginTop: 12 },
  errorText: { color: '#b00020', marginTop: 12 },
  flex1: { flex: 1 },
  spacerWidth8: { width: 8 },
  createBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0a84ff', borderRadius: 6, marginRight: 8 },
  createBtnText: { color: '#fff', fontWeight: '600' },
});
