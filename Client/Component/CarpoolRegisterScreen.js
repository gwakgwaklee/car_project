import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';

const regions = ["전체", "학교", "서울", "인천", "경기", "강원", "대전/충남", "충북", "광주/전남", "전북", "부산/울산/경남", "대구/경북"];

const stations = [
  // 학교 데이터
  { id: 1, region: "학교", name: "서산캠퍼스", type: "학교" },
  { id: 2, region: "학교", name: "태안캠퍼스", type: "학교" },

  // 서울 데이터
  { id: 3, region: "서울", name: "강남구", type: "서울" },
  { id: 4, region: "서울", name: "강동구", type: "서울" },
  { id: 5, region: "서울", name: "강북구", type: "서울" },
  { id: 6, region: "서울", name: "강서구", type: "서울" },
  { id: 7, region: "서울", name: "관악구", type: "서울" },
  { id: 8, region: "서울", name: "광진구", type: "서울" },
  { id: 9, region: "서울", name: "구로구", type: "서울" },
  { id: 10, region: "서울", name: "금천구", type: "서울" },
  { id: 11, region: "서울", name: "노원구", type: "서울" },
  { id: 12, region: "서울", name: "도봉구", type: "서울" },
  { id: 13, region: "서울", name: "동대문구", type: "서울" },
  { id: 14, region: "서울", name: "동작구", type: "서울" },
  { id: 15, region: "서울", name: "마포구", type: "서울" },
  { id: 16, region: "서울", name: "서대문구", type: "서울" },
  { id: 17, region: "서울", name: "서초구", type: "서울" },
  { id: 18, region: "서울", name: "성동구", type: "서울" },
  { id: 19, region: "서울", name: "성북구", type: "서울" },
  { id: 20, region: "서울", name: "송파구", type: "서울" },
  { id: 21, region: "서울", name: "양천구", type: "서울" },
  { id: 22, region: "서울", name: "영등포구", type: "서울" },
  { id: 23, region: "서울", name: "용산구", type: "서울" },
  { id: 24, region: "서울", name: "은평구", type: "서울" },
  { id: 25, region: "서울", name: "종로구", type: "서울" },
  { id: 26, region: "서울", name: "중구", type: "서울" },
  { id: 27, region: "서울", name: "중랑구", type: "서울" },

  // 인천 데이터
  { id: 28, region: "인천", name: "계양구", type: "인천" },
  { id: 29, region: "인천", name: "남동구", type: "인천" },
  { id: 30, region: "인천", name: "동구", type: "인천" },
  { id: 31, region: "인천", name: "미추홀구", type: "인천" },
  { id: 32, region: "인천", name: "부평구", type: "인천" },
  { id: 33, region: "인천", name: "서구", type: "인천" },
  { id: 34, region: "인천", name: "연수구", type: "인천" },
  { id: 35, region: "인천", name: "중구", type: "인천" },
  { id: 36, region: "인천", name: "강화군", type: "인천" },
  { id: 37, region: "인천", name: "옹진군", type: "인천" },

  // 경기 데이터
  { id: 38, region: "경기", name: "고양시", type: "경기" },
  { id: 39, region: "경기", name: "김포시", type: "경기" },
  { id: 40, region: "경기", name: "파주시", type: "경기" },
  { id: 41, region: "경기", name: "양주시", type: "경기" },
  { id: 42, region: "경기", name: "의정부시", type: "경기" },
  { id: 43, region: "경기", name: "동두천시", type: "경기" },
  { id: 44, region: "경기", name: "연천군", type: "경기" },
  { id: 45, region: "경기", name: "포천시", type: "경기" },
  { id: 46, region: "경기", name: "남양주시", type: "경기" },
  { id: 47, region: "경기", name: "구리시", type: "경기" },
  { id: 48, region: "경기", name: "가평군", type: "경기" },
  { id: 49, region: "경기", name: "하남시", type: "경기" },
  { id: 50, region: "경기", name: "양평군", type: "경기" },
  { id: 51, region: "경기", name: "광주시", type: "경기" },
  { id: 52, region: "경기", name: "성남시", type: "경기" },
  { id: 53, region: "경기", name: "수원시", type: "경기" },
  { id: 54, region: "경기", name: "용인시", type: "경기" },
  { id: 55, region: "경기", name: "안산시", type: "경기" },
  { id: 56, region: "경기", name: "화성시", type: "경기" },
  { id: 57, region: "경기", name: "평택시", type: "경기" },
  { id: 58, region: "경기", name: "안성시", type: "경기" },
  { id: 59, region: "경기", name: "오산시", type: "경기" },
  { id: 60, region: "경기", name: "이천시", type: "경기" },
  { id: 61, region: "경기", name: "여주시", type: "경기" },
  { id: 62, region: "경기", name: "광명시", type: "경기" },
  { id: 63, region: "경기", name: "시흥시", type: "경기" },
  { id: 64, region: "경기", name: "부천시", type: "경기" },
  { id: 65, region: "경기", name: "안양시", type: "경기" },
  { id: 66, region: "경기", name: "군포시", type: "경기" },
  { id: 67, region: "경기", name: "과천시", type: "경기" },
  { id: 68, region: "경기", name: "의왕시", type: "경기" },

  // 강원 데이터
  { id: 69, region: "강원", name: "춘천시", type: "강원" },
  { id: 70, region: "강원", name: "원주시", type: "강원" },
  { id: 71, region: "강원", name: "강릉시", type: "강원" },
  { id: 72, region: "강원", name: "동해시", type: "강원" },
  { id: 73, region: "강원", name: "태백시", type: "강원" },
  { id: 74, region: "강원", name: "속초시", type: "강원" },
  { id: 75, region: "강원", name: "삼척시", type: "강원" },
  { id: 76, region: "강원", name: "홍천군", type: "강원" },
  { id: 77, region: "강원", name: "횡성군", type: "강원" },
  { id: 78, region: "강원", name: "영월군", type: "강원" },
  { id: 79, region: "강원", name: "평창군", type: "강원" },
  { id: 80, region: "강원", name: "정선군", type: "강원" },
  { id: 81, region: "강원", name: "철원군", type: "강원" },
  { id: 82, region: "강원", name: "화천군", type: "강원" },
  { id: 83, region: "강원", name: "양구군", type: "강원" },
  { id: 84, region: "강원", name: "인제군", type: "강원" },
  { id: 85, region: "강원", name: "고성군", type: "강원" },
  { id: 86, region: "강원", name: "양양군", type: "강원" },

  // 충남 데이터
  { id: 87, region: "대전/충남", name: "천안시", type: "충남" },
  { id: 88, region: "대전/충남", name: "공주시", type: "충남" },
  { id: 89, region: "대전/충남", name: "보령시", type: "충남" },
  { id: 90, region: "대전/충남", name: "아산시", type: "충남" },
  { id: 91, region: "대전/충남", name: "서산시", type: "충남" },
  { id: 92, region: "대전/충남", name: "논산시", type: "충남" },
  { id: 93, region: "대전/충남", name: "계룡시", type: "충남" },
  { id: 94, region: "대전/충남", name: "당진시", type: "충남" },
  { id: 95, region: "대전/충남", name: "금산군", type: "충남" },
  { id: 96, region: "대전/충남", name: "부여군", type: "충남" },
  { id: 97, region: "대전/충남", name: "서천군", type: "충남" },
  { id: 98, region: "대전/충남", name: "청양군", type: "충남" },
  { id: 99, region: "대전/충남", name: "홍성군", type: "충남" },
  { id: 100, region: "대전/충남", name: "예산군", type: "충남" },
  { id: 101, region: "대전/충남", name: "태안군", type: "충남" },

  // 이후 나머지 데이터도 동일하게 id 값이 2씩 증가하여 적용됨
  { id: 102, region: "대전/충남", name: "동구", type: "대전" },
  { id: 103, region: "대전/충남", name: "중구", type: "대전" },
  { id: 104, region: "대전/충남", name: "서구", type: "대전" },
  { id: 105, region: "대전/충남", name: "유성구", type: "대전" },
  { id: 106, region: "대전/충남", name: "대덕구", type: "대전" },
  { id: 107, region: "충북", name: "청주시", type: "충북" },
  { id: 108, region: "충북", name: "충주시", type: "충북" },
  { id: 109, region: "충북", name: "제천시", type: "충북" },
  { id: 110, region: "충북", name: "보은군", type: "충북" },
  { id: 111, region: "충북", name: "옥천군", type: "충북" },
  { id: 112, region: "충북", name: "영동군", type: "충북" },
  { id: 113, region: "충북", name: "증평군", type: "충북" },
  { id: 114, region: "충북", name: "진천군", type: "충북" },
  { id: 115, region: "충북", name: "괴산군", type: "충북" },
  { id: 116, region: "충북", name: "음성군", type: "충북" },
  { id: 117, region: "충북", name: "단양군", type: "충북" },
  { id: 118, region: "광주/전남", name: "광산구", type: "광주" },
  { id: 119, region: "광주/전남", name: "남구", type: "광주" },
  { id: 120, region: "광주/전남", name: "동구", type: "광주" },
  { id: 121, region: "광주/전남", name: "북구", type: "광주" },
  { id: 122, region: "광주/전남", name: "서구", type: "광주" },
  { id: 123, region: "광주/전남", name: "목포시", type: "전남" },
  { id: 124, region: "광주/전남", name: "여수시", type: "전남" },
  { id: 125, region: "광주/전남", name: "순천시", type: "전남" },
  { id: 126, region: "광주/전남", name: "나주시", type: "전남" },
  { id: 127, region: "광주/전남", name: "광양시", type: "전남" },
  { id: 128, region: "광주/전남", name: "담양군", type: "전남" },
  { id: 129, region: "광주/전남", name: "곡성군", type: "전남" },
  { id: 130, region: "광주/전남", name: "구례군", type: "전남" },
  { id: 131, region: "광주/전남", name: "고흥군", type: "전남" },
  { id: 132, region: "광주/전남", name: "보성군", type: "전남" },
  { id: 133, region: "광주/전남", name: "화순군", type: "전남" },
  { id: 134, region: "광주/전남", name: "장흥군", type: "전남" },
  { id: 135, region: "광주/전남", name: "강진군", type: "전남" },
  { id: 136, region: "광주/전남", name: "해남군", type: "전남" },
  { id: 137, region: "광주/전남", name: "영암군", type: "전남" },
  { id: 138, region: "광주/전남", name: "무안군", type: "전남" },
  { id: 139, region: "광주/전남", name: "함평군", type: "전남" },
  { id: 140, region: "광주/전남", name: "영광군", type: "전남" },
  { id: 141, region: "광주/전남", name: "장성군", type: "전남" },
  { id: 142, region: "광주/전남", name: "완도군", type: "전남" },
  { id: 143, region: "광주/전남", name: "진도군", type: "전남" },
  { id: 144, region: "광주/전남", name: "신안군", type: "전남" },
  { id: 145, region: "전북", name: "전주시", type: "전북" },
  { id: 146, region: "전북", name: "군산시", type: "전북" },
  { id: 147, region: "전북", name: "익산시", type: "전북" },
  { id: 148, region: "전북", name: "정읍시", type: "전북" },
  { id: 149, region: "전북", name: "남원시", type: "전북" },
  { id: 150, region: "전북", name: "김제시", type: "전북" },
  { id: 151, region: "전북", name: "완주군", type: "전북" },
  { id: 152, region: "전북", name: "진안군", type: "전북" },
  { id: 153, region: "전북", name: "무주군", type: "전북" },
  { id: 154, region: "전북", name: "장수군", type: "전북" },
  { id: 155, region: "전북", name: "임실군", type: "전북" },
  { id: 156, region: "전북", name: "순창군", type: "전북" },
  { id: 157, region: "전북", name: "고창군", type: "전북" },
  { id: 158, region: "전북", name: "부안군", type: "전북" },
  { id: 159, region: "부산/울산/경남", name: "강서구", type: "부산" },
  { id: 160, region: "부산/울산/경남", name: "금정구", type: "부산" },
  { id: 161, region: "부산/울산/경남", name: "기장군", type: "부산" },
  { id: 162, region: "부산/울산/경남", name: "남구", type: "부산" },
  { id: 163, region: "부산/울산/경남", name: "동구", type: "부산" },
  { id: 164, region: "부산/울산/경남", name: "동래구", type: "부산" },
  { id: 165, region: "부산/울산/경남", name: "부산진구", type: "부산" },
  { id: 166, region: "부산/울산/경남", name: "북구", type: "부산" },
  { id: 167, region: "부산/울산/경남", name: "사상구", type: "부산" },
  { id: 168, region: "부산/울산/경남", name: "사하구", type: "부산" },
  { id: 169, region: "부산/울산/경남", name: "서구", type: "부산" },
  { id: 170, region: "부산/울산/경남", name: "수영구", type: "부산" },
  { id: 171, region: "부산/울산/경남", name: "연제구", type: "부산" },
  { id: 172, region: "부산/울산/경남", name: "영도구", type: "부산" },
  { id: 173, region: "부산/울산/경남", name: "중구", type: "부산" },
  { id: 174, region: "부산/울산/경남", name: "해운대구", type: "부산" },
  { id: 175, region: "부산/울산/경남", name: "중구", type: "울산" },
  { id: 176, region: "부산/울산/경남", name: "남구", type: "울산" },
  { id: 177, region: "부산/울산/경남", name: "동구", type: "울산" },
  { id: 178, region: "부산/울산/경남", name: "북구", type: "울산" },
  { id: 179, region: "부산/울산/경남", name: "울주군", type: "울산" },
  { id: 180, region: "부산/울산/경남", name: "창원시", type: "경남" },
  { id: 181, region: "부산/울산/경남", name: "진주시", type: "경남" },
  { id: 182, region: "부산/울산/경남", name: "통영시", type: "경남" },
  { id: 183, region: "부산/울산/경남", name: "사천시", type: "경남" },
  { id: 184, region: "부산/울산/경남", name: "김해시", type: "경남" },
  { id: 185, region: "부산/울산/경남", name: "밀양시", type: "경남" },
  { id: 186, region: "부산/울산/경남", name: "거제시", type: "경남" },
  { id: 187, region: "부산/울산/경남", name: "양산시", type: "경남" },
  { id: 188, region: "부산/울산/경남", name: "의령군", type: "경남" },
  { id: 189, region: "부산/울산/경남", name: "함안군", type: "경남" },
  { id: 190, region: "부산/울산/경남", name: "창녕군", type: "경남" },
  { id: 191, region: "부산/울산/경남", name: "고성군", type: "경남" },
  { id: 192, region: "부산/울산/경남", name: "남해군", type: "경남" },
  { id: 193, region: "부산/울산/경남", name: "하동군", type: "경남" },
  { id: 194, region: "부산/울산/경남", name: "산청군", type: "경남" },
  { id: 195, region: "부산/울산/경남", name: "함양군", type: "경남" },
  { id: 196, region: "부산/울산/경남", name: "거창군", type: "경남" },
  { id: 197, region: "부산/울산/경남", name: "합천군", type: "경남" },

  // 대구/경북 데이터
  { id: 198, region: "대구/경북", name: "중구", type: "대구" },
  { id: 199, region: "대구/경북", name: "동구", type: "대구" },
  { id: 200, region: "대구/경북", name: "서구", type: "대구" },
  { id: 201, region: "대구/경북", name: "남구", type: "대구" },
  { id: 202, region: "대구/경북", name: "북구", type: "대구" },
  { id: 203, region: "대구/경북", name: "수성구", type: "대구" },
  { id: 204, region: "대구/경북", name: "달서구", type: "대구" },
  { id: 205, region: "대구/경북", name: "달성군", type: "대구" },
  { id: 206, region: "대구/경북", name: "포항시", type: "경북" },
  { id: 207, region: "대구/경북", name: "경주시", type: "경북" },
  { id: 208, region: "대구/경북", name: "김천시", type: "경북" },
  { id: 209, region: "대구/경북", name: "안동시", type: "경북" },
  { id: 210, region: "대구/경북", name: "구미시", type: "경북" },
  { id: 211, region: "대구/경북", name: "영주시", type: "경북" },
  { id: 212, region: "대구/경북", name: "영천시", type: "경북" },
  { id: 213, region: "대구/경북", name: "상주시", type: "경북" },
  { id: 214, region: "대구/경북", name: "문경시", type: "경북" },
  { id: 215, region: "대구/경북", name: "경산시", type: "경북" },
  { id: 216, region: "대구/경북", name: "군위군", type: "경북" },
  { id: 217, region: "대구/경북", name: "의성군", type: "경북" },
  { id: 218, region: "대구/경북", name: "청송군", type: "경북" },
  { id: 219, region: "대구/경북", name: "영양군", type: "경북" },
  { id: 220, region: "대구/경북", name: "영덕군", type: "경북" },
  { id: 221, region: "대구/경북", name: "청도군", type: "경북" },
  { id: 222, region: "대구/경북", name: "고령군", type: "경북" },
  { id: 223, region: "대구/경북", name: "성주군", type: "경북" },
  { id: 224, region: "대구/경북", name: "칠곡군", type: "경북" },
  { id: 225, region: "대구/경북", name: "예천군", type: "경북" },
  { id: 226, region: "대구/경북", name: "봉화군", type: "경북" },
  { id: 227, region: "대구/경북", name: "울진군", type: "경북" },
  { id: 228, region: "대구/경북", name: "울릉군", type: "경북" }
];

export default function CarpoolRegisterScreen() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true); // 출발지/도착지 선택 모드

  const filteredStations = stations.filter(
    (station) =>
      (selectedRegion === "전체" || station.region === selectedRegion) &&
      station.name.includes(searchText)
  );

  // 도착지 리스트에서 출발지 제외
  const filteredEndStations = filteredStations.filter(
    (station) => station.name !== selectedStart
  );

  return (
    <View style={styles.container}>
      {/* 상단 네비게이션 */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>{isSelectingStart ? "출발지 선택" : "도착지 선택"}</Text>
      </View>

      {/* 출발지/도착지 선택 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSelectingStart(true)}>
          <Text style={[styles.headerButton, isSelectingStart && styles.selectedButton]}>
            {selectedStart || "출발지 선택"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.swapIcon}>↔</Text>
        <TouchableOpacity onPress={() => setIsSelectingStart(false)}>
          <Text style={[styles.headerButton, !isSelectingStart && styles.selectedButton]}>
            {selectedEnd || "도착지 선택"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <TextInput
        style={styles.searchInput}
        placeholder="지역을 선택해주세요."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* 좌측 스크롤 가능한 카테고리 탭 */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.categoryContainer} contentContainerStyle={styles.categoryContent}>
          {regions.map((region) => (
            <TouchableOpacity key={region} onPress={() => setSelectedRegion(region)}>
              <Text style={[styles.category, selectedRegion === region && styles.selectedCategory]}>
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 세부 지역 리스트 */}
        <FlatList
          style={styles.stationList}
          data={isSelectingStart ? filteredStations : filteredEndStations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (isSelectingStart) {
                  setSelectedStart(item.name);
                } else {
                  setSelectedEnd(item.name);
                }
              }}
            >
              <View style={styles.stationItem}>
                <View style={[styles.stationType, item.type === '고속' ? styles.highway : styles.campus]}>
                  <Text style={styles.stationTypeText}>{item.type}</Text>
                </View>
                <Text style={styles.stationName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  navBar: { height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  navTitle: { fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  headerButton: { fontSize: 16, fontWeight: 'bold', color: '#6200ee' },
  selectedButton: { color: '#6200ee', textDecorationLine: 'underline' },
  swapIcon: { marginHorizontal: 10, fontSize: 18, color: '#6200ee' },
  searchInput: { height: 40, backgroundColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 15, margin: 10 },

  contentContainer: { flex: 1, flexDirection: 'row' },
  categoryContainer: { width: '30%', backgroundColor: '#fff', paddingVertical: 10 }, // 좌측 지역 선택 너비를 30%로 조정
  categoryContent: { alignItems: 'center' },
  category: { fontSize: 14, color: 'gray', paddingVertical: 8 },
  selectedCategory: { color: '#6200ee', fontWeight: 'bold' },

  stationList: { width: '70%', paddingLeft: 10 }, // 세부 지역 리스트의 너비를 70%로 설정
  stationItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  stationType: { padding: 5, borderRadius: 5, marginRight: 10 },
  highway: { backgroundColor: '#4CAF50' },
  campus: { backgroundColor: '#FF5722' },
  stationTypeText: { color: '#fff', fontSize: 12 },
  stationName: { fontSize: 16 },
});