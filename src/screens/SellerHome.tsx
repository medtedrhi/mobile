import React, { useLayoutEffect } from 'react';
import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation, StackActions } from '@react-navigation/native';

function SellerHeader() {
  const auth = useAuth();
  return (
    <View>
      <Text style={styles.headerTitle}>{auth.user?.name || 'Seller'}</Text>
      <Text style={styles.headerSubtitle}>Seller Dashboard</Text>
    </View>
  );
}

function HeaderRightLogout() {
  const auth = useAuth();
  const navigation = useNavigation();
  return <Button title="Logout" onPress={async () => { await auth.logout(); navigation.dispatch(StackActions.replace('Catalogue')); }} />;
}

export default function SellerHome({ navigation }: any) {
  const auth = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: SellerHeader,
      headerRight: HeaderRightLogout,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={() => navigation.navigate('SellerCostumes')}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>My Costumes</Text>
          <Text style={styles.cardSubtitle}>View and manage your costumes</Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate('SellerReservations')}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Reservations</Text>
          <Text style={styles.cardSubtitle}>Manage costume reservations</Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate('Catalogue')}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Browse Catalogue</Text>
          <Text style={styles.cardSubtitle}>View all available costumes</Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#666' },
  cardChevron: { fontSize: 22, color: '#999', paddingLeft: 10 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  headerSubtitle: { fontSize: 12, color: '#666' }
});
