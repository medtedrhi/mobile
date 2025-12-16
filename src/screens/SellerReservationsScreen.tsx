import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

type Costume = {
  id: number;
  name: string;
  price: number;
  description?: string;
  size?: string;
};

type Reservation = {
  id: number;
  costume_id: number;
  client_name: string;
  client_phone: string;
  from_date: string;
  to_date: string;
  status: string;
};

export default function SellerReservationsScreen() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  async function fetchCostumes() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/seller/costumes`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCostumes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load costumes');
    } finally {
      setLoading(false);
    }
  }

  async function fetchReservationsForCostume(costumeId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/costumes/${costumeId}/reservations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load reservations');
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchCostumes();
    }, [])
  );

  const selectCostume = (costume: Costume) => {
    setSelectedCostume(costume);
    fetchReservationsForCostume(costume.id);
    setShowModal(true);
  };

  const isDateReserved = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    return reservations.some(res => {
      const fromDate = new Date(res.from_date);
      const toDate = new Date(res.to_date);
      const checkDate = new Date(dateStr);
      return checkDate >= fromDate && checkDate <= toDate;
    });
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleDateSelection = (date: Date) => {
    const dateStr = formatDateToString(date);
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  async function cancelReservation(reservationId: number) {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${auth.token}` },
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              Alert.alert('Success', 'Reservation cancelled');
              if (selectedCostume) {
                fetchReservationsForCostume(selectedCostume.id);
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  }

  const addReservation = async () => {
    if (!clientName.trim() || !clientPhone.trim() || selectedDates.length === 0) {
      Alert.alert('Error', 'Please fill in client name, phone, and select dates');
      return;
    }

    if (!selectedCostume) return;

    const sortedDates = selectedDates.sort();
    const fromDate = sortedDates[0];
    const toDate = sortedDates[sortedDates.length - 1];

    try {
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          costume_id: selectedCostume.id,
          client_name: clientName,
          client_phone: clientPhone,
          from_date: fromDate,
          to_date: toDate,
          status: 'confirmed',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      Alert.alert('Success', 'Reservation created');
      setClientName('');
      setClientPhone('');
      setSelectedDates([]);
      fetchReservationsForCostume(selectedCostume.id);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create reservation');
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(new Date(year, month, -firstDay.getDay() + i + 1));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthStr = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (loading && costumes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mes Costumes</Text>
      <FlatList
        data={costumes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.costumeCard}
            onPress={() => selectCostume(item)}
          >
            <View>
              <Text style={styles.costumeName}>{item.name}</Text>
              <Text style={styles.costumeInfo}>Size: {item.size || 'N/A'}</Text>
              <Text style={styles.costumePrice}>€{item.price}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.empty}>No costumes found</Text>
          </View>
        )}
      />

      {/* Calendar Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedCostume?.name}</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Calendar */}
            <View style={styles.calendarSection}>
              <View style={styles.monthNav}>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <Text style={styles.navBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>{monthStr}</Text>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <Text style={styles.navBtn}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Day headers */}
              <View style={styles.dayHeaders}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.dayHeader}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {days.map((date, idx) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const reserved = isDateReserved(date);
                  const dateStr = formatDateToString(date);
                  const selected = selectedDates.includes(dateStr);

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dayCell,
                        !isCurrentMonth && styles.dayOtherMonth,
                        reserved && styles.dayReserved,
                        selected && styles.daySelected,
                      ]}
                      onPress={() => !reserved && toggleDateSelection(date)}
                      disabled={reserved}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !isCurrentMonth && styles.dayOtherMonthText,
                          reserved && styles.dayReservedText,
                          selected && styles.daySelectedText,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reservation Form */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Add Reservation</Text>

              <Text style={styles.label}>Client Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter client name"
                value={clientName}
                onChangeText={setClientName}
              />

              <Text style={styles.label}>Client Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={clientPhone}
                onChangeText={setClientPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Selected Dates: {selectedDates.length}</Text>
              <View style={styles.selectedDatesContainer}>
                {selectedDates.length > 0 ? (
                  <Text style={styles.selectedDatesText}>
                    From: {selectedDates[0]} To: {selectedDates[selectedDates.length - 1]}
                  </Text>
                ) : (
                  <Text style={styles.noSelectedText}>Click on calendar to select dates</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, selectedDates.length === 0 && styles.submitBtnDisabled]}
                onPress={addReservation}
                disabled={selectedDates.length === 0}
              >
                <Text style={styles.submitBtnText}>Create Reservation</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Reservations */}
            <View style={styles.reservationsSection}>
              <Text style={styles.sectionTitle}>Existing Reservations</Text>
              {reservations.length > 0 ? (
                reservations.map((res) => (
                  <View key={res.id} style={styles.reservationItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resName}>{res.client_name}</Text>
                      <Text style={styles.resDetails}>Phone: {res.client_phone}</Text>
                      <Text style={styles.resDate}>
                        {new Date(res.from_date).toLocaleDateString()} - {new Date(res.to_date).toLocaleDateString()}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: res.status === 'confirmed' ? '#4caf50' : '#ff9800', marginTop: 8 }]}>
                        <Text style={styles.statusText}>{res.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => cancelReservation(res.id)}
                    >
                      <Text style={styles.cancelBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noRes}>No reservations yet</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#333',
  },
  costumeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  costumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  costumeInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  costumePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  empty: {
    color: '#999',
    fontSize: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  closeBtn: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Calendar
  calendarSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1976d2',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayOtherMonth: {
    backgroundColor: '#f5f5f5',
  },
  dayReserved: {
    backgroundColor: '#ffcdd2',
  },
  daySelected: {
    backgroundColor: '#c8e6c9',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  dayOtherMonthText: {
    color: '#bbb',
  },
  dayReservedText: {
    color: '#c62828',
    fontWeight: '700',
  },
  daySelectedText: {
    color: '#2e7d32',
    fontWeight: '700',
  },

  // Form
  formSection: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  selectedDatesContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedDatesText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '500',
  },
  noSelectedText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#bbb',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Reservations List
  reservationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  reservationItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cancelBtn: {
    backgroundColor: '#ff5252',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  resDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  noRes: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
