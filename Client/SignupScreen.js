import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function SignupScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [name, setName] = useState('');
    const [hint, setHint] = useState('');
    const [hintAnswer, setHintAnswer] = useState('');

    const handleSignup = async () => {
        try {
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/signup', { // IP 주소로 변경
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, birthdate, name, hint, hintAnswer }),
            });
            const data = await response.json(); // 응답을 JSON으로 변환
            console.log(data.message);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <TextInput style={styles.input} placeholder="아이디" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="생년월일 (YYYY-MM-DD)" value={birthdate} onChangeText={setBirthdate} />
            <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="아이디 찾기 힌트" value={hint} onChangeText={setHint} />
            <TextInput style={styles.input} placeholder="힌트 정답" value={hintAnswer} onChangeText={setHintAnswer} />
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>가입하기</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f8ff', alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30 },
    input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
    button: { width: '100%', height: 50, backgroundColor: '#4CAF50', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
