import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { config } from '@gluestack-ui/config';
import { Box, GluestackUIProvider, Text } from '@gluestack-ui/themed';
import MemberInputScreen from './src/screens/MemberInputScreen';
import ScoreInputScreen from './src/screens/ScoreInputScreen';
import ResultScreen from './src/screens/ResultScreen';
import InquireScreen from './src/screens/InquireScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MemberInput">
      <Stack.Screen name="MemberInput" component={MemberInputScreen} />
      <Stack.Screen name="ScoreInput" component={ScoreInputScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GluestackUIProvider config={config.theme}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="戦歴"
            component={InquireScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="記録"
            component={MainStackNavigator}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="結果"
            component={ResultScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
