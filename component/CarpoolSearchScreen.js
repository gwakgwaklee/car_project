import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CarpoolContext } from '../CarpoolContext_NoDB'; // Context import

export default function CarpoolSearchPage() {
  const { carpoolList } = useContext(CarpoolContext); // carpoolList 가져오기

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>카풀 찾기</Text>
      {carpoolList.length > 0 ? (
        carpoolList.map((carpool, index) => (
          <View key={index} style={styles.carpoolCard}>
            <Text style={styles.label}>출발지: {carpool.startPoint.name}</Text>
            <Text style={styles.label}>도착지: {carpool.endPoint.name}</Text>
            <Text style={styles.label}>날짜: {carpool.selectedDate}</Text>
            <Text style={styles.label}>시간: {carpool.selectedTime}</Text>
            <Text style={styles.label}>인원 제한: {carpool.selectedLimit}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>현재 표시할 카풀 일정이 없습니다.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  carpoolCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  noData: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});




