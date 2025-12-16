import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  id?: number | string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sellerName?: string;
  isAvailable?: boolean;
  onPress?: () => void;
};

export default function CostumeCard({ name, description, price, image_url, sellerName, isAvailable, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      {image_url ? (
        <Image source={{ uri: image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text numberOfLines={1} style={[styles.title, { flex: 1 }]}>{name}</Text>
        </View>
        {sellerName ? <Text style={styles.seller}>Par {sellerName}</Text> : null}
        {description ? <Text numberOfLines={2} style={styles.description}>{description}</Text> : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.price}>€{price?.toFixed ? price.toFixed(2) : price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222'
  },
  seller: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  description: {
    fontSize: 13,
    color: '#444',
    marginTop: 6
  },
  meta: {
    marginLeft: 8,
    alignItems: 'flex-end'
  },
  price: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1f7a8c'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeAvailable: {
    backgroundColor: '#4caf50',
  },
  badgeRented: {
    backgroundColor: '#f44336',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  }
});
