import React, { createContext, useContext, useState } from 'react';

const GoalContext = createContext(null);

// Mocked account data — swap these out when connecting to the real app
// State-backed so you can demo different scenarios without editing code
const INITIAL_WEEKLY_DEPOSIT = 7;
const INITIAL_TOTAL_CONTRIBUTED = 21;

// How much more per week the nudge suggests adding to the deposit
const NUDGE_DEPOSIT_BUMP = 5;

// Split modes
export const SPLIT_MODES = {
  EVEN: 'even',           // deposit ÷ goals equally
  PRIORITY: 'priority',  // full deposit to first goal until done, then next
  ROTATE: 'rotate',      // cycles through goals each period
  WEIGHTED: 'weighted',  // user-defined % per goal (must sum to 100)
};

// Deposit frequency options (weeks)
export const FREQUENCIES = [
  { label: 'Weekly', weeks: 1 },
  { label: 'Biweekly', weeks: 2 },
  { label: 'Monthly', weeks: 4 },
];

export function GoalProvider({ children }) {
  const [goals, setGoals] = useState([]);
  const [weeklyDeposit, setWeeklyDeposit] = useState(INITIAL_WEEKLY_DEPOSIT);
  const [totalContributed, setTotalContributed] = useState(INITIAL_TOTAL_CONTRIBUTED);

  // Deposit splitting state
  const [splitMode, setSplitMode] = useState(SPLIT_MODES.EVEN);
  const [depositFrequencyWeeks, setDepositFrequencyWeeks] = useState(1);
  // Weights: { [goalId]: number (0-100) } — only used in WEIGHTED mode
  const [goalWeights, setGoalWeights] = useState({});
  // Priority/rotation order — array of goal IDs; defaults to creation order
  const [goalOrder, setGoalOrder] = useState([]);

  // Add a new goal or update an existing one (by id)
  function saveGoal(goalData) {
    if (goalData.id) {
      setGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } : g));
    } else {
      const newId = Date.now();
      setGoals(prev => [...prev, { ...goalData, id: newId }]);
      setGoalOrder(prev => [...prev, newId]); // append to end of order
    }
  }

  function deleteGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
    setGoalOrder(prev => prev.filter(oid => oid !== id));
  }

  // Move a goal one step up or down in the priority/rotation order
  function moveGoalUp(id) {
    setGoalOrder(prev => {
      const i = prev.indexOf(id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }

  function moveGoalDown(id) {
    setGoalOrder(prev => {
      const i = prev.indexOf(id);
      if (i < 0 || i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  // Goals sorted by the current goalOrder (used in Priority/Rotate modes)
  const orderedGoals = goalOrder.length > 0
    ? [...goalOrder.map(id => goals.find(g => g.id === id)).filter(Boolean),
       ...goals.filter(g => !goalOrder.includes(g.id))] // safety: any goals not yet in order
    : goals;

  // ── Per-goal math ────────────────────────────────────────────────────

  // How much of totalContributed is attributed to this goal under the current split.
  // PRIORITY: fills goals in order (goal 1 gets contributions until full, then goal 2, etc.)
  // All others: split proportionally by allocation ratio.
  // Note: does NOT call remainingFor/getAllocations for PRIORITY — avoids circular dependency.
  function contributedFor(goal) {
    if (goals.length <= 1) return totalContributed;

    if (splitMode === SPLIT_MODES.PRIORITY) {
      // Fill in priority order — goal 1 gets contributions until full, then goal 2, etc.
      let pool = totalContributed;
      for (const g of orderedGoals) {
        const take = Math.min(pool, g.target);
        if (g.id === goal.id) return take;
        pool = Math.max(0, pool - take);
      }
      return 0;
    }

    // For EVEN, ROTATE, WEIGHTED — split by allocation ratio
    const allocs = getAllocations();
    const totalAlloc = Object.values(allocs).reduce((sum, a) => sum + a, 0);
    if (totalAlloc === 0) return totalContributed / goals.length;
    const fraction = (allocs[goal.id] ?? 0) / totalAlloc;
    return totalContributed * fraction;
  }

  // How much is left to contribute to a specific goal
  function remainingFor(goal) {
    return Math.max(0, goal.target - contributedFor(goal));
  }

  // Progress percent for a specific goal (capped at 100%)
  function progressFor(goal) {
    return Math.min(100, (contributedFor(goal) / goal.target) * 100);
  }

  // Weeks remaining using this goal's allocated deposit share (not the full deposit)
  function weeksRemainingFor(goal) {
    const allocs = getAllocations();
    const goalDeposit = allocs[goal.id] ?? (weeklyDeposit / Math.max(1, goals.length));
    if (goalDeposit <= 0) return null;
    const left = remainingFor(goal);
    if (left <= 0) return 0;
    return Math.ceil(left / goalDeposit);
  }

  // How much per week you'd need to hit a specific goal's timeline
  // Returns null if the goal has no timeline set
  function weeklyNeededFor(goal) {
    if (!goal.timelineMonths) return null;
    const weeks = Math.round(goal.timelineMonths * 4.33);
    if (weeks <= 0) return null;
    const left = remainingFor(goal);
    if (left <= 0) return 0;
    return Math.ceil(left / weeks);
  }

  // Nudge for a specific goal — returns { suggestedDeposit, weeksSooner } or null
  function getNudgeFor(goal) {
    if (weeklyDeposit <= 0) return null;
    const left = remainingFor(goal);
    if (left <= 0) return null; // already reached

    const weeksBefore = Math.ceil(left / weeklyDeposit);
    if (weeksBefore <= 2) return null; // almost there

    const suggestedDeposit = weeklyDeposit + NUDGE_DEPOSIT_BUMP;
    const weeksAfter = Math.ceil(left / suggestedDeposit);
    if (weeksAfter > 260) return null; // 5-year cap — avoids absurd "2980 weeks sooner"

    const weeksSooner = weeksBefore - weeksAfter;
    if (weeksSooner <= 0) return null;

    return { suggestedDeposit, weeksSooner };
  }

  // ── Split allocation ─────────────────────────────────────────────────

  // Returns { [goalId]: weeklyAmount } showing how the deposit is split
  function getAllocations() {
    if (goals.length === 0) return {};
    if (goals.length === 1) return { [goals[0].id]: weeklyDeposit };

    if (splitMode === SPLIT_MODES.EVEN) {
      const perGoal = weeklyDeposit / goals.length;
      return Object.fromEntries(goals.map(g => [g.id, perGoal]));
    }

    if (splitMode === SPLIT_MODES.PRIORITY) {
      // Full deposit to first unfinished goal in priority order
      const first = orderedGoals.find(g => remainingFor(g) > 0);
      if (!first) return {};
      return Object.fromEntries(goals.map(g => [g.id, g.id === first.id ? weeklyDeposit : 0]));
    }

    if (splitMode === SPLIT_MODES.ROTATE) {
      // Each goal takes a full turn in rotation order; average per week = deposit / n
      const perGoal = weeklyDeposit / goals.length;
      return Object.fromEntries(goals.map(g => [g.id, perGoal]));
    }

    if (splitMode === SPLIT_MODES.WEIGHTED) {
      const totalWeight = goals.reduce((sum, g) => sum + (goalWeights[g.id] ?? 0), 0);
      if (totalWeight === 0) {
        // Fallback to even if no weights set
        const perGoal = weeklyDeposit / goals.length;
        return Object.fromEntries(goals.map(g => [g.id, perGoal]));
      }
      return Object.fromEntries(
        goals.map(g => [g.id, (weeklyDeposit * (goalWeights[g.id] ?? 0)) / totalWeight])
      );
    }

    return {};
  }

  function setGoalWeight(goalId, weight) {
    setGoalWeights(prev => ({ ...prev, [goalId]: Math.max(0, Math.min(100, weight)) }));
  }

  // ── Legacy single-goal helpers (used by GoalConfirm) ────────────────
  // Returns the most recently added goal
  const latestGoal = goals.length > 0 ? goals[goals.length - 1] : null;

  return (
    <GoalContext.Provider
      value={{
        goals,
        saveGoal,
        deleteGoal,
        latestGoal,
        totalContributed,
        setTotalContributed,
        weeklyDeposit,
        setWeeklyDeposit,
        contributedFor,
        remainingFor,
        progressFor,
        weeksRemainingFor,
        weeklyNeededFor,
        getNudgeFor,
        splitMode,
        setSplitMode,
        depositFrequencyWeeks,
        setDepositFrequencyWeeks,
        goalWeights,
        setGoalWeight,
        getAllocations,
        goalOrder,
        orderedGoals,
        moveGoalUp,
        moveGoalDown,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  return useContext(GoalContext);
}
