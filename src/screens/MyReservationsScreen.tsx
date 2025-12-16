import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

type Reservation = {
  id: number;
  costume_id: number;
  viewing_time: string;
  client_name: string;
  client_phone: string;
  status: string;
  total_price: string;
  costume: {
    id: number;
    name: string;
    image_url: string;
  };
};

export default function MyReservationsScreen({ navigation }: any) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchReservations();
    }, [])
  );

  const cancelReservation = async (id: number) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this reservation?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            Alert.alert('Success', 'Reservation cancelled');
            fetchReservations();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'completed': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.costumeName}>{item.costume.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.info}>Name: {item.client_name}</Text>
            <Text style={styles.info}>Phone: {item.client_phone}</Text>
            <Text style={styles.date}>Viewing Time: {new Date(item.viewing_time).toLocaleString()}</Text>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelReservation(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.empty}>No reservations yet</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costumeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f7a8c',
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    color: '#999',
    fontSize: 16,
  },
});
