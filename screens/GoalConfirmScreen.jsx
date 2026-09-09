import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGoal } from '../context/GoalContext';

export default function GoalConfirmScreen({ navigation }) {
  const { latestGoal: goal } = useGoal();

  function handleDone() {
    // Go back to Mission tab and clear the setup stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Mission' }],
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>{goal?.emoji ?? '⭐'}</Text>
        </View>
        <Text style={styles.heading}>Goal set!</Text>
        <Text style={styles.sub}>
          Every deposit you make counts toward{' '}
          <Text style={styles.bold}>{goal?.name}</Text>. Keep your weekly habit going.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>See my goal →</Text>
        </TouchableOpacity>
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: YELLOW,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: { fontSize: 36 },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: DARK,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
  },
  bold: { fontWeight: '700', color: DARK },
  primaryBtn: {
    backgroundColor: YELLOW,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: BORDER,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
});
