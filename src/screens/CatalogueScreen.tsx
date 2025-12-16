import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Button, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import CostumeCard from '../components/CostumeCard';
import { useNavigation } from '@react-navigation/native';

import { API_BASE_URL } from '../config';

type Costume = {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  size?: string;
  seller?: { id?: number; name?: string; city?: string };
  is_available?: boolean;
};

export default function CatalogueScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [filteredCostumes, setFilteredCostumes] = useState<Costume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sizeInput, setSizeInput] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  async function fetchCostumes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/costumes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const costumesData = Array.isArray(data) ? data : [];
      setCostumes(costumesData);
      
      // Extract unique cities
      const uniqueCities = Array.from(new Set(costumesData.map((c: Costume) => c.seller?.city).filter(Boolean))) as string[];
      setCities(uniqueCities.sort());
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  // Filter costumes when filters or search query change
  useEffect(() => {
    let filtered = costumes;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query))
      );
    }
    
    // City filter
    if (selectedCity) {
      filtered = filtered.filter(c => c.seller?.city === selectedCity);
    }
    
    // Size filter (exact match)
    if (sizeInput.trim()) {
      filtered = filtered.filter(c => c.size && c.size.toLowerCase() === sizeInput.toLowerCase());
    }
    
    // Price filter
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    if (minPrice || maxPrice) {
      filtered = filtered.filter(c => c.price >= min && c.price <= max);
    }
    
    setFilteredCostumes(filtered);
  }, [costumes, selectedCity, sizeInput, searchQuery, minPrice, maxPrice]);

  useEffect(() => {
    fetchCostumes();
  }, []);

  // show Login/Register buttons in header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <Button title="Login" onPress={() => navigation.navigate('Login')} />
          <View style={{ width: 8 }} />
          <Button title="Register" onPress={() => navigation.navigate('Register')} />
        </View>
      ),
    });
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCostumes().then(() => setRefreshing(false));
  };

  return (
    <View style={styles.container}>
      {/* Search Bar and Filter Icon */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un costume..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterIcon}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
              {/* City Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Ville</Text>
                <ScrollView style={styles.cityList} nestedScrollEnabled={true}>
                  <TouchableOpacity
                    style={[styles.cityOption, !selectedCity && styles.cityOptionActive]}
                    onPress={() => setSelectedCity(null)}
                  >
                    <Text style={[styles.cityOptionText, !selectedCity && styles.cityOptionTextActive]}>Toutes les villes</Text>
                  </TouchableOpacity>
                  {cities.map(city => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.cityOption, selectedCity === city && styles.cityOptionActive]}
                      onPress={() => setSelectedCity(city)}
                    >
                      <Text style={[styles.cityOptionText, selectedCity === city && styles.cityOptionTextActive]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Size Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Taille</Text>
                <TextInput
                  style={styles.sizeInput}
                  placeholder="Entrer la taille (ex: M, L, XL)"
                  placeholderTextColor="#999"
                  value={sizeInput}
                  onChangeText={setSizeInput}
                />
              </View>

              {/* Price Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Prix</Text>
                <View style={styles.priceInputs}>
                  <TextInput
                    style={[styles.priceInput, { flex: 1, marginRight: 8 }]}
                    placeholder="Min (€)"
                    placeholderTextColor="#999"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={[styles.priceInput, { flex: 1 }]}
                    placeholder="Max (€)"
                    placeholderTextColor="#999"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  setSelectedCity(null);
                  setSizeInput('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 24 }} size="large" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>Erreur: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCostumes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CostumeCard
              name={item.name}
              description={item.description}
              price={item.price}
              image_url={item.image_url}
              onPress={() => navigation.navigate('CostumeDetail', { costumeId: item.id })}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Aucun costume trouvé</Text>
            </View>
          }
          contentContainerStyle={filteredCostumes.length === 0 ? styles.flexGrow : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#333',
  },
  filterIcon: {
    marginLeft: 8,
    padding: 8,
  },
  filterIconText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  filterContainer: {
    maxHeight: 350,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  filterSection: {
    marginVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cityList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cityOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  cityOptionText: {
    fontSize: 14,
    color: '#666',
  },
  cityOptionTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
  sizeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  priceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexGrow: {
    flexGrow: 1,
  },
  empty: {
    fontSize: 16,
    color: '#666',
  },
  error: {
    color: '#b00020',
  },
});
