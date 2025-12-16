import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      label: String(i).padStart(2, '0'),
      value: i
    });
  }
  return hours;
};

const generateMinutes = () => {
  const minutes = [];
  for (let i = 0; i < 60; i += 15) {
    minutes.push({
      label: String(i).padStart(2, '0'),
      value: i
    });
  }
  return minutes;
};

export default function ReservationFormScreen({ route, navigation }: any) {
  const { costume } = route.params || {};
  const auth = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showHourModal, setShowHourModal] = useState(false);
  const [showMinuteModal, setShowMinuteModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDateDisplay = () => {
    return selectedDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeDisplay = () => {
    return `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  };

  const getViewingTimeString = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hours = String(selectedHour).padStart(2, '0');
    const minutes = String(selectedMinute).padStart(2, '0');
    const seconds = '00';
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleDateChange = (text: string) => {
    // Parse date input YYYY-MM-DD
    const parts = text.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      try {
        const newDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(newDate.getTime())) {
          setSelectedDate(newDate);
        }
      } catch (e) {}
    }
  };

  const onSubmit = async () => {
    if (!clientName || !clientPhone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const viewingTime = getViewingTimeString();
      console.log('Sending reservation:', {
        costume_id: costume.id,
        viewing_time: viewingTime,
        client_name: clientName,
        client_phone: clientPhone,
      });
      
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No authorization header needed - guests can book without login
        },
        body: JSON.stringify({
          costume_id: costume.id,
          viewing_time: viewingTime,
          client_name: clientName,
          client_phone: clientPhone,
        }),
      });

      console.log('Response status:', res.status);
      const responseText = await res.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('Failed to parse JSON:', e);
        throw new Error(`Server error: ${responseText.substring(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      Alert.alert('Success', 'Viewing appointment created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      console.log('Error:', e);
      Alert.alert('Error', e.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule Viewing for {costume?.name}</Text>
        <Text style={styles.subtitle}>Book a time to see and try the costume</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Your Name *</Text>
        <TextInput
          placeholder="John Doe"
          placeholderTextColor="#888"
          value={clientName}
          onChangeText={setClientName}
          style={styles.input}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          placeholder="+1 234 567 8900"
          placeholderTextColor="#888"
          value={clientPhone}
          onChangeText={setClientPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Viewing Date *</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          value={formatDateDisplay().replace(/\s/g, '-').replace(/January|February|March|April|May|June|July|August|September|October|November|December/g, (month) => {
            const months: { [key: string]: string } = {
              'January': '01', 'February': '02', 'March': '03', 'April': '04',
              'May': '05', 'June': '06', 'July': '07', 'August': '08',
              'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };
            return months[month];
          })}
          onChangeText={handleDateChange}
          style={styles.input}
        />
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowDateModal(true)}
        >
          <Text style={styles.pickerButtonText}>📅 Pick Date</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Viewing Time *</Text>
        <View style={styles.timeContainer}>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowHourModal(true)}
          >
            <Text style={styles.timeButtonText}>{String(selectedHour).padStart(2, '0')}</Text>
          </TouchableOpacity>
          <Text style={styles.timeSeparator}>:</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowMinuteModal(true)}
          >
            <Text style={styles.timeButtonText}>{String(selectedMinute).padStart(2, '0')}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal visible={showDateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button title="Cancel" onPress={() => setShowDateModal(false)} />
                <Text style={styles.modalTitle}>Select Date</Text>
                <Button title="Done" onPress={() => setShowDateModal(false)} />
              </View>
              <FlatList
                data={Array.from({ length: 365 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  return { date: d, key: d.toString() };
                })}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dateOption,
                      selectedDate.toDateString() === item.date.toDateString() && styles.dateOptionSelected
                    ]}
                    onPress={() => setSelectedDate(item.date)}
                  >
                    <Text style={styles.dateOptionText}>{item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Hour Picker Modal */}
        <Modal visible={showHourModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button title="Cancel" onPress={() => setShowHourModal(false)} />
                <Text style={styles.modalTitle}>Select Hour</Text>
                <Button title="Done" onPress={() => setShowHourModal(false)} />
              </View>
              <FlatList
                data={hours}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      selectedHour === item.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => setSelectedHour(item.value)}
                  >
                    <Text style={styles.pickerOptionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Minute Picker Modal */}
        <Modal visible={showMinuteModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button title="Cancel" onPress={() => setShowMinuteModal(false)} />
                <Text style={styles.modalTitle}>Select Minute</Text>
                <Button title="Done" onPress={() => setShowMinuteModal(false)} />
              </View>
              <FlatList
                data={minutes}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      selectedMinute === item.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => setSelectedMinute(item.value)}
                  >
                    <Text style={styles.pickerOptionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <View style={{ marginTop: 20 }}>
          <Button title={loading ? 'Creating...' : 'Book Viewing Appointment'} onPress={onSubmit} disabled={loading} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, color: '#111' },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 8,
    color: '#333',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // Date picker option
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
  // Generic picker option
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
