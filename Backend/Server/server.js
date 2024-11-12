const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3001; // 클라이언트와 일치하는 포트로 설정

app.use(cors({
    origin: 'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app', // 서버 URL
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // JSON 요청을 파싱

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'svc.sel4.cloudtype.app', // 호스트 주소
    user: 'root',                   // 사용자 이름
    password: '1234',      // 데이터베이스 비밀번호
    database: 'CarFull',            // 사용할 데이터베이스 이름
    port: 30240                     // 포트 번호
});

// MySQL 연결
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL에 연결되었습니다.');
});

// 로그인 엔드포인트
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
          if (err) {
              console.error('Error fetching user:', err); // 오류 메시지 출력
              return res.status(500).json({ message: 'Error fetching user' });
          }
          if (results.length > 0) {
              return res.status(200).json({ message: '로그인 성공' });
          } else {
              return res.status(401).json({ message: '잘못된 아이디 또는 비밀번호' });
          }
      }
  );
});

// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const { username, password, birthdate, name, hint, hintAnswer } = req.body;

    db.query(
        'INSERT INTO users (username, password, birthdate, name, hint, hint_answer) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password, birthdate, name, hint, hintAnswer],
        (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ message: 'Error creating user' });
            }
            res.status(201).json({ message: 'User created successfully!' });
        }
    );
});

// 아이디 찾기
app.post('/findID', (req, res) => {
  const { name, birthdate } = req.body;

  const query = 'SELECT username FROM users WHERE name = ? AND birthdate = ?';
  db.query(query, [name, birthdate], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    } else if (results.length > 0) {
      return res.status(200).json({ username: results[0].username });
    } else {
      return res.status(404).json({ message: '해당 정보와 일치하는 사용자가 없습니다.' });
    }
  });
});

// 비밀번호 찾기
app.post('/findPassword', (req, res) => {
    const { username, birthdate, hintAnswer } = req.body;

    // 사용자의 정보를 확인
    const query = 'SELECT hint_answer FROM users WHERE username = ? AND birthdate = ?';
    db.query(query, [username, birthdate], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        } else if (results.length > 0) {
            // 힌트 답변 확인
            if (results[0].hint_answer === hintAnswer) {
                return res.status(200).json({ isMatch: true }); // 일치하는 경우
            } else {
                return res.status(200).json({ isMatch: false }); // 일치하지 않는 경우
            }
        } else {
            return res.status(404).json({ message: '해당 정보와 일치하는 사용자가 없습니다.' });
        }
    });
});


// 힌트 가져오기
app.post('/getHint', (req, res) => {
    const { username, birthdate } = req.body;

    const query = 'SELECT hint FROM users WHERE username = ? AND birthdate = ?';
    db.query(query, [username, birthdate], (error, results) => {
        if (error) {
            console.error('Error fetching hint:', error);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        } else if (results.length > 0) {
            return res.status(200).json({ hint: results[0].hint });
        } else {
            return res.status(404).json({ message: '해당 정보와 일치하는 사용자가 없습니다.' });
        }
    });
});

// 카풀 데이터 불러오기
app.post('/carpool_all', (req, res) => {
    console.log('Received POST request for /carpool_all');
    db.query('SELECT * FROM carpool', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});


// 카풀 생성 엔드포인트
app.post('/createCarpool', (req, res) => {
    const { room_id, driver, passengers, max_passenger, date, start_time, created_at, start_region, end_region,  details } = req.body;

    console.log('Received POST request for /createCarpool');
    // carpool 테이블에 데이터 삽입
    const insertCarpoolQuery = 'INSERT INTO carpool (room_id, driver, passengers, max_passenger, date, , start_time, created_at, start_region, end_region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const carpoolParams = [room_id, driver, passengers, max_passenger, date, start_time, created_at, start_region, end_region];

    db.query(insertCarpoolQuery, carpoolParams, (err, result) => {
        if (err) {
            console.log('err=', err)
            console.error('Error inserting into carpool:', err);
            return res.status(500).json({ message: '카풀 생성 중 오류가 발생했습니다.' });
        }

        // carpool_ect 테이블에 데이터 삽입
        const insertCarpoolEctQuery = 'INSERT INTO carpool_etc (room_id, details) VALUES (?, ?)';
        const carpoolEctParams = [room_id, details];

        db.query(insertCarpoolEctQuery, carpoolEctParams, (err, result) => {
            if (err) {
                console.error('Error inserting into carpool_etc:', err);
                return res.status(500).json({ message: '카풀 세부사항 저장 중 오류가 발생했습니다.' });
            }

            res.status(201).json({ message: '카풀이 성공적으로 생성되었습니다!' });
        });
    });
});

// 회원 탈퇴 엔드포인트
app.delete('/deleteUser', (req, res) => {
    const { userid } = req.body; // 클라이언트에서 전달받은 유저 ID

    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteUserQuery, [userid], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: '회원 탈퇴 중 오류가 발생했습니다.' });
        }
        res.status(200).json({ message: '회원 탈퇴가 성공적으로 완료되었습니다.' });
    });
});


// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속주소: http://localhost:${port}`);
});