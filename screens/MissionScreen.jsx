import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGoal, SPLIT_MODES, FREQUENCIES } from '../context/GoalContext';

export default function MissionScreen({ navigation }) {
  const {
    goals,
    deleteGoal,
    totalContributed,
    weeklyDeposit,
    setWeeklyDeposit,
    contributedFor,
    progressFor,
    weeksRemainingFor,
    weeklyNeededFor,
    splitMode,
    setSplitMode,
    depositFrequencyWeeks,
    setDepositFrequencyWeeks,
    goalWeights,
    setGoalWeight,
    getAllocations,
    orderedGoals,
    moveGoalUp,
    moveGoalDown,
  } = useGoal();

  const allocations = getAllocations();

  // Track which goal card is showing its delete confirmation
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  // Sum of weekly amounts needed across all goals that have timelines
  const totalWeeklyNeeded = goals.reduce((sum, g) => {
    const needed = weeklyNeededFor(g);
    return needed ? sum + needed : sum;
  }, 0);
  const goalsWithTimelines = goals.filter(g => g.timelineMonths).length;
  const depositShortfall = totalWeeklyNeeded > weeklyDeposit ? totalWeeklyNeeded - weeklyDeposit : 0;

  function handleEditGoal(goal) {
    navigation.navigate('GoalAmount', { editingGoal: goal });
  }

  function handleAddGoal() {
    navigation.navigate('GoalAmount');
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Yellow header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>
              {goals.length > 0 ? goals[0].emoji : '⭐'}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {goals.length > 0
                ? `${goals.length} goal${goals.length !== 1 ? 's' : ''} active`
                : 'Investing in my future'}
            </Text>
            <Text style={styles.headerAmount}>${totalContributed.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Recurring investment */}
        <Text style={styles.sectionLabel}>Recurring investment</Text>
        <TouchableOpacity style={styles.card}>
          <View>
            <Text style={styles.cardMeta}>Weekly deposit</Text>
            <Text style={styles.cardValue}>${weeklyDeposit}/week</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Deposit split UI — shown when 2+ goals */}
        {goals.length > 1 && (
          <DepositSplitCard
            goals={goals}
            orderedGoals={orderedGoals}
            weeklyDeposit={weeklyDeposit}
            setWeeklyDeposit={setWeeklyDeposit}
            splitMode={splitMode}
            setSplitMode={setSplitMode}
            depositFrequencyWeeks={depositFrequencyWeeks}
            setDepositFrequencyWeeks={setDepositFrequencyWeeks}
            goalWeights={goalWeights}
            setGoalWeight={setGoalWeight}
            allocations={allocations}
            totalWeeklyNeeded={totalWeeklyNeeded}
            depositShortfall={depositShortfall}
            moveGoalUp={moveGoalUp}
            moveGoalDown={moveGoalDown}
          />
        )}

        {/* Goals section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Goals</Text>
          {goals.length > 0 && (
            <Text style={styles.goalCount}>{goals.length}</Text>
          )}
        </View>

        {goals.length === 0 ? (
          <EmptyGoalCard onPress={handleAddGoal} />
        ) : (
          <>
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                totalContributed={totalContributed}
                weeklyDeposit={weeklyDeposit}
                goalContributed={contributedFor(goal)}
                progressPercent={progressFor(goal)}
                weeksRemaining={weeksRemainingFor(goal)}
                isFirst={index === 0}
                multiGoal={goals.length > 1}
                confirmingDelete={confirmingDeleteId === goal.id}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => setConfirmingDeleteId(goal.id)}
                onCancelDelete={() => setConfirmingDeleteId(null)}
                onConfirmDelete={() => {
                  deleteGoal(goal.id);
                  setConfirmingDeleteId(null);
                }}
              />
            ))}

            {/* Add another goal — capped at 5 */}
            {goals.length < 5 ? (
              <TouchableOpacity style={styles.addGoalBtn} onPress={handleAddGoal} activeOpacity={0.7}>
                <Text style={styles.addGoalPlus}>＋</Text>
                <Text style={styles.addGoalText}>Add another goal</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.goalCapNote}>
                <Text style={styles.goalCapText}>5 goal maximum reached</Text>
                <Text style={styles.goalCapSub}>Complete or delete a goal to add a new one.</Text>
              </View>
            )}
          </>
        )}

        {/* Portfolio composition */}
        <Text style={styles.sectionLabel}>Portfolio composition</Text>
        <View style={styles.card}>
          <View style={styles.portfolioHeader}>
            <View>
              <Text style={styles.cardMeta}>Strategy</Text>
              <Text style={styles.cardValue}>The Strategist</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </View>
          <View style={styles.allocGrid}>
            {[
              { label: 'Cash', pct: '3.5%', icon: '$' },
              { label: 'Stocks', pct: '72.6%', icon: '∞' },
              { label: 'Bonds', pct: '24.0%', icon: '💼' },
              { label: 'Alt', pct: '0%', icon: '🏢' },
            ].map((item) => (
              <View key={item.label} style={styles.allocCell}>
                <Text style={styles.allocIcon}>{item.icon}</Text>
                <Text style={styles.allocLabel}>{item.label}</Text>
                <Text style={styles.allocPct}>{item.pct}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>CHAT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>+</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>MISSION</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptyGoalCard({ onPress }) {
  return (
    <TouchableOpacity style={styles.emptyGoal} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.emptyTitle}>What are you investing toward?</Text>
      <Text style={styles.emptySub}>Set a goal and watch your contributions add up</Text>
      <View style={styles.emptyBtn}>
        <Text style={styles.emptyBtnText}>Set a goal</Text>
      </View>
    </TouchableOpacity>
  );
}

function GoalCard({
  goal, goalContributed, weeklyDeposit,
  progressPercent, weeksRemaining, multiGoal,
  onEdit, confirmingDelete, onDelete, onCancelDelete, onConfirmDelete,
}) {
  return (
    <View style={[styles.card, styles.goalCard]}>
      {/* Goal header row */}
      <View style={styles.goalRow}>
        <View style={styles.goalIcon}>
          <Text style={{ fontSize: 20 }}>{goal.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardValue}>{goal.name}</Text>
          <Text style={styles.cardMeta}>
            ${goalContributed.toFixed(2)} of ${goal.target.toLocaleString()}
          </Text>
        </View>
        {goal.targetDate && (
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{goal.targetDate}</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLbl}>{Math.round(progressPercent)}% there</Text>
        {weeksRemaining != null
          ? <Text style={styles.progressLbl}>
              {multiGoal
                ? `~${weeksRemaining} weeks`
                : `~${weeksRemaining} weeks at $${weeklyDeposit}/wk`}
            </Text>
          : <Text style={styles.progressLbl}>No timeline set</Text>
        }
      </View>
      <Text style={styles.contribNote}>Based on your contributions · no projections</Text>


      {/* Edit / Delete */}
      {confirmingDelete ? (
        <View style={styles.deleteConfirm}>
          <Text style={styles.deleteConfirmText}>Remove this goal?</Text>
          <View style={styles.deleteConfirmBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancelDelete}>
              <Text style={styles.cancelBtnText}>Keep it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDeleteBtn} onPress={onConfirmDelete}>
              <Text style={styles.confirmDeleteBtnText}>Yes, delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.goalActions}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editLink}>Edit goal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <Text style={styles.deleteLink}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Deposit Split Card ─────────────────────────────────────────────────────────

const SPLIT_MODE_OPTIONS = [
  { key: SPLIT_MODES.EVEN,     label: 'Even split',   desc: 'Equal share per goal' },
  { key: SPLIT_MODES.PRIORITY, label: 'Prioritized',  desc: 'Full deposit to top goal first' },
  { key: SPLIT_MODES.ROTATE,   label: 'Rotate',       desc: 'Each goal gets a full turn' },
  { key: SPLIT_MODES.WEIGHTED, label: 'Weighted',     desc: 'You set the % per goal' },
];

function DepositSplitCard({
  goals, orderedGoals, weeklyDeposit, setWeeklyDeposit,
  splitMode, setSplitMode,
  depositFrequencyWeeks, setDepositFrequencyWeeks,
  goalWeights, setGoalWeight,
  allocations, totalWeeklyNeeded, depositShortfall,
  moveGoalUp, moveGoalDown,
}) {
  const totalWeight = goals.reduce((sum, g) => sum + (goalWeights[g.id] ?? 0), 0);
  const weightWarning = splitMode === SPLIT_MODES.WEIGHTED && totalWeight !== 100 && totalWeight > 0;

  // Use orderedGoals for Priority and Rotate, otherwise creation order
  const isOrdered = splitMode === SPLIT_MODES.PRIORITY || splitMode === SPLIT_MODES.ROTATE;
  const displayGoals = isOrdered ? orderedGoals : goals;

  return (
    <View style={splitStyles.card}>
      <Text style={splitStyles.title}>Deposit split</Text>
      <Text style={splitStyles.sub}>
        ${weeklyDeposit}/week · shared across {goals.length} goals
      </Text>

      {/* Shortfall note — no bump button, just informational */}
      {depositShortfall > 0 && (
        <Text style={splitStyles.shortfallNote}>
          ⚠️  ${depositShortfall}/week short to hit all timelines at current deposit
        </Text>
      )}

      {/* Split mode selector — 2×2 grid so no orphan chip */}
      <View style={splitStyles.modeGrid}>
        {SPLIT_MODE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[splitStyles.modeChip, splitMode === opt.key && splitStyles.modeChipActive]}
            onPress={() => setSplitMode(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[splitStyles.modeChipText, splitMode === opt.key && splitStyles.modeChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode description */}
      <Text style={splitStyles.modeDesc}>
        {SPLIT_MODE_OPTIONS.find(o => o.key === splitMode)?.desc}
        {splitMode === SPLIT_MODES.ROTATE && ` · rotates every ${depositFrequencyWeeks === 1 ? 'week' : `${depositFrequencyWeeks} weeks`}`}
      </Text>

      {/* Frequency (shown for rotate mode) */}
      {splitMode === SPLIT_MODES.ROTATE && (
        <View style={splitStyles.freqRow}>
          <Text style={splitStyles.freqLabel}>Rotation frequency</Text>
          <View style={splitStyles.freqChips}>
            {FREQUENCIES.map(f => (
              <TouchableOpacity
                key={f.weeks}
                style={[splitStyles.freqChip, depositFrequencyWeeks === f.weeks && splitStyles.freqChipActive]}
                onPress={() => setDepositFrequencyWeeks(f.weeks)}
                activeOpacity={0.7}
              >
                <Text style={[splitStyles.freqChipText, depositFrequencyWeeks === f.weeks && splitStyles.freqChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Per-goal allocation rows */}
      <View style={splitStyles.allocList}>
        {displayGoals.map((goal, i) => {
          const amt = allocations[goal.id] ?? 0;
          const weight = goalWeights[goal.id] ?? Math.round(100 / goals.length);
          return (
            <View key={goal.id} style={[splitStyles.allocRow, i > 0 && splitStyles.allocRowBorder]}>
              {/* Order number */}
              {isOrdered && (
                <Text style={splitStyles.allocIndex}>{i + 1}.</Text>
              )}

              <Text style={splitStyles.allocEmoji}>{goal.emoji}</Text>
              <Text style={splitStyles.allocName} numberOfLines={1}>{goal.name}</Text>

              {/* Right side */}
              {splitMode === SPLIT_MODES.WEIGHTED ? (
                <View style={splitStyles.weightInput}>
                  <TouchableOpacity
                    style={splitStyles.weightBtn}
                    onPress={() => setGoalWeight(goal.id, (goalWeights[goal.id] ?? weight) - 5)}
                    activeOpacity={0.7}
                  >
                    <Text style={splitStyles.weightBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={splitStyles.weightValue}>{goalWeights[goal.id] ?? weight}%</Text>
                  <TouchableOpacity
                    style={splitStyles.weightBtn}
                    onPress={() => setGoalWeight(goal.id, (goalWeights[goal.id] ?? weight) + 5)}
                    activeOpacity={0.7}
                  >
                    <Text style={splitStyles.weightBtnText}>＋</Text>
                  </TouchableOpacity>
                </View>
              ) : isOrdered ? (
                /* ↑↓ reorder buttons */
                <View style={splitStyles.reorderBtns}>
                  <TouchableOpacity
                    style={[splitStyles.reorderBtn, i === 0 && splitStyles.reorderBtnDisabled]}
                    onPress={() => moveGoalUp(goal.id)}
                    activeOpacity={i === 0 ? 1 : 0.7}
                    disabled={i === 0}
                  >
                    <Text style={[splitStyles.reorderBtnText, i === 0 && splitStyles.reorderBtnTextDisabled]}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[splitStyles.reorderBtn, i === displayGoals.length - 1 && splitStyles.reorderBtnDisabled]}
                    onPress={() => moveGoalDown(goal.id)}
                    activeOpacity={i === displayGoals.length - 1 ? 1 : 0.7}
                    disabled={i === displayGoals.length - 1}
                  >
                    <Text style={[splitStyles.reorderBtnText, i === displayGoals.length - 1 && splitStyles.reorderBtnTextDisabled]}>↓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={splitStyles.allocAmt}>${amt.toFixed(2)}/wk</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Weight total warning */}
      {weightWarning && (
        <Text style={splitStyles.weightWarn}>
          Weights total {totalWeight}% — adjust to reach 100%
        </Text>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const YELLOW = '#f5c842';
const BG = '#f5f0f8';
const DARK = '#111';
const BORDER = '#333';
const MUTED = '#777';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: YELLOW },
  header: {
    backgroundColor: YELLOW,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: BORDER,
    backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 15, color: '#333', marginBottom: 2 },
  headerAmount: { fontSize: 30, fontWeight: '700', color: DARK },
  btnRow: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 99,
    borderWidth: 2, borderColor: BORDER,
    backgroundColor: YELLOW, alignItems: 'center',
  },
  headerBtnText: { fontSize: 14, fontWeight: '700', color: DARK },
  scroll: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: DARK, marginTop: 20, marginBottom: 8 },
  goalCount: {
    fontSize: 11, fontWeight: '800', color: '#fff',
    backgroundColor: DARK, borderRadius: 99,
    paddingHorizontal: 7, paddingVertical: 2,
    marginTop: 20, marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 1.5, borderColor: BORDER,
    padding: 16, marginBottom: 4,
  },
  goalCard: { marginBottom: 10 },
  cardMeta: { fontSize: 13, color: MUTED, marginBottom: 2 },
  cardValue: { fontSize: 15, fontWeight: '700', color: DARK },
  arrow: { fontSize: 18, color: DARK },
  portfolioHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  allocGrid: { flexDirection: 'row', gap: 6 },
  allocCell: {
    flex: 1, backgroundColor: YELLOW,
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, padding: 8, alignItems: 'center',
  },
  allocIcon: { fontSize: 16, marginBottom: 4 },
  allocLabel: { fontSize: 10, color: '#333', marginBottom: 2 },
  allocPct: { fontSize: 12, fontWeight: '700', color: DARK },
  emptyGoal: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#bbb',
    borderStyle: 'dashed', padding: 20, alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', marginBottom: 14 },
  emptyBtn: {
    paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 99, backgroundColor: YELLOW,
    borderWidth: 2, borderColor: BORDER,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: DARK },
  addGoalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#ccc', borderStyle: 'dashed',
    paddingVertical: 14, marginBottom: 4,
    backgroundColor: 'transparent',
  },
  addGoalPlus: { fontSize: 18, color: MUTED },
  addGoalText: { fontSize: 14, fontWeight: '600', color: MUTED },
  goalCapNote: {
    alignItems: 'center', paddingVertical: 14, marginBottom: 4,
  },
  goalCapText: { fontSize: 13, fontWeight: '700', color: MUTED, marginBottom: 3 },
  goalCapSub: { fontSize: 12, color: '#aaa' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  goalIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: YELLOW, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  dateBadge: {
    backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  dateBadgeText: { fontSize: 11, fontWeight: '600', color: MUTED },
  progressTrack: {
    height: 10, backgroundColor: '#eee', borderRadius: 99,
    overflow: 'hidden', borderWidth: 0.5, borderColor: '#ddd',
  },
  progressFill: { height: '100%', backgroundColor: YELLOW, borderRadius: 99 },
  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 6,
  },
  progressLbl: { fontSize: 12, color: MUTED },
  contribNote: { fontSize: 11, color: '#aaa', marginBottom: 12 },
  nudge: {
    flexDirection: 'row', gap: 10,
    backgroundColor: '#fff8e1', borderRadius: 12,
    borderWidth: 1.5, borderColor: YELLOW,
    padding: 12, marginBottom: 10, alignItems: 'flex-start',
  },
  nudgeEmoji: { fontSize: 18, marginTop: 1 },
  nudgeText: { fontSize: 13, color: DARK, lineHeight: 19, marginBottom: 4 },
  nudgeNote: { fontSize: 11, color: MUTED, marginBottom: 8 },
  nudgeBtn: {
    backgroundColor: '#b45309', borderRadius: 99,
    paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start',
  },
  nudgeBtnDone: { backgroundColor: '#15803d' },
  nudgeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  depositWarn: {
    backgroundColor: '#fff8e1', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#fcd34d',
    padding: 14, marginTop: 12, marginBottom: 4,
  },
  depositOk: {
    backgroundColor: '#f0fdf4', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#86efac',
    padding: 14, marginTop: 12, marginBottom: 4,
  },
  depositRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  depositIcon: { fontSize: 16, marginTop: 1 },
  depositWarnTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  depositWarnSub: { fontSize: 12, color: '#92400e', lineHeight: 18 },
  depositOkText: { fontSize: 13, fontWeight: '600', color: '#166534', marginBottom: 2 },
  depositOkSub: { fontSize: 12, color: '#166534', opacity: 0.75 },
  depositBumpBtn: {
    backgroundColor: '#b45309', borderRadius: 99,
    paddingVertical: 10, alignItems: 'center',
  },
  depositBumpText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  goalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editLink: { fontSize: 12, color: '#888', textDecorationLine: 'underline' },
  deleteLink: { fontSize: 12, color: '#e05252', textDecorationLine: 'underline' },
  deleteConfirm: {
    backgroundColor: '#fff5f5', borderRadius: 10,
    borderWidth: 1.5, borderColor: '#fca5a5', padding: 12,
  },
  deleteConfirmText: { fontSize: 13, color: '#333', marginBottom: 10, fontWeight: '600' },
  deleteConfirmBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 99,
    borderWidth: 1.5, borderColor: '#ddd',
    backgroundColor: '#fff', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  confirmDeleteBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 99,
    backgroundColor: '#e05252', alignItems: 'center',
  },
  confirmDeleteBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, paddingBottom: 16,
    backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#ddd',
  },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20, color: '#aaa' },
  navIconActive: { fontSize: 20, color: '#8b5cf6' },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },
  navLabelActive: { color: '#8b5cf6' },
});

const splitStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 16, marginTop: 12, marginBottom: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 2 },
  sub: { fontSize: 12, color: MUTED, marginBottom: 12 },
  shortfallNote: { fontSize: 12, color: '#92400e', marginBottom: 10 },
  modeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8,
  },
  modeChip: {
    width: '48%', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: DARK, borderColor: DARK },
  modeChipText: { fontSize: 12, fontWeight: '600', color: MUTED },
  modeChipTextActive: { color: '#fff' },
  modeDesc: { fontSize: 11, color: MUTED, marginBottom: 10, fontStyle: 'italic' },
  freqRow: { marginBottom: 10 },
  freqLabel: { fontSize: 12, color: MUTED, marginBottom: 6 },
  freqChips: { flexDirection: 'row', gap: 6 },
  freqChip: {
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 99, borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#f5f5f5',
  },
  freqChipActive: { backgroundColor: YELLOW, borderColor: BORDER },
  freqChipText: { fontSize: 12, fontWeight: '600', color: MUTED },
  freqChipTextActive: { color: DARK },
  allocList: { gap: 0 },
  allocRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 },
  allocRowBorder: { borderTopWidth: 0.5, borderTopColor: '#eee' },
  allocIndex: { fontSize: 12, fontWeight: '700', color: MUTED, width: 16, textAlign: 'right' },
  allocEmoji: { fontSize: 16 },
  allocName: { flex: 1, fontSize: 13, fontWeight: '600', color: DARK },
  allocAmt: { fontSize: 13, fontWeight: '700', color: DARK },
  weightInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center',
  },
  weightBtnText: { fontSize: 14, fontWeight: '700', color: DARK },
  weightValue: { fontSize: 13, fontWeight: '700', color: DARK, minWidth: 36, textAlign: 'center' },
  weightWarn: { fontSize: 11, color: '#b45309', marginTop: 8, textAlign: 'center' },
  reorderBtns: { flexDirection: 'row', gap: 4 },
  reorderBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
  },
  reorderBtnDisabled: { backgroundColor: '#fafafa', borderColor: '#eee' },
  reorderBtnText: { fontSize: 14, fontWeight: '700', color: DARK },
  reorderBtnTextDisabled: { color: '#ccc' },
});
