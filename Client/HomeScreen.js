import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ route }) {
  const { message } = route.params; // 로그인 성공 메시지 전달받기

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message}</Text>
      <StatusBar style="auto" />
    </View>
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
