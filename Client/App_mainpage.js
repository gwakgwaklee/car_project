// App_mainpage.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function AppMainPage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인 페이지</Text>
      <Text>로그인에 성공하셨습니다!</Text>
      <Button 
        title="홈 화면으로 이동"
        onPress={() => navigation.navigate('HomeScreen')} // HomeScreen으로 이동
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
