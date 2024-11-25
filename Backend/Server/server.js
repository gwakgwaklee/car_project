// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dayjs = require('dayjs');

const app = express();
const port = 3001; // 클라이언트와 일치하는 포트로 설정

const mailer = require('./mailer.js');

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


// // Nodemailer SMTP 설정
// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for port 465, false for other ports
//     auth: {
//       user: "maddison53@ethereal.email",
//       pass: "jn7jnAPss4f63QBp6D",
//     },
//   });

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

//인증코드 확인
app.post('/verify', (req, res) => {
    const { username, verificationCode } = req.body;

    db.query(
        'SELECT verification_code, code_expiration FROM users WHERE username = ?',
        [username],
        (err, results) => {
            if (err) {
                console.error('Error fetching verification code:', err);
                return res.status(500).json({ message: '인증 코드 확인 중 오류가 발생했습니다.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
            }

            const { verification_code, code_expiration } = results[0];
            const currentTime = dayjs();

            console.log('Stored Code:', verification_code);
            console.log('User Input Code:', verificationCode);
            console.log('Code Expiration:', code_expiration);

            if (parseInt(verificationCode) === parseInt(verification_code)) {
                if (currentTime.isBefore(dayjs(code_expiration))) {
                    // 인증 성공
                    db.query(
                        'UPDATE users SET is_verified = 1 WHERE username = ?',
                        [username],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating verification status:', updateErr);
                                return res.status(500).json({ message: '인증 상태 업데이트 중 오류가 발생했습니다.' });
                            }
                            res.status(200).json({ message: '인증이 완료되었습니다!' });
                        }
                    );
                } else {
                    res.status(400).json({ message: '인증 코드가 만료되었습니다.' });
                }
            } else {
                res.status(400).json({ message: '잘못된 인증 코드입니다.' });
            }
        }
    );
});

//새 인증 코드 재전송
app.post('/resendCode', (req, res) => {
    const { username, email } = req.body;

    // 새 인증 코드와 만료 시간 생성
    const newCode = Math.floor(100000 + Math.random() * 900000);
    const newExpiration = dayjs().add(10, 'minute').format('YYYY-MM-DD HH:mm:ss');

    console.log('Generated New Code:', newCode);
    // 데이터베이스 업데이트
    db.query(
        'UPDATE users SET verification_code = ?, code_expiration = ? WHERE username = ? AND email = ?',
        [newCode, newExpiration, username, email],
        (err, result) => {
            if (err) {
                console.error('Error updating verification code:', err);
                return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            // 이메일 전송
            mailer(
                username,                          // 발신자 이름
                email,                         // 수신자 이메일
                '회원가입 인증 코드',           // 이메일 제목
                `<p>안녕하세요, <b>${username}</b>님!</p>
                    <p>회원가입을 완료하려면 아래 인증 코드를 입력해주세요.</p>
                    <h3>인증 코드: <b>${newCode}</b></h3>
                    <p>이 코드는 10분 동안 유효합니다.</p>` // HTML 메시지 내용
            )
            .then((response) => {
                if (response === 'success') {
                    return res.status(201).json({ message: '회원가입 성공! 이메일로 인증 코드를 발송했습니다.' });
                } else {
                    console.error('Error sending email:', response);
                    return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
                }
            })
            .catch((error) => {
                console.error('Email Error:', error);
                return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
            });
        }
    );
});

// // 회원가입 엔드포인트
// app.post('/signup', (req, res) => {
//     const { username, password, birthdate, name, hint, hintAnswer, email } = req.body;
//     // 6자리 랜덤 인증 코드 생성
//     const verification_code = Math.floor(100000 + Math.random() * 900000);
//     const code_expiration = dayjs().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // 10분 뒤 만료


//     db.query(
//         'INSERT INTO users (username, email, verification_code, code_expiration, password, birthdate, name, hint, hint_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//         [username, email, verification_code, code_expiration, password, birthdate, name, hint, hintAnswer],
//         (err, result) => {
//             if (err) {
//                 console.error('Error inserting user:', err);
//                 return res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
//             }

//             // 이메일 전송
//             const mailOptions = {
//                 from: 'your-email@gmail.com', // 발신자 이메일
//                 to: email, // 수신자 이메일
//                 subject: '회원가입 인증 코드',
//                 text: `안녕하세요, ${name}님! 인증 코드는 ${verification_code}입니다.`,
//             };

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error('Error sending email:', error);
//                     return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
//                 }
//                 res.status(201).json({ message: '회원가입 성공! 이메일로 인증 코드를 발송했습니다.' });
//             });
//         }
//     );
// });


// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const { username, password, birthdate, name, hint, hintAnswer, email } = req.body;
    // 6자리 랜덤 인증 코드 생성
    const verification_code = Math.floor(100000 + Math.random() * 900000);
    const code_expiration = dayjs().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // 10분 뒤 만료
    const created_at = dayjs().format('YYYY-MM-DD HH:mm:ss'); // 생성 시간

    console.log('Generated Code:', verification_code);
    console.log("Environment Variables:", process.env);
    console.log('GMAIL ADDRESS:', process.env.REACT_APP_GMAIL_ADDRESS);
    console.log('GMAIL PASSWORD:', process.env.REACT_APP_GMAIL_PASSWORD);

    db.query(
        'INSERT INTO users (username, email, verification_code, code_expiration, password, birthdate, name, hint, hint_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, email, verification_code, code_expiration, password, birthdate, name, hint, hintAnswer],
        (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
            }

            const userId = result.insertId; // 생성된 사용자 ID
            // roles 테이블에 기본 권한 추가
            const insertRoleQuery = `
            INSERT INTO roles (id, permission, assigned_at)
            VALUES (?, '1', ?)
            `;
            const roleParams = [userId, created_at];

            db.query(insertRoleQuery, roleParams, (err) => {
            if (err) {
                console.error('Error inserting role:', err);
                return res.status(500).json({ message: '회원 권한 설정 중 오류가 발생했습니다.' });
            }

            // user_vehicle 테이블에 기본 차량 정보 추가
            const insertVehicleQuery = `
                INSERT INTO user_vehicle (owner_id, vehicle_number, vehicle_type)
                VALUES (?, ?, ?)
            `;
            const vehicleParams = [userId, '', ''];

            db.query(insertVehicleQuery, vehicleParams, (err) => {
                if (err) {
                    console.error('Error inserting vehicle info:', err);
                    return res.status(500).json({ message: '차량 정보 추가 중 오류가 발생했습니다.' });
                }

                // 이메일 전송
                mailer(
                    username,                          // 발신자 이름
                    email,                         // 수신자 이메일
                    '회원가입 인증 코드',           // 이메일 제목
                    `<p>안녕하세요, <b>${username}</b>님!</p>
                    <p>회원가입을 완료하려면 아래 인증 코드를 입력해주세요.</p>
                    <h3>인증 코드: <b>${verification_code}</b></h3>
                    <p>이 코드는 10분 동안 유효합니다.</p>` // HTML 메시지 내용
                )
                .then((response) => {
                    if (response === 'success') {
                        return res.status(201).json({ message: '회원가입 성공! 이메일로 인증 코드를 발송했습니다.' });
                    } else {
                        console.error('Error sending email:', response);
                        return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
                    }
                })
                .catch((error) => {
                    console.error('Email Error:', error);
                    return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
                });
            });
        });
    });
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
    const query = 'SELECT password, email, hint_answer FROM users WHERE username = ? AND birthdate = ?';
    db.query(query, [username, birthdate], (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            const { password, email, hint_answer } = results[0];
            
            // 힌트 답변 확인
            if (hint_answer === hintAnswer) {
                // 이메일로 비밀번호 전송
                mailer(
                    'Carpool App',             // 발신자 이름
                    email,                    // 수신자 이메일
                    '비밀번호 찾기 결과',     // 이메일 제목
                    `<p>안녕하세요, <b>${username}</b>님!</p>
                     <p>비밀번호 찾기 요청 결과입니다.</p>
                     <h3>비밀번호: <b>${password}</b></h3>
                     <p>이메일 인증을 통해 비밀번호를 확인하세요.</p>` // 이메일 본문 내용
                )
                .then((response) => {
                    if (response === 'success') {
                        return res.status(200).json({ message: '비밀번호가 이메일로 전송되었습니다.' });
                    } else {
                        console.error('Error sending email:', response);
                        return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
                    }
                })
                .catch((error) => {
                    console.error('Email Error:', error);
                    return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
                });
            } else {
                return res.status(400).json({ message: '힌트 답변이 맞지 않습니다.' });
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
    const query = `
        SELECT 
            c.room_id, c.driver, c.max_passengers, c.current_passengers,
            c.start_time, c.created_at, c.start_region, c.end_region
        FROM carpool c
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching carpool data:', err);
            return res.status(500).json({ message: '서버 오류 발생' });
        }
        res.json(results);
    });
});

// 특정 room_id에 대한 carpool_etc 데이터 가져오기
app.post('/carpool_etc', (req, res) => {
    const { roomIds } = req.body; // 클라이언트에서 요청된 room_id 배열을 받음

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
        return res.status(400).json({ message: 'roomIds 배열이 필요합니다.' });
    }

    // room_id 목록에 해당하는 carpool_etc 데이터 가져오기
    const query = 'SELECT * FROM carpool_etc WHERE room_id IN (?)';
    db.query(query, [roomIds], (err, results) => {
        if (err) {
            console.error('Error fetching carpool_etc data:', err);
            return res.status(500).json({ message: 'carpool_etc 데이터 가져오는 중 오류가 발생했습니다.' });
        }
        res.json(results);
    });
});

// 카풀 생성 엔드포인트
app.post('/createCarpool', (req, res) => {
    const { room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region,  details } = req.body;

    console.log('Received POST request for /createCarpool');
    // carpool 테이블에 데이터 삽입
    const insertCarpoolQuery = 'INSERT INTO carpool (room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const carpoolParams = [room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region];

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

// 카풀을 신청하는 부분
app.post('/update_passengers', (req, res) => {
    const { id, roomId } = req.body;

    if (!id || !roomId) {
        return res.status(400).json({ message: '필수 값이 누락되었습니다.' });
    }

    // 1. 해당 room의 현재 상태를 확인
    const checkCarpoolQuery = 'SELECT current_passengers, max_passengers FROM carpool WHERE room_id = ?';
    db.query(checkCarpoolQuery, [roomId], (err, carpoolResults) => {
        if (err) {
            console.error('Error fetching carpool data:', err);
            return res.status(500).json({ message: '서버 오류 발생' });
        }

        if (carpoolResults.length === 0) {
            return res.status(404).json({ message: '해당 카풀 방이 존재하지 않습니다.' });
        }

        const { current_passengers, max_passengers } = carpoolResults[0];

        // 2. 최대 인원을 초과하는지 확인
        if (current_passengers >= max_passengers - 1) {
            return res.status(400).json({ message: '최대 인원을 초과하였습니다.' });
        }

        // 3. 이미 신청한 사용자인지 확인
        const checkPassengerQuery = 'SELECT * FROM carpool_passengers WHERE room_id = ? AND passenger_id = ?';
        db.query(checkPassengerQuery, [roomId, id], (err, passengerResults) => {
            if (err) {
                console.error('Error checking passenger:', err);
                return res.status(500).json({ message: '서버 오류 발생' });
            }

            if (passengerResults.length > 0) {
                return res.status(400).json({ message: '이미 신청한 사용자입니다.' });
            }

            // 4. carpool_passengers 테이블에 추가
            const insertPassengerQuery = 'INSERT INTO carpool_passengers (room_id, passenger_id, joined_at) VALUES (?, ?, NOW())';
            db.query(insertPassengerQuery, [roomId, id], (err) => {
                if (err) {
                    console.error('Error inserting passenger:', err);
                    return res.status(500).json({ message: '서버 오류 발생' });
                }

                // 5. carpool 테이블의 current_passengers 업데이트
                const updateCarpoolQuery = 'UPDATE carpool SET current_passengers = current_passengers + 1 WHERE room_id = ?';
                db.query(updateCarpoolQuery, [roomId], (err) => {
                    if (err) {
                        console.error('Error updating current passengers:', err);
                        return res.status(500).json({ message: '서버 오류 발생' });
                    }

                    return res.status(200).json({ message: '카풀 신청이 완료되었습니다.' });
                });
            });
        });
    });
});

// 특정 사용자가 참여한 카풀 예약 목록 가져오기
app.get('/getPassengers', (req, res) => {
    const { id } = req.query; // 클라이언트에서 전달받은 사용자 ID

    // carpool_passengers와 carpool 테이블을 조인하여 예약 정보를 가져옴
    const query = `
        SELECT 
            c.room_id, 
            c.start_region, 
            c.end_region, 
            c.start_time, 
            ce.details
        FROM carpool_passengers cp
        JOIN carpool c ON cp.room_id = c.room_id
        LEFT JOIN carpool_etc ce ON c.room_id = ce.room_id
        WHERE cp.passenger_id = ? -- passengers 대신 passenger_id로 수정
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching passenger reservations:', err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            res.status(200).json({ reservations: results });
        } else {
            res.status(404).json({ message: '예약 내역이 없습니다.' });
        }
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

// 비밀번호 변경 엔드포인트
app.post('/changePassword', (req, res) => {
    const { id, newPassword } = req.body; // 유저 id와 새 비밀번호를 클라이언트에서 받아옴

    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(query, [newPassword, id], (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    });
});

// // 유저 ID를 사용하여 카풀 데이터를 가져오는 엔드포인트
// app.get('/getCarpoolByUserId/:userid', (req, res) => {
//     const { userid } = req.params; // URL 파라미터로 유저 ID를 받음

//     const query = 'SELECT * FROM usrs WHERE username = ?'; // 예: driver 컬럼이 해당 유저 ID를 참조한다고 가정
//     db.query(query, [userid], (err, results) => {
//         if (err) {
//             console.error('Error fetching carpool data:', err);
//             return res.status(500).json({ message: '카풀 데이터를 가져오는 중 오류가 발생했습니다.' });
//         }
        
//         if (results.length > 0) {
//             return res.status(200).json(results);
//         } else {
//             return res.status(404).json({ message: '해당 유저의 카풀 데이터가 없습니다.' });
//         }
//     });
// });


app.get('/getUserId', (req, res) => {
    const { username } = req.query; // 클라이언트에서 username을 쿼리로 전달받음
    console.log('요청된 username:', username); // 요청된 username 콘솔 출력

    const query = 'SELECT id FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err); // 오류 로그 출력
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            console.log('조회된 결과:', results); // DB에서 조회된 결과 로그
            return res.status(200).json({ id: results[0].id });
        } else {
            console.log('해당 유저를 찾을 수 없습니다:', username); // 유저가 없을 때 로그 출력
            return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
        }
    });
});

app.post("/cancelReservation", (req, res) => {
  const { id, roomId } = req.body;

  const deletePassengerQuery =
    "DELETE FROM carpool_passengers WHERE passenger_id = ? AND room_id = ?";
  db.query(deletePassengerQuery, [id, roomId], (err) => {
    if (err) {
      console.error("Error deleting passenger:", err);
      return res.status(500).json({ message: "카풀 취소 중 오류 발생" });
    }

    const updateCarpoolQuery =
      "UPDATE carpool SET current_passengers = current_passengers - 1 WHERE room_id = ?";
    db.query(updateCarpoolQuery, [roomId], (err) => {
      if (err) {
        console.error("Error updating carpool:", err);
        return res.status(500).json({ message: "카풀 업데이트 중 오류 발생" });
      }

      res.status(200).json({ message: "카풀이 성공적으로 취소되었습니다." });
    });
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
