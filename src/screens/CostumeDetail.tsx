import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config';

export default function CostumeDetail({ route, navigation }: any) {
  const [costume, setCostume] = useState(route?.params?.costume || null);
  const [loading, setLoading] = useState(!costume);
  const costumeId = route?.params?.costumeId;

  useEffect(() => {
    if (!costume && costumeId) {
      fetchCostume();
    }
  }, [costumeId]);

  const fetchCostume = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/costumes/${costumeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCostume(data);
    } catch (e: any) {
      console.error('Failed to load costume:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!costume) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.sectionText}>Costume not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {costume.image_url ? (
        <Image source={{ uri: costume.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{costume.name}</Text>
          <Text style={styles.price}>€{costume.price?.toFixed ? costume.price.toFixed(2) : costume.price} / day</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{costume.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendeur</Text>
        <Text style={styles.sectionText}>{'name:' + (costume.seller?.name ?? 'Anonyme')}</Text>
        {costume.seller?.email ? <Text style={styles.sectionText}>{'email:' +costume.seller.email}</Text> : null}
        {costume.seller?.phone ? <Text style={styles.sectionText}>{'phone:' +costume.seller.phone}</Text> : null}
        {costume.seller?.address ? <Text style={styles.sectionText}>{'address:' +costume.seller.address}</Text> : null}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 220, borderRadius: 8, backgroundColor: '#eee' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  price: { fontSize: 18, fontWeight: '700', color: '#1f7a8c', marginTop: 6 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  badgeAvailable: {
    backgroundColor: '#4caf50',
  },
  badgeRented: {
    backgroundColor: '#f44336',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  sectionText: { marginTop: 6, color: '#444', lineHeight: 20 }
});
