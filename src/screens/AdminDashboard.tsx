import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigation, StackActions, useFocusEffect } from '@react-navigation/native';

// Header components defined at module scope to avoid recreating them on each render
function HeaderCreate() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.createBtn} onPress={() => navigation.dispatch(StackActions.push('AdminCreateUser'))}>
      <Text style={styles.createBtnText}>Create</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard({ navigation }: any) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);



  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerRight: HeaderCreate,
    });
  }, [navigation]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { status: 401 });
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => null);
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (e: any) {
      if (e.status === 401) {
        setError('Unauthorized. Please login as admin.');
      } else {
        setError(e.message || 'Erreur réseau');
      }
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      navigation.dispatch(StackActions.replace('Login'));
      return;
    }
    if (auth.user && auth.user.role !== 'admin') {
      navigation.dispatch(StackActions.replace('Catalogue'));
      return;
    }
  }, [auth.loading, auth.user, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  async function onDeleteUser(id: number) {
    Alert.alert('Confirm', 'Supprimer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
          const res = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers,
          });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `HTTP ${res.status}`);
          }
          setUsers(users.filter(u => u.id !== id));
        } catch (e: any) {
          Alert.alert('Erreur', e.message || 'Impossible de supprimer');
        }
      } }
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Title removed and logout removed per request. Use header create button to add users. */}
      {loading ? <ActivityIndicator style={styles.spinner} /> : null}
      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.spacer8} />
          <Button title="Aller au login" onPress={() => navigation.navigate('Login')} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.email} — {item.role}</Text>
              </View>
              <View style={styles.spacerWidth8} />
                <Button title="Edit" onPress={() => navigation.navigate('AdminEditUser', { user: item })} />
                <View style={{ width: 8 }} />
                <Button title="Delete" color="#b00020" onPress={() => onDeleteUser(item.id)} />
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
  meta: { color: '#666' },
  headerTitle: { fontWeight: '700' },
  spinner: { marginTop: 12 },
  errorBlock: { marginTop: 12 },
  errorText: { color: '#b00020' },
  spacer8: { height: 8 },
  flex1: { flex: 1 },
  spacerWidth8: { width: 8 },
  createBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0a84ff', borderRadius: 6, marginRight: 8 },
  createBtnText: { color: '#fff', fontWeight: '600' },
});

