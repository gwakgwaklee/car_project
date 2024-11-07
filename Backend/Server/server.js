const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3001; // 클라이언트와 일치하는 포트로 설정

app.use(cors());
app.use(express.json()); // JSON 요청을 파싱

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'svc.sel4.cloudtype.app', // 호스트 주소
    user: 'root',                   // 사용자 이름
    password: 'your_password',      // 데이터베이스 비밀번호
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




// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속주소: http://localhost:${port}`);
});
