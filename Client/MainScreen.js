import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity ,Button,Alert} from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MainScreen({ navigation }) {
  const [isChecked, setIsChecked] = useState(false);
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');

  const handleCheckboxToggle = () => {
    setIsChecked(!isChecked);
  };

  const handleSignupPress = () => {
    navigation.navigate('SignupScreen'); // 회원가입 화면으로 이동
  };

  const handleFindIdPress = () => {
    navigation.navigate('FindIdPasswordScreen'); // 정의된 화면 이름에 맞게 변경
  };

  const handleLogin =  async () => {
    try {
      const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/login', { // 서버의 로그인 API 주소
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userid, password }),
      });
      // navigation.navigate('HomeScreen', { message: '로그인 성공' }); // 홈 화면으로 이동 및 메시지 전달
    

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        navigation.navigate('HomeScreen', { message: '로그인 성공' }); // 홈 화면으로 이동 및 메시지 전달
      } else {
        const errorData = await response.json();
        console.error('로그인 실패:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUseridChange = (text) => {
    const filteredText = text.replace(/[^a-zA-Z0-9!@#$%^&*]/g, ''); // 한글 제거
    setUserid(filteredText);
  };

  const handlePasswordChange = (text) => {
    const filteredText = text.replace(/[^a-zA-Z0-9!@#$%^&*]/g, ''); // 한글 제거
    setPassword(filteredText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>한서대학교 카풀 앱</Text>
      <TextInput 
        style={styles.input} 
        placeholder="아이디" 
        value={userid}
        onChangeText={handleUseridChange}
      />
      <TextInput 
        style={styles.input} 
        placeholder="비밀번호" 
        secureTextEntry 
        value={password}
        onChangeText={handlePasswordChange}
      />
      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={handleCheckboxToggle} style={styles.checkbox}>
          {isChecked && (
            <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
          )}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>자동 로그인</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <TouchableOpacity style={styles.linkButton} onPress={handleSignupPress}>
          <Text style={styles.linkButtonText}>회원가입</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={handleFindIdPress}>
          <Text style={styles.linkButtonText}>아이디 찾기</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  linkButton: {
    width: '48%', // 버튼 너비를 조정하여 두 버튼이 반반이 되도록 함
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
  },
});
