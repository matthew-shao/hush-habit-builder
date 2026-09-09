import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Quick emoji shortcuts — tapping one fills in the emoji and suggests a name
const EMOJI_SHORTCUTS = [
  { emoji: '✈️', suggest: 'Trip' },
  { emoji: '🏠', suggest: 'Home' },
  { emoji: '🎓', suggest: 'Education' },
  { emoji: '🌅', suggest: 'Retirement' },
  { emoji: '🎁', suggest: 'Gift' },
  { emoji: '💍', suggest: 'Ring' },
  { emoji: '🚗', suggest: 'Car' },
  { emoji: '💻', suggest: 'Tech' },
];

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function GoalAmountScreen({ navigation, route }) {
  const editingGoal = route?.params?.editingGoal;

  const [emoji, setEmoji] = useState(editingGoal?.emoji || '');
  const [name, setName] = useState(editingGoal?.name || '');
  const [amount, setAmount] = useState(editingGoal?.target ? String(editingGoal.target) : '500');

  function handleShortcut(item) {
    if (emoji === item.emoji) {
      // Tapping the active shortcut deselects it
      setEmoji('');
      setName('');
    } else {
      setEmoji(item.emoji);
      setName(item.suggest);
    }
  }

  function handleKey(key) {
    if (key === '') return;
    if (key === 'del') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setAmount(prev => {
        const next = prev === '0' ? key : prev + key;
        return parseInt(next, 10) > 99999 ? prev : next;
      });
    }
  }

  function handleNext() {
    if (!amount || parseInt(amount, 10) <= 0) return;
    navigation.navigate('GoalTimeline', {
      goalEmoji: emoji || '⭐',
      goalName: name.trim() || 'My goal',
      goalTarget: parseInt(amount, 10),
      isEditing: !!editingGoal,
      goalId: editingGoal?.id ?? null, // carry the id so saves update the right goal
    });
  }

  const canProceed = parseInt(amount, 10) > 0 && name.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{editingGoal ? 'Edit goal' : 'Set a goal'}</Text>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name + emoji row */}
        <View style={styles.nameRow}>
          <TextInput
            style={styles.emojiBox}
            value={emoji}
            onChangeText={setEmoji}
            placeholder="⭐"
            placeholderTextColor="#ccc"
            maxLength={2}
            textAlign="center"
            // On mobile this opens the emoji keyboard
            keyboardType="default"
          />
          <TextInput
            style={styles.nameInput}
            placeholder="Name your goal"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
          />
        </View>

        {/* Emoji shortcuts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.shortcutScroll}
          contentContainerStyle={styles.shortcutRow}
        >
          {EMOJI_SHORTCUTS.map((item) => (
            <TouchableOpacity
              key={item.emoji}
              style={[styles.shortcut, emoji === item.emoji && styles.shortcutActive]}
              onPress={() => handleShortcut(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutEmoji}>{item.emoji}</Text>
              <Text style={[styles.shortcutLabel, emoji === item.emoji && styles.shortcutLabelActive]}>
                {item.suggest}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount display */}
        <View style={styles.amountDisplay}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.amount}>{parseInt(amount, 10).toLocaleString()}</Text>
        </View>
        <Text style={styles.amountHint}>How much do you want to save?</Text>

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((key, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.key, key === '' && styles.keyEmpty]}
              onPress={() => handleKey(key)}
              activeOpacity={key === '' ? 1 : 0.6}
              disabled={key === ''}
            >
              <Text style={styles.keyText}>{key === 'del' ? '⌫' : key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottom}
      >
        <TouchableOpacity
          style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!canProceed}
        >
          <Text style={styles.primaryBtnText}>Next →</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: DARK },
  navTitle: { fontSize: 16, fontWeight: '700', color: DARK, flex: 1 },
  stepLabel: { fontSize: 12, color: MUTED },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  // Name + emoji
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  emojiBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: YELLOW, borderWidth: 1.5, borderColor: BORDER,
    fontSize: 22, textAlign: 'center', lineHeight: 48,
    padding: 0,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#ddd',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: DARK,
  },

  // Emoji shortcuts
  shortcutScroll: { marginBottom: 12 },
  shortcutRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  shortcut: {
    alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  shortcutActive: { borderColor: BORDER, backgroundColor: '#fffde7' },
  shortcutEmoji: { fontSize: 18 },
  shortcutLabel: { fontSize: 10, color: MUTED, fontWeight: '600' },
  shortcutLabelActive: { color: DARK },

  // Amount
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  currency: { fontSize: 22, color: '#aaa', marginBottom: 8, marginRight: 2 },
  amount: { fontSize: 52, fontWeight: '700', letterSpacing: -1.5, color: DARK },
  amountHint: { fontSize: 13, color: MUTED, textAlign: 'center', marginBottom: 10 },

  // Keypad
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 8,
  },
  key: {
    width: '30%', height: 50,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#ddd', flexGrow: 1,
  },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: 20, color: DARK },

  // Bottom CTA
  bottom: { padding: 16, paddingBottom: 8 },
  primaryBtn: {
    backgroundColor: YELLOW, borderRadius: 99,
    borderWidth: 2, borderColor: BORDER,
    paddingVertical: 15, alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
});
