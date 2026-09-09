# Hush Goals — setup

## Install

```bash
npx create-expo-app hush-goals
cd hush-goals
```

Copy the files from this folder into your project, then install dependencies:

```bash
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

## Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator.

## File structure

```
App.jsx                        ← entry point + navigation
context/
  GoalContext.jsx              ← goal state + nudge math
screens/
  MissionScreen.jsx            ← MISSION tab (empty + active goal states)
  GoalTypeScreen.jsx           ← pick a goal type
  GoalAmountScreen.jsx         ← enter amount + name
  GoalTimelineScreen.jsx       ← pick a timeline
  GoalConfirmScreen.jsx        ← confirmation
```

## Mocked data

All account data is hardcoded in `GoalContext.jsx`:

```js
const MOCK_WEEKLY_DEPOSIT = 7;
const MOCK_TOTAL_CONTRIBUTED = 21;
```

Change these to see different progress states. When connecting to the real app later, these are the two values you'd pull from the API.
