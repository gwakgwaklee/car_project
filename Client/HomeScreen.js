import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MyPageScreen from '../component/MyPageScreen';
import CarpoolRegisterScreen from '../component/CarpoolRegisterScreen';
import CarpoolSearchScreen from '../component/CarpoolSearchScreen';

const Tab = createBottomTabNavigator();

export default function HomeScreen({ route }) {
  const { message } = route.params; // 로그인 성공 메시지 전달받기

  return (
    // <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          headerShown: true, // 상단 헤더 표시
        })}
      >
        <Tab.Screen name="Home" options={{ title: '홈'}}>
          {() => (
            <View style={styles.container}>
              <Text style={styles.title}>{message}</Text>
              <StatusBar style="auto" />
            </View>
          )}
        </Tab.Screen>
        <Tab.Screen name="CarpoolRegister" component={CarpoolRegisterScreen} options={{ title: '카풀 등록' }} />
        <Tab.Screen name="CarpoolSearch" component={CarpoolSearchScreen} options={{ title: '카풀 찾기' }} />
        <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
      </Tab.Navigator>
    // </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});
