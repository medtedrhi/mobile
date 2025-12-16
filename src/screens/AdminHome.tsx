import React, { useLayoutEffect } from 'react';
import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/AdminHeader';
import { useNavigation, StackActions } from '@react-navigation/native';

function HeaderRightLogoutHome() {
  const auth = useAuth();
  const navigation = useNavigation();
  return <Button title="Logout" onPress={async () => { await auth.logout(); navigation.dispatch(StackActions.replace('Catalogue')); }} />;
}

export default function AdminHome({ navigation }: any) {
  const auth = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: AdminHeader,
      headerRight: HeaderRightLogoutHome,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={() => navigation.navigate('AdminUsers')}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Manage Users</Text>
          <Text style={styles.cardSubtitle}>View, edit and remove users</Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate('AdminCostumes')}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Manage Costumes</Text>
          <Text style={styles.cardSubtitle}>Create, edit or remove costumes</Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  spacer8: { height: 8 },
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
  cardChevron: { fontSize: 22, color: '#999', paddingLeft: 10 }
});
