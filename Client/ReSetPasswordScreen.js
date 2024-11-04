import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

export default function ReSetPasswordScreen({ navigation }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validatePassword = (password) => {
        // 비밀번호 유효성 검사 (8-15자리, 영어 및 특수문자만 허용)
        const passwordPattern = /^(?=.*[!@#$%^&*])(?=.*[A-Za-z])[A-Za-z!@#$%^&*]{8,15}$/;
        return passwordPattern.test(password);
    };

    const handleResetPassword = () => {
        if (!validatePassword(newPassword)) {
            Alert.alert('비밀번호 오류', '비밀번호는 8자리 이상 15자리 이하이며, 특수문자와 영어를 포함해야 합니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('비밀번호 불일치', '입력한 비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 재설정 로직 구현 (서버에 비밀번호 전송 등)
        Alert.alert('비밀번호 재설정', '비밀번호가 성공적으로 변경되었습니다.');
        navigation.navigate('LoginScreen'); // 비밀번호 변경 후 로그인 화면으로 이동
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>비밀번호 재설정</Text>
            <TextInput
                style={styles.input}
                placeholder="새 비밀번호"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 재입력"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>비밀번호 재설정</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
        marginTop: 20,
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
});
