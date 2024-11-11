import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CarpoolSearchPage() {
  const [carpoolList, setCarpoolList] = useState([]);

  // API 호출하여 데이터 가져오기
  useEffect(() => {
    fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/carpool')
      .then(response => response.json())
      .then(data => setCarpoolList(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>한 눈에 보는 카풀 리스트</Text>
      <Text style={styles.subtitle}>출발지-목적지, 남아구분, 남은 시간까지 한 눈에 볼 수 있어요</Text>
      {carpoolList.length > 0 ? (
        carpoolList.map((carpool, index) => (
          <TouchableOpacity key={index} style={styles.carpoolCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>출발지: {carpool.start_region}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>도착지: {carpool.end_region}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>날짜: {carpool.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>시간: {carpool.start_time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>남은 자리: {carpool.passengers}</Text>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  carpoolCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  noData: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
