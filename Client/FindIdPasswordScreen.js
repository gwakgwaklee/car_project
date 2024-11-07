import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function FindIdPasswordScreen({ navigation }) {
    const placeholder = "생년월일 (YYYY-MM-DD)";

    const [isFindingId, setIsFindingId] = useState(true);
    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [hintAnswer, setHintAnswer] = useState('');
    const [hint, setHint] = useState('');
    const [hintVisible, setHintVisible] = useState(false);

    const handleToggle = () => {
        setIsFindingId(!isFindingId);
        setName('');
        setBirthdate('');
        setHintAnswer('');
        setHint('');
        setHintVisible(false);
    };

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setBirthdate(date.toISOString().split('T')[0]);
        hideDatePicker();
    };

    const fetchHint = async () => {
        if (!isFindingId && name && birthdate) {
            try {
                const response = await fetch(`https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getHint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: name, birthdate }),
                });

                const data = await response.json();
                if (response.ok) {
                    setHint(data.hint);
                    setHintVisible(true);
                } else {
                    Alert.alert('힌트 가져오기 실패', data.message || '힌트를 가져올 수 없습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
            }
        }
    };

    const handleFind = async () => {
        if (!isFindingId && !hintAnswer) {
            Alert.alert('힌트 답변을 입력해주세요.');
            return;
        }
    
        const endpoint = isFindingId ? 'findID' : 'findPassword';
    
        const requestData = isFindingId
            ? { name, birthdate }
            : { username: name, birthdate, hintAnswer };
    
        try {
            const response = await fetch(`https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            const data = await response.json();
            if (response.ok) {
                if (isFindingId) {
                    Alert.alert('아이디 찾기', `아이디: ${data.username}`);
                } else {
                    if (data.isMatch) {
                        navigation.navigate('ReSetPasswordScreen', { username: name });
                    } else {
                        Alert.alert('비밀번호 찾기 실패', '힌트 답변이 맞지 않습니다.');
                    }
                }
            } else {
                Alert.alert('아이디 찾기 실패', data.message || '아이디를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, isFindingId && styles.activeTab]}
                    onPress={() => setIsFindingId(true)}
                >
                    <Text style={[styles.tabText, isFindingId && styles.activeTabText]}>아이디</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, !isFindingId && styles.activeTab]}
                    onPress={() => setIsFindingId(false)}
                >
                    <Text style={[styles.tabText, !isFindingId && styles.activeTabText]}>비밀번호 찾기</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>{isFindingId ? '아이디 찾기' : '비밀번호 찾기'}</Text>
            {isFindingId ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="이름"
                        value={name}
                        onChangeText={setName}
                    />
                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder={placeholder}
                            value={birthdate}
                            editable={false}
                        />
                        <DateTimePickerModal
                            headerTextIOS={placeholder}
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="아이디"
                        value={name}
                        onChangeText={setName}
                    />
                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder={placeholder}
                            value={birthdate}
                            editable={false}
                        />
                        <DateTimePickerModal
                            headerTextIOS={placeholder}
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </TouchableOpacity>
                    {!hintVisible ? (
                        <TouchableOpacity style={styles.button} onPress={fetchHint}>
                            <Text style={styles.buttonText}>힌트 보기</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.hintText}>{hint}</Text>
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="힌트 답변"
                        value={hintAnswer}
                        onChangeText={setHintAnswer}
                    />
                </>
            )}
            <TouchableOpacity style={styles.button} onPress={handleFind}>
                <Text style={styles.buttonText}>{isFindingId ? '아이디 찾기' : '비밀번호 찾기'}</Text>
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
        fontSize: 16, // 텍스트 사이즈를 통일
    },
    datePickerContainer: {
        width: '100%',
        marginBottom: 15,
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
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    hintText: {
        fontSize: 18,
        color: '#555',
        marginBottom: 5,
    },
});
