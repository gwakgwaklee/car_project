import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import { CarpoolContext } from '../CarpoolContext_NoDB'; // Context import
export default function CarpoolRecruitPage({ navigation }) {

    const { addCarpool } = useContext(CarpoolContext); // addCarpool 함수 가져오기
    // 초기 상태 설정
  const [startPoint, setStartPoint] = useState({
    name: '한서대 정문',
    location: { latitude: 36.69081, longitude: 126.5807 }
  });
  const [endPoint, setEndPoint] = useState({
    name: '국빈각',
    location: { latitude: 36.69013, longitude: 126.5764 }
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date(Date.now() + 15 * 60 * 1000)); // 15분 후
  const [selectedLimit, setSelectedLimit] = useState('3인');
  const [selectedGender, setSelectedGender] = useState('');
  const [startPointDetail, setStartPointDetail] = useState('');
  const [endPointDetail, setEndPointDetail] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 주소 유효성 검사
  const isAddressValid = (address) => address.length >= 2 && address.length <= 10;
  
  // 시간 유효성 검사
  const isTimeValid = (date, time) => {
    const selectedDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
    return selectedDateTime - new Date() >= 10 * 60 * 1000; // 현재 시간으로부터 최소 10분 이후
  };

  // 출발지와 도착지 교환
  const swapPoints = () => {
    const tempPoint = startPoint;
    const tempDetail = startPointDetail;
    setStartPoint(endPoint);
    setEndPoint(tempPoint);
    setStartPointDetail(endPointDetail);
    setEndPointDetail(tempDetail);
  };

  // 카풀 시작 버튼
  const handleCreateCarpool = () => {
    if (!isAddressValid(startPointDetail) || !isAddressValid(endPointDetail)) {
      Alert.alert("카풀 생성 실패", "요약주소는 2 ~ 10 글자로 작성해주세요.");
      return;
    }

    if (!isTimeValid(selectedDate, selectedTime)) {
      Alert.alert("카풀 생성 실패", "카풀을 생성하기 위한 시간은 현재 시간으로부터 10분 이후여야 합니다.");
      return;
    }

    // 생성된 카풀 정보를 객체로 정리
    const carpoolDetails = {
      startPoint,
      endPoint,
      selectedDate: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
      selectedTime: selectedTime.toLocaleTimeString(), // HH:MM 형식으로 변환
      selectedLimit,
      selectedGender
    };

    addCarpool(carpoolDetails);
    Alert.alert("카풀 생성 완료", "카풀이 성공적으로 생성되었습니다!");
    navigation.navigate("Home");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>카풀 모집하기</Text>

      {/* 출발지 입력 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>출발지</Text>
        <TextInput
          style={styles.input}
          placeholder="출발지 요약 주소 (예: 한서대 **빌라 앞)"
          value={startPointDetail}
          onChangeText={setStartPointDetail}
        />
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: startPoint.location.latitude,
            longitude: startPoint.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={startPoint.location} title={startPoint.name} />
        </MapView>
      </View>

      {/* 도착지 입력 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>도착지</Text>
        <TextInput
          style={styles.input}
          placeholder="도착지 요약 주소 (예: 한서대 **빌라 앞)"
          value={endPointDetail}
          onChangeText={setEndPointDetail}
        />
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: endPoint.location.latitude,
            longitude: endPoint.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={endPoint.location} title={endPoint.name} />
        </MapView>
      </View>

      {/* 출발지와 도착지 교환 버튼 */}
      <Button title="출발지와 도착지 교환" onPress={swapPoints} />

      {/* 날짜 선택 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>출발 날짜</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          {/* <Text style={styles.input}>{selectedDate.toDateString()}</Text> */}
          <Text style={styles.input}>{selectedDate.toISOString().split('T')[0]}</Text>
          
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </View>

      {/* 시간 선택 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>출발 시간</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Text style={styles.input}>{selectedTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={selectedTime}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
      </View>

      {/* 성별 및 인원 제한 */}
      {/* <View style={styles.inputContainer}>
        <Text style={styles.label}>성별</Text>
        <Picker selectedValue={selectedGender} onValueChange={(itemValue) => setSelectedGender(itemValue)}>
          <Picker.Item label="남성" value="남성" />
          <Picker.Item label="여성" value="여성" />
        </Picker>
      </View> */}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>인원 제한</Text>
        <Picker selectedValue={selectedLimit} onValueChange={(itemValue) => setSelectedLimit(itemValue)}>
          <Picker.Item label="3인" value="3인" />
          <Picker.Item label="4인" value="4인" />
        </Picker>
      </View>

      {/* 카풀 시작 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleCreateCarpool}>
        <Text style={styles.buttonText}>카풀 시작</Text>
      </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 8,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
