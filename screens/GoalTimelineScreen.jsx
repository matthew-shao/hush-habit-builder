import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGoal } from '../context/GoalContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth();
const CURRENT_YEAR = NOW.getFullYear();

// Trimmed to the most useful presets
const PRESETS = [
  { label: '6mo', months: 6 },
  { label: '1yr', months: 12 },
  { label: '2yr', months: 24 },
  { label: '5yr', months: 60 },
];

const MAX_MONTHS = 240; // 20 years cap — 137 years is not a goal
const AUTO_ADJUST_MAX_MULTIPLIER = 2;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

// Always show months — no years conversion
function formatMonths(m) {
  return `${m} month${m !== 1 ? 's' : ''}`;
}

function monthsBetweenNow(month, year) {
  return (year - CURRENT_YEAR) * 12 + (month - CURRENT_MONTH);
}

export default function GoalTimelineScreen({ navigation, route }) {
  const { goalEmoji, goalName, goalTarget, isEditing, goalId } = route.params;
  const { saveGoal, weeklyDeposit, setWeeklyDeposit, totalContributed } = useGoal();
  const [depositUpdated, setDepositUpdated] = useState(false);

  const [mode, setMode] = useState('duration');
  const [monthInput, setMonthInput] = useState('12');
  const [noRush, setNoRush] = useState(false);

  // Date mode state
  const [pickedMonth, setPickedMonth] = useState((CURRENT_MONTH + 12) % 12);
  const [pickedYear, setPickedYear] = useState(CURRENT_YEAR + 1);

  const remaining = Math.max(0, goalTarget - totalContributed);
  const naturalWeeks = weeklyDeposit > 0 ? Math.ceil(remaining / weeklyDeposit) : null;
  const naturalMonths = naturalWeeks ? Math.ceil(naturalWeeks / 4.33) : null;

  const parsedMonths = Math.min(parseInt(monthInput, 10) || 1, MAX_MONTHS);

  const activeMonths = mode === 'date'
    ? Math.max(1, monthsBetweenNow(pickedMonth, pickedYear))
    : parsedMonths;

  const weeksNeeded = Math.round(activeMonths * 4.33);
  const weeklyNeeded = !noRush && weeksNeeded > 0
    ? Math.ceil(remaining / weeksNeeded)
    : null;

  const canAutoAdjust = weeklyNeeded
    && weeklyNeeded > weeklyDeposit
    && weeklyNeeded <= weeklyDeposit * AUTO_ADJUST_MAX_MULTIPLIER;

  const isUnreachable = weeklyNeeded
    && weeklyNeeded > weeklyDeposit * AUTO_ADJUST_MAX_MULTIPLIER;

  function handleKey(key) {
    if (noRush) return;
    if (key === '') return;
    if (key === 'del') {
      setMonthInput(prev => prev.length > 1 ? prev.slice(0, -1) : '1');
    } else {
      setMonthInput(prev => {
        const next = prev === '0' || prev === '1' && key !== '0' ? key : prev + key;
        return parseInt(next, 10) > MAX_MONTHS ? prev : next;
      });
    }
  }

  function selectPreset(m) {
    setNoRush(false);
    setMode('duration');
    setMonthInput(String(m));
  }

  function isValidDate(month, year) {
    if (year > CURRENT_YEAR) return true;
    if (year === CURRENT_YEAR) return month > CURRENT_MONTH;
    return false;
  }

  const yearOptions = Array.from({ length: 21 }, (_, i) => CURRENT_YEAR + i);

  function handleSetGoal() {
    saveGoal({
      ...(goalId ? { id: goalId } : {}), // include id if editing so context updates not adds
      emoji: goalEmoji,
      name: goalName,
      target: goalTarget,
      timeline: noRush ? 'none' : `${activeMonths}mo`,
      timelineMonths: noRush ? null : activeMonths,
      targetDate: mode === 'date' ? `${MONTH_NAMES[pickedMonth]} ${pickedYear}` : null,
    });
    if (isEditing) {
      navigation.reset({ index: 0, routes: [{ name: 'Mission' }] });
    } else {
      navigation.navigate('GoalConfirm');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>When by?</Text>
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>We only count what you contribute — no projections.</Text>

        {/* Current pace — or already reached */}
        {remaining <= 0 ? (
          <View style={[styles.paceCard, { borderColor: '#86efac', backgroundColor: '#f0fdf4' }]}>
            <Text style={[styles.paceMeta, { color: '#166534' }]}>Goal already reached 🎉</Text>
            <Text style={[styles.paceValue, { color: '#166534' }]}>
              You've contributed ${totalContributed.toLocaleString()} — that covers this goal.
            </Text>
          </View>
        ) : naturalMonths && naturalMonths <= MAX_MONTHS ? (
          <View style={styles.paceCard}>
            <Text style={styles.paceMeta}>At your current ${weeklyDeposit}/week</Text>
            <Text style={styles.paceValue}>
              You'd reach ${goalTarget.toLocaleString()} in{' '}
              <Text style={styles.paceHighlight}>{formatMonths(naturalMonths)}</Text>
            </Text>
          </View>
        ) : naturalMonths && !isUnreachable ? (
          <View style={[styles.paceCard, { borderColor: '#fcd34d', backgroundColor: '#fff8e1' }]}>
            <Text style={[styles.paceMeta, { color: '#92400e' }]}>At your current ${weeklyDeposit}/week</Text>
            <Text style={[styles.paceValue, { color: '#92400e' }]}>
              This would take over 20 years at your current deposit. Consider a higher deposit or a smaller goal.
            </Text>
          </View>
        ) : null}

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'duration' && styles.modeBtnActive]}
            onPress={() => { setMode('duration'); setNoRush(false); }}
          >
            <Text style={[styles.modeBtnText, mode === 'duration' && styles.modeBtnTextActive]}>
              Duration
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'date' && styles.modeBtnActive]}
            onPress={() => { setMode('date'); setNoRush(false); }}
          >
            <Text style={[styles.modeBtnText, mode === 'date' && styles.modeBtnTextActive]}>
              Target date
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── DURATION MODE ── */}
        {mode === 'duration' && (
          <>
            {/* Preset chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.presetScroll}
              contentContainerStyle={styles.presetRow}
            >
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.preset, !noRush && parsedMonths === p.months && styles.presetActive]}
                  onPress={() => selectPreset(p.months)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, !noRush && parsedMonths === p.months && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.preset, noRush && styles.presetActive]}
                onPress={() => setNoRush(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetText, noRush && styles.presetTextActive]}>No rush</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Month display */}
            {!noRush && (
              <View style={styles.monthDisplay}>
                <Text style={styles.monthValue}>{formatMonths(parsedMonths)}</Text>
                {weeklyNeeded && (
                  <Text style={styles.monthSub}>
                    you'd need to deposit ${weeklyNeeded}/week
                  </Text>
                )}
              </View>
            )}

            {/* Keypad */}
            {!noRush && (
              <View style={styles.keypad}>
                {KEYS.map((key, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.key, key === '' && styles.keyEmpty]}
                    onPress={() => handleKey(key)}
                    activeOpacity={key === '' ? 1 : 0.6}
                    disabled={key === ''}
                  >
                    <Text style={styles.keyText}>{key === 'del' ? '⌫' : key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {noRush && (
              <View style={styles.noRushCard}>
                <Text style={styles.noRushEmoji}>🌱</Text>
                <Text style={styles.noRushTitle}>No deadline</Text>
                <Text style={styles.noRushText}>We'll track your contributions as you go. You can always add a timeline later.</Text>
              </View>
            )}
          </>
        )}

        {/* ── DATE MODE ── */}
        {mode === 'date' && (
          <View style={styles.datePicker}>
            <Text style={styles.dateDisplay}>
              {MONTH_NAMES[pickedMonth]} {pickedYear}
            </Text>
            {weeklyNeeded && (
              <Text style={styles.dateSub}>
                {formatMonths(activeMonths)} away · you'd need ${weeklyNeeded}/week
              </Text>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={58}
              snapToAlignment="start"
              style={styles.monthScroll}
              contentContainerStyle={styles.scrollRowContent}
            >
              {MONTHS.map((m, i) => {
                const valid = isValidDate(i, pickedYear);
                const active = pickedMonth === i;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthChip, active && styles.monthChipActive, !valid && styles.monthChipDisabled]}
                    onPress={() => valid && setPickedMonth(i)}
                    activeOpacity={valid ? 0.7 : 1}
                  >
                    <Text style={[styles.monthChipText, active && styles.monthChipTextActive, !valid && styles.monthChipTextDisabled]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={66}
              snapToAlignment="start"
              contentContainerStyle={styles.scrollRowContent}
            >
              {yearOptions.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearChip, pickedYear === y && styles.yearChipActive]}
                  onPress={() => setPickedYear(y)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.yearChipText, pickedYear === y && styles.yearChipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Auto-adjust suggestion */}
        {canAutoAdjust && !noRush && (
          <View style={styles.adjustCard}>
            <View style={styles.adjustRow}>
              <Text style={styles.adjustEmoji}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.adjustText}>
                  Bump your deposit to{' '}
                  <Text style={{ fontWeight: '700' }}>${weeklyNeeded}/week</Text>
                  {' '}and you'll reach your goal right on time.
                </Text>
                <Text style={styles.adjustNote}>You can adjust your deposit anytime.</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.adjustBtn, depositUpdated && styles.adjustBtnDone]}
              activeOpacity={0.8}
              onPress={() => { setWeeklyDeposit(weeklyNeeded); setDepositUpdated(true); }}
            >
              <Text style={styles.adjustBtnText}>
                {depositUpdated ? `✓ Deposit updated to $${weeklyNeeded}/week` : `Set deposit to $${weeklyNeeded}/week`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Unreachable warning — guide toward a fix, don't just block */}
        {isUnreachable && !noRush && (
          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>
              This timeline would need ${weeklyNeeded}/week
            </Text>
            <Text style={styles.warnText}>
              That's quite a stretch from your current ${weeklyDeposit}/week. A few options:
            </Text>
            <View style={styles.warnOptions}>
              <Text style={styles.warnOption}>· Try a longer timeline — push the months up</Text>
              <Text style={styles.warnOption}>· Lower the goal amount on the previous screen</Text>
              <Text style={styles.warnOption}>· Pick "No rush" to save without a deadline</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, isUnreachable && !noRush && styles.primaryBtnDisabled]}
          onPress={handleSetGoal}
          activeOpacity={isUnreachable && !noRush ? 1 : 0.8}
          disabled={!!(isUnreachable && !noRush)}
        >
          <Text style={styles.primaryBtnText}>
            {isUnreachable && !noRush ? 'Pick a longer timeline to continue' : 'Set this goal'}
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#ddd',
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  subtitle: { fontSize: 13, color: MUTED, lineHeight: 20, marginBottom: 14 },

  paceCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 14, marginBottom: 14,
  },
  paceMeta: { fontSize: 12, color: MUTED, marginBottom: 4 },
  paceValue: { fontSize: 15, fontWeight: '700', color: DARK },
  paceHighlight: { color: '#854F0B' },

  modeToggle: {
    flexDirection: 'row', backgroundColor: '#e8e4ee',
    borderRadius: 12, padding: 3, marginBottom: 14,
  },
  modeBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#fff' },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: MUTED },
  modeBtnTextActive: { color: DARK },

  presetScroll: { marginBottom: 12 },
  presetRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 2 },
  preset: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 99, borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#fff',
  },
  presetActive: { borderColor: BORDER, backgroundColor: YELLOW },
  presetText: { fontSize: 13, fontWeight: '600', color: MUTED },
  presetTextActive: { color: DARK },

  // Month display above keypad
  monthDisplay: {
    alignItems: 'center', marginBottom: 12,
  },
  monthValue: { fontSize: 28, fontWeight: '800', color: DARK, marginBottom: 4 },
  monthSub: { fontSize: 13, color: MUTED },

  // Keypad
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 16,
  },
  key: {
    width: '30%', height: 52,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#ddd', flexGrow: 1,
  },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: 20, color: DARK },

  noRushCard: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 20, marginBottom: 16,
    alignItems: 'center',
  },
  noRushEmoji: { fontSize: 28, marginBottom: 8 },
  noRushTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 6 },
  noRushText: { fontSize: 13, color: MUTED, lineHeight: 20, textAlign: 'center' },

  datePicker: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 16, marginBottom: 16,
  },
  dateDisplay: { fontSize: 26, fontWeight: '800', color: DARK, textAlign: 'center', marginBottom: 4 },
  dateSub: { fontSize: 12, color: MUTED, textAlign: 'center', marginBottom: 14 },
  monthScroll: { marginBottom: 10 },
  scrollRowContent: { gap: 6, paddingHorizontal: 2 },
  monthChip: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#f8f8f8',
  },
  monthChipActive: { backgroundColor: YELLOW, borderColor: BORDER },
  monthChipDisabled: { opacity: 0.35 },
  monthChipText: { fontSize: 13, fontWeight: '600', color: MUTED },
  monthChipTextActive: { color: DARK },
  monthChipTextDisabled: { color: '#bbb' },
  yearChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#f8f8f8',
  },
  yearChipActive: { backgroundColor: DARK, borderColor: DARK },
  yearChipText: { fontSize: 13, fontWeight: '600', color: MUTED },
  yearChipTextActive: { color: '#fff' },

  adjustCard: {
    backgroundColor: '#f0fdf4', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#86efac',
    padding: 14, marginBottom: 14,
  },
  adjustRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  adjustEmoji: { fontSize: 18, marginTop: 1 },
  adjustText: { fontSize: 13, color: DARK, lineHeight: 19 },
  adjustNote: { fontSize: 11, color: '#4ade80', marginTop: 3 },
  adjustBtn: {
    backgroundColor: '#16a34a', borderRadius: 99,
    paddingVertical: 11, alignItems: 'center',
  },
  adjustBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  adjustBtnDone: { backgroundColor: '#15803d' },

  warnCard: {
    backgroundColor: '#fff8e1', borderRadius: 12,
    borderWidth: 1.5, borderColor: YELLOW,
    padding: 14, marginBottom: 16,
  },
  warnTitle: { fontSize: 13, fontWeight: '700', color: '#633806', marginBottom: 4 },
  warnText: { fontSize: 13, color: '#633806', lineHeight: 20, marginBottom: 8 },
  warnOptions: { gap: 4 },
  warnOption: { fontSize: 12, color: '#633806', lineHeight: 19 },

  primaryBtn: {
    backgroundColor: YELLOW, borderRadius: 99,
    borderWidth: 2, borderColor: BORDER,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  primaryBtnDisabled: { backgroundColor: '#ddd', borderColor: '#bbb' },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
});
