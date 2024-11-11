import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CarpoolRegisterScreen from './Component/CarpoolRegisterScreen';
import CarpoolSearchScreen from './Component/CarpoolSearchScreen';
import MyPageScreen from './Component/MyPageScreen';

const Tab = createBottomTabNavigator();

function HomeScreenContent({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function HomeScreen({ route }) {
  const message = route?.params?.message || "Welcome to Home!"; 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" options={{ title: '홈' }}>
        {() => <HomeScreenContent message={message} />}
      </Tab.Screen>
      <Tab.Screen name="CarpoolRegister" component={CarpoolRegisterScreen} options={{ title: '카풀 등록' }} />
      <Tab.Screen name="CarpoolSearch" component={CarpoolSearchScreen} options={{ title: '카풀 찾기' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
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
