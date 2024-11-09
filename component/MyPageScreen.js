import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MyPageScreen() {
  const navigation = useNavigation();
  const [uid, setUid] = useState('user123');
  const [nickName, setNickName] = useState('닉네임');
  const [email, setEmail] = useState('user@example.com');
  const [isChatNotificationOn, setIsChatNotificationOn] = useState(false);
  const [isSchoolNotificationOn, setIsSchoolNotificationOn] = useState(false);

  useEffect(() => {
    // 사용자 인증 데이터 로드
    // 실제 데이터가 있다면 API를 통해 불러올 수 있습니다.
    setNickName('userNickname');
    setUid('userUID');
    setEmail('user@example.com');
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => console.log('Logged out') },
    ]);
  };

  const handleAccountDeletion = () => {
    Alert.alert('회원탈퇴', '정말로 회원탈퇴 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => console.log('Account deleted') },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('캐시 삭제 완료', '캐시가 성공적으로 삭제되었습니다.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 상단 프로필 */}
      <View style={styles.profileSection}>
        <Text style={styles.profileText}>ID: {nickName}</Text>
        <Text style={styles.profileText}>Email: {email}</Text>
      </View>

      {/* 계정 관리 */}
      <Text style={styles.categoryTitle}>계정</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HistoryList')}>
        <Text style={styles.menuText}>이용기록</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.menuText}>비밀번호 변경</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, { color: 'red' }]} onPress={handleLogout}>
        <Text style={[styles.menuText, { color: 'red' }]}>로그아웃</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleAccountDeletion}>
        <Text style={styles.menuText}>회원탈퇴</Text>
      </TouchableOpacity>

      {/* 알림 설정 */}
      <Text style={styles.categoryTitle}>알림</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>채팅 알림</Text>
        <Switch
          value={isChatNotificationOn}
          onValueChange={(value) => setIsChatNotificationOn(value)}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>학교 공지사항</Text>
        <Switch
          value={isSchoolNotificationOn}
          onValueChange={(value) => setIsSchoolNotificationOn(value)}
        />
      </View>

      {/* 기타 설정 */}
      <Text style={styles.categoryTitle}>기타</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('건의/제안사항 페이지로 이동')}>
        <Text style={styles.menuText}>건의/제안사항</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
        <Text style={styles.menuText}>캐시 삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Opensource')}>
        <Text style={styles.menuText}>오픈소스 라이브러리</Text>
      </TouchableOpacity>

      {/*버전 정보*/}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>버전 1.0.0</Text>
        <Text style={styles.versionText}>ⓒ 2024 Database CapStone</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 15,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
  },
});
