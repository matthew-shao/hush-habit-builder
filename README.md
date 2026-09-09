# Hush Goals

A goal-setting feature mockup for the Hush investment app, built in React Native / Expo during a 6-week internship.

Goals give deposits a destination. Instead of money accumulating with no feedback, users set a target, pick a timeline, and watch their contributions move a progress bar. With multiple goals, they choose how to split their weekly deposit across all of them.

---

## Screens

| Screen | Description |
|---|---|
| `HomeScreen` | Account overview with goal teaser or live progress card |
| `GoalAmountScreen` | Set goal name, emoji, and target amount (keypad, $99,999 cap) |
| `GoalTimelineScreen` | Pick a timeline via month keypad or presets; pace card shows if deposit covers it |
| `GoalConfirmScreen` | Summary before saving |
| `MissionScreen` | All active goals with progress bars, deposit split controls, and per-goal math |

---

## Features

- **Contribution-only math** — no investment projections; every number reflects actual deposits
- **Up to 5 goals** — hard cap to keep the split UI manageable
- **Deposit splitting** across 4 modes:
  - **Even** — deposit divided equally per goal
  - **Priority** — full deposit to goal #1 until complete, then #2
  - **Rotate** — goals take turns (weekly, biweekly, or monthly)
  - **Weighted** — user-defined percentages per goal
- **Reorderable priority/rotation** — ↑↓ buttons to set the order
- **Reactive math** — switching split modes instantly updates progress bars, weeks remaining, and shortfall notices everywhere

---

## Setup

```bash
npx create-expo-app hush-goals
cd hush-goals
```

Copy the files from this repo into your project, then install dependencies:

```bash
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

Run in web mode:

```bash
npx expo start --web
```

Or scan the QR code with Expo Go on your phone.

---

## File structure

```
App.jsx                      ← entry point + navigation stack
context/
  GoalContext.jsx            ← all goal state, split math, and per-goal helpers
screens/
  HomeScreen.jsx             ← account overview + goal teaser
  GoalAmountScreen.jsx       ← amount + name entry
  GoalTimelineScreen.jsx     ← timeline picker + pace card
  GoalConfirmScreen.jsx      ← save confirmation
  MissionScreen.jsx          ← active goals + deposit split UI
```

---

## Mocked data

Account data is hardcoded in `GoalContext.jsx`:

```js
const INITIAL_WEEKLY_DEPOSIT = 7;
const INITIAL_TOTAL_CONTRIBUTED = 21;
```

Adjust these to preview different progress states. When connecting to the real backend, these are the two values to pull from the API.

---

## Built with

- [React Native](https://reactnative.dev)
- [Expo SDK 56](https://expo.dev)
- [React Navigation](https://reactnavigation.org)
- React Context API
