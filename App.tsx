import React from 'react';
import 'regenerator-runtime/runtime'; // 追加
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { config } from '@gluestack-ui/config';
import { GluestackUIProvider, StyledProvider} from '@gluestack-ui/themed';

import { PortalProvider } from '@tamagui/portal'
import { TamaguiProvider, createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

import MemberInputScreen from './src/screens/MemberInputScreen';
import ScoreInputScreen from './src/screens/ScoreInputScreen';
import ResultScreen from './src/screens/ResultScreen';
import InquireScreen from './src/screens/InquireScreen';




import Gradient from './assets/Icons/Gradient';
import DocumentData from './assets/Icons/DocumentData';
import LightBulbPerson from './assets/Icons/LightbulbPerson';
import Rocket from './assets/Icons/Rocket';
import Logo from './assets/Icons/Logo';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// you usually export this from a tamagui.config.ts file
const tamaguiConfig = createTamagui(config)

// make TypeScript type everything based on your config
type Conf = typeof tamaguiConfig
declare module '@tamagui/core' { // or 'tamagui'
  interface TamaguiCustomConfig extends Conf {}
}


function MainStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MemberInput">
      <Stack.Screen name="MembeInput" component={MemberInputScreen} />
      <Stack.Screen name="ScoreInput" component={ScoreInputScreen} />
    </Stack.Navigator>
  );
}


function InpuireStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Inquire">
      <Stack.Screen name="Inquire" component={InquireScreen} />
    </Stack.Navigator>
  );
}


export default function App() {
  return (

    <TamaguiProvider config={tamaguiConfig}>
      <PortalProvider shouldAddRootHost>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen
              name="戦歴"
              component={InpuireStackNavigator}
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
      </PortalProvider>
    </TamaguiProvider>
    
  );
}
