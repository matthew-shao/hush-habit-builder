import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoalProvider } from './context/GoalContext';
import HomeScreen from './screens/HomeScreen';
import MissionScreen from './screens/MissionScreen';
import GoalAmountScreen from './screens/GoalAmountScreen';
import GoalTimelineScreen from './screens/GoalTimelineScreen';
import GoalConfirmScreen from './screens/GoalConfirmScreen';

const Stack = createStackNavigator();

export default function App() {
  const { width, height } = useWindowDimensions();

  const nav = (
    <GoalProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Mission" component={MissionScreen} />
          <Stack.Screen name="GoalAmount" component={GoalAmountScreen} />
          <Stack.Screen name="GoalTimeline" component={GoalTimelineScreen} />
          <Stack.Screen name="GoalConfirm" component={GoalConfirmScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GoalProvider>
  );

  if (Platform.OS === 'web') {
    // Fixed iPhone 14 Pro dimensions — ensures layout matches real device
    const FRAME_W = 393;
    const FRAME_H = Math.min(height - 40, 852);

    return (
      <View style={{
        width,
        height,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: FRAME_W,
          height: FRAME_H,
          overflow: 'hidden',
          borderRadius: 44,
          borderWidth: 6,
          borderColor: '#444',
        }}>
          {nav}
        </View>
      </View>
    );
  }

  return nav;
}
