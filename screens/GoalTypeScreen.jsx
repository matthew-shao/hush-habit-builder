import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// "Something I want" removed (redundant with My own goal)
// "Emergency fund" removed (that's what the account already is)
// "Retirement" added as a meaningful long-term goal
const GOAL_TYPES = [
  { id: 'trip', emoji: '✈️', label: 'Trip or experience', sub: 'Save toward a getaway' },
  { id: 'retirement', emoji: '🌅', label: 'Retirement', sub: 'Build toward the long run' },
  { id: 'gift', emoji: '🎁', label: 'Gift for someone', sub: 'Make it memorable' },
  { id: 'custom', emoji: '✏️', label: 'My own goal', sub: 'Name it yourself' },
];

export default function GoalTypeScreen({ navigation }) {
  function handleSelect(type) {
    navigation.navigate('GoalAmount', { goalType: type });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Choose a goal</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          What are you investing toward? Pick the one that feels right.
        </Text>
        {GOAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.tile}
            onPress={() => handleSelect(type)}
            activeOpacity={0.7}
          >
            <View style={styles.tileIcon}>
              <Text style={styles.tileEmoji}>{type.emoji}</Text>
            </View>
            <View style={styles.tileText}>
              <Text style={styles.tileLabel}>{type.label}</Text>
              <Text style={styles.tileSub}>{type.sub}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const YELLOW = '#f5c842';
const BG = '#f5f0f8';
const DARK = '#111';
const BORDER = '#333';
const MUTED = '#777';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    backgroundColor: BG,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: DARK },
  navTitle: { fontSize: 16, fontWeight: '700', color: DARK },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 16,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ddd',
    padding: 14,
    marginBottom: 10,
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: YELLOW,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: { fontSize: 20 },
  tileText: { flex: 1 },
  tileLabel: { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 2 },
  tileSub: { fontSize: 12, color: MUTED },
  arrow: { fontSize: 18, color: MUTED },
});
