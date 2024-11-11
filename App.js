import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './Client/MainScreen';
import SignupScreen from './Client/SignupScreen';
import FindIdPasswordScreen from './Client/FindIdPasswordScreen';
import HomeScreen from './Client/HomeScreen'; // HomeScreen은 하단 탭 네비게이션을 포함
import ReSetPasswordScreen from './Client/ReSetPasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SignupScreen" 
          component={SignupScreen} 
          options={{ title: '회원가입' }}
        />
        <Stack.Screen 
          name="FindIdPasswordScreen" 
          component={FindIdPasswordScreen} 
          options={{ title: '아이디/비밀번호 찾기' }}
        />
        <Stack.Screen 
          name="ReSetPasswordScreen"
          component={ReSetPasswordScreen} 
          options={{ title: '비밀번호 재설정' }}
        />
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ title: '홈', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
