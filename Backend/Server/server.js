// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const mysql = require('mysql2'); 
const cors = require('cors');
const dayjs = require('dayjs');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3001; // 클라이언트와 일치하는 포트로 설정

const mailer = require('./mailer.js');

// HTTP 서버 생성
const server = http.createServer(app);
// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

app.use(cors({
    origin: 'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app', // 서버 URL
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // JSON 요청을 파싱


// MySQL 연결 설정
const db = mysql.createPool({
    host: 'svc.sel4.cloudtype.app', // 호스트 주소
    user: 'root',                   // 사용자 이름
    password: '1234',               // 데이터베이스 비밀번호
    database: 'CarFull',            // 사용할 데이터베이스 이름
    port: 30240,                    // 포트 번호
    dateStrings: true, // DATE 타입을 문자열로 반환 ... 오류 나올시 삭제하셈
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
db.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }

    console.log('MySQL에 연결되었습니다.');
    connection.release(); // 연결 반환
});

// WebSocket 연결 처리- 브로드 캐스트 방식
wss.on('connection', (ws) => {
    console.log('WebSocket 연결이 설정되었습니다.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'LOCATION_UPDATE') {
                const { latitude, longitude } = data;
                console.log(`수신된 GPS 데이터: ${latitude}, ${longitude}`);

                // 연결된 모든 클라이언트로 위치 데이터 브로드캐스트
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ latitude, longitude }));
                    }
                });
            }
        } catch (error) {
            console.error('WebSocket 메시지 처리 중 오류:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket 연결이 종료되었습니다.');
    });
});

// 로그인 API - 어드민 OR 사용자 분류 
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `
        SELECT r.permission
        FROM users AS u
        INNER JOIN roles AS r ON u.id = r.id
        WHERE u.username = ? AND u.password = ?;
    `;

    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching permission:', err);
            return res.status(500).json({ message: '서버 오류' });
        }

        if (results.length > 0) {
            const { permission } = results[0];
            res.status(200).json({ message: '로그인 성공', permission });
        } else {
            res.status(401).json({ message: '잘못된 아이디 또는 비밀번호' });
        }
    });
});

// 라이센스 대기중 user 긁어오는 API
app.post('/pending-users', (req, res) => {
    // 쿼리 작성
    const query = `
        SELECT 
            ul.id,
            u.name, 
            u.birthdate, 
            ul.license_path
        FROM 
            user_license AS ul
        INNER JOIN 
            users AS u 
        ON 
            ul.id = u.id
        WHERE 
            ul.is_approved = 0
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pending users:', err);
            return res.status(500).json({ message: '데이터를 가져오는 중 오류 발생' });
        }

        // 데이터 반환
        res.status(200).json(results);
    });
});

// 사용자의 권한을 불어오는 api
app.post('/get-permission', (req, res) => {
    const { id } = req.body; // 클라이언트에서 전달받은 사용자 ID

    if (!id) {
        return res.status(400).json({ message: 'id 값이 필요합니다.' });
    }

    // id에 해당하는 permission 값을 가져오는 SQL 쿼리
    const query = 'SELECT permission FROM roles WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching permission:', err);
            return res.status(500).json({ message: '서버 오류 발생' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '해당 id에 대한 데이터가 없습니다.' });
        }

        // permission 값을 반환
        res.json({ permission: results[0].permission });
    });
});

// 승인 상태 업데이트 API
app.post('/update-approval-status', (req, res) => {
    const { id, is_approved } = req.body;

    // 요청 데이터 검증
    if (!id || is_approved === undefined) {
        return res.status(400).json({ message: 'ID 또는 승인 상태가 누락되었습니다.' });
    }

    const query = `
        UPDATE user_license
        SET is_approved = ?
        WHERE id = ?
    `;

    db.query(query, [is_approved, id], (err, result) => {
        if (err) {
            console.error('승인 상태 업데이트 중 오류:', err);
            return res.status(500).json({ message: '승인 상태 업데이트 실패' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '승인 상태 업데이트 성공' });
    });
});

// 신규 및 새로 라이센스를 승인 요청
app.post('/license-request', async (req, res) => {
    const { id, license_path } = req.body;

    // 필수 데이터 검증
    if (!id || !license_path) {
        return res.status(400).json({ message: "필수 데이터가 누락되었습니다." });
    }

    // 쿼리: 기존 유저는 업데이트, 신규 유저는 삽입
    const query = `
        INSERT INTO user_license (id, license_path, is_approved, uploaded_at)
        VALUES (?, ?, 0, NOW())
        ON DUPLICATE KEY UPDATE
            license_path = VALUES(license_path),
            is_approved = 0, -- 다시 승인 대기 상태로 변경
            uploaded_at = NOW();
    `;

    try {
        // 데이터베이스 실행
        const [result] = await db.promise().query(query, [id, license_path]);

        // 결과 처리
        if (result.affectedRows > 0) {
            const action = result.insertId ? "삽입" : "업데이트"; // insertId가 0이면 업데이트
            res.status(200).json({ message: `라이센스 정보가 성공적으로 ${action}되었습니다.` });
        } else {
            res.status(500).json({ message: "삽입 또는 업데이트에 실패했습니다." });
        }
    } catch (error) {
        // 오류 처리
        console.error("Database Error:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});


//인증코드 확인
app.post('/verify', (req, res) => {
    const { username, verificationCode } = req.body;
    console.log('이메일 인증 단계 : ', verificationCode, username)

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


// 회원가입 요청 API
app.post('/signup', async (req, res) => {
    const { username, password, birthdate, name, email, phone, vehicle, vehicleNumber, vehicleType, licenseImage } = req.body;
    const verification_code = Math.floor(100000 + Math.random() * 900000);
    const code_expiration = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
    const is_verified = 0;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Connection Error:', err);
            return res.status(500).json({ message: '서버 연결 오류' });
        }

        try {
            // 트랜잭션 시작
            await connection.promise().beginTransaction();

            // Step 1: 사용자 데이터 삽입
            const userInsertQuery = `
                INSERT INTO users (username, email, password, birthdate, name, phone, verification_code, code_expiration, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [userResult] = await connection.promise().query(userInsertQuery, [
                username,
                email,
                password,
                birthdate,
                name,
                phone,
                verification_code,
                code_expiration,
                is_verified,
            ]);

            const userId = userResult.insertId;

            // SAVEPOINT 설정
            await connection.promise().query('SAVEPOINT user_inserted');

            // Step 2: roles 테이블에 기본값 추가 (일반 사용자)
            const roleInsertQuery = `
                INSERT INTO roles (id, permission, assigned_at)
                VALUES (?, '일반 사용자', NOW())
            `;
            await connection.promise().query(roleInsertQuery, [userId]);

            // Step 3: 차량 및 라이센스 정보 삽입 (선택적)
            if (vehicle === '유') {
                const licenseInsertQuery = `
                INSERT INTO user_license (id, license_path, is_approved, uploaded_at)
                VALUES (?, ?, 0, NOW())`;
                await connection.promise().query(licenseInsertQuery, [userId, licenseImage]); // is_approved 기본값은 0

                const vehicleInsertQuery = `
                 INSERT INTO user_vehicle (owner_id, vehicle_number, vehicle_type)
                VALUES (?, ?, ?)`;
                await connection.promise().query(vehicleInsertQuery, [
                    userId,
                    vehicleNumber,
                    vehicleType,
                ]);
            }

            // 모든 작업 성공 시 커밋
            await connection.promise().commit();
            res.status(201).json({ message: '회원가입 성공! 이메일 인증 코드를 발송했습니다.' });
        } catch (err) {
            console.error('Transaction Error:', err);

            // 특정 저장점으로 롤백
            await connection.promise().query('ROLLBACK TO SAVEPOINT user_inserted');
            await connection.promise().rollback();

            res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
        } finally {
            connection.release();
        }
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

// 카풀 정보 가져오는 api
app.post('/carpool_all', (req, res) => {
    const query = `
        SELECT 
            c.room_id, c.driver, c.max_passengers, c.current_passengers,
            c.start_time, c.created_at, c.start_region, c.end_region
        FROM carpool c
        WHERE c.start_time > DATE_ADD(NOW(), INTERVAL 30 MINUTE) -- 현재 시간 + 30분 이후
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
    const { room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region, details } = req.body;

    console.log('Received POST request for /createCarpool');

    // Step 1: Driver의 permission 확인
    const checkPermissionQuery = 'SELECT permission FROM roles WHERE id = ?';
    db.query(checkPermissionQuery, [driver], (err, results) => {
        if (err) {
            console.error('Error checking driver permission:', err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (results.length === 0 || (results[0].permission !== '운전자' && results[0].permission !== '어드민')) {
            return res.status(403).json({ message: '카풀 모집 권한이 없습니다.' });
        }

        // Step 2: 카풀 생성 진행
        const insertCarpoolQuery = 'INSERT INTO carpool (room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const carpoolParams = [room_id, driver, max_passengers, date, start_time, created_at, start_region, end_region];

        db.query(insertCarpoolQuery, carpoolParams, (err) => {
            if (err) {
                console.error('Error inserting into carpool:', err);
                return res.status(500).json({ message: '카풀 생성 중 오류가 발생했습니다.' });
            }

            // Step 3: carpool_etc 테이블에 데이터 삽입
            const insertCarpoolEctQuery = 'INSERT INTO carpool_etc (room_id, details) VALUES (?, ?)';
            const carpoolEctParams = [room_id, details];

            db.query(insertCarpoolEctQuery, carpoolEctParams, (err) => {
                if (err) {
                    console.error('Error inserting into carpool_etc:', err);
                    return res.status(500).json({ message: '카풀 세부사항 저장 중 오류가 발생했습니다.' });
                }

                res.status(201).json({ message: '카풀이 성공적으로 생성되었습니다!' });
            });
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
            ce.details,
            uv.vehicle_number, -- 차량 번호 추가
            c.driver
        FROM carpool_passengers cp
        JOIN carpool c ON cp.room_id = c.room_id
        LEFT JOIN carpool_etc ce ON c.room_id = ce.room_id
        LEFT JOIN user_vehicle uv ON c.driver = uv.owner_id -- driver와 vehicle의 owner_id를 조인
        WHERE cp.passenger_id = ? -- passengers 대신 passenger_id로 수정
        AND c.start_time > DATE_ADD(NOW(), INTERVAL 30 MINUTE) -- 현재 시간 + 30분 이후
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

const deletePastCarpools = (callback) => {
    const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss'); // 현재 시간
  
    const deleteQuery = `
      DELETE FROM carpool 
      WHERE start_time < ?
    `;
  
    db.query(deleteQuery, [currentTime], (err, result) => {
      if (err) {
        console.error('과거 카풀 삭제 중 오류 발생:', err);
        callback && callback(err);
      } else {
        console.log(`과거 카풀 삭제 완료: ${result.affectedRows}개의 일정이 삭제되었습니다.`);
        callback && callback(null, result);
      }
    });
  };

  app.post('/api/point-update', async (req, res) => {
    const { driver_id, user_id, room_id, ride_temperature, drive_temperature } = req.body;

    // 필수 데이터 검증
    if (!user_id || !driver_id || !room_id || (ride_temperature === undefined && drive_temperature === undefined)) {
        return res.status(400).json({
            message: "user_id, driver_id, room_id, ride_temperature, drive_temperature가 필요합니다.",
        });
    }

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('MySQL 연결 오류:', err);
            return res.status(500).json({ message: '서버 연결 오류가 발생했습니다.' });
        }

        try {
            // 트랜잭션 시작
            await connection.promise().beginTransaction();

            // Step 1: 중복 평가 확인 (사용자)
            if (user_id&& ride_temperature !== undefined) {
                const [existingUserEvaluation] = await connection.promise().query(
                    `SELECT has_reviewed 
                     FROM carpool_passengers 
                     WHERE room_id = ? AND passenger_id = ?`,
                    [room_id, user_id]
                );

                if (existingUserEvaluation.length > 0 && existingUserEvaluation[0].has_reviewed) {
                    return res.status(400).json({ message: "이미 해당 카풀에 대해 별점을 남겼습니다." });
                }
            }

            // Step 2: 운전자의 중복 평가 확인 (운전자 별점)
            if (driver_id && drive_temperature !== undefined) {
                // 모든 승객의 has_reviewed 상태 확인
                const [passengers] = await connection.promise().query(
                    `SELECT passenger_id, has_reviewed 
                    FROM carpool_passengers 
                    WHERE room_id = ?`,
                    [room_id]
                );

                // 모든 승객의 has_reviewed 상태 확인
                const allReviewed = passengers.every((passenger) => passenger.has_reviewed === 1);

                if (!allReviewed) {
                    return res.status(400).json({ message: "모든 승객이 평가를 완료하지 않았습니다." });
                }
            }


            // Step 1: 승객이 별점 제출 (ride_temperature는 무시, drive_temperature만 반영)
            if (drive_temperature !== undefined && user_id) {
                const [userRows] = await connection.promise().query(
                    'SELECT ride_count FROM user_point WHERE id = ?',
                    [user_id]
                );

                let updatedRideCount = userRows.length > 0 ? userRows[0].ride_count + 1 : 1;

                if (userRows.length > 0) {
                    await connection.promise().query(
                        'UPDATE user_point SET ride_count = ?, updated_at = NOW() WHERE id = ?',
                        [updatedRideCount, user_id]
                    );
                } else {
                    await connection.promise().query(
                        'INSERT INTO user_point (id, ride_count, updated_at) VALUES (?, ?, NOW())',
                        [user_id, updatedRideCount]
                    );
                }

                // 운전자의 drive_temperature 업데이트
                const [driverRows] = await connection.promise().query(
                    'SELECT drive_count, drive_temperature FROM driver_point WHERE id = ?',
                    [driver_id]
                );

                let updatedDriveCount = driverRows.length > 0 ? driverRows[0].drive_count + 1 : 1;
                let updatedDriveTemp = driverRows.length > 0
                    ? (driverRows[0].drive_temperature * driverRows[0].drive_count + drive_temperature) / updatedDriveCount
                    : drive_temperature;

                if (driverRows.length > 0) {
                    await connection.promise().query(
                        'UPDATE driver_point SET drive_count = ?, drive_temperature = ?, updated_at = NOW() WHERE id = ?',
                        [updatedDriveCount, updatedDriveTemp, driver_id]
                    );
                } else {
                    await connection.promise().query(
                        'INSERT INTO driver_point (id, drive_count, drive_temperature, updated_at) VALUES (?, ?, ?, NOW())',
                        [driver_id, updatedDriveCount, drive_temperature]
                    );
                }

                // 승객 평가 상태 업데이트
                await connection.promise().query(
                    'UPDATE carpool_passengers SET do_review = 1 WHERE room_id = ? AND passenger_id = ?',
                    [room_id, user_id]
                );
            }

            // Step 2: 운전자가 별점 제출 (ride_temperature 반영)
            if (ride_temperature !== undefined && driver_id) {
                const [passengers] = await connection.promise().query(
                    'SELECT passenger_id FROM carpool_passengers WHERE room_id = ?',
                    [room_id]
                );

                for (const passenger of passengers) {
                    const [userRows] = await connection.promise().query(
                        'SELECT ride_count, ride_temperature FROM user_point WHERE id = ?',
                        [passenger.passenger_id]
                    );

                    let updatedRideCount = userRows.length > 0 ? userRows[0].ride_count + 1 : 1;
                    let updatedRideTemp = userRows.length > 0
                        ? (userRows[0].ride_temperature * userRows[0].ride_count + ride_temperature) / updatedRideCount
                        : ride_temperature;

                    if (userRows.length > 0) {
                        await connection.promise().query(
                            'UPDATE user_point SET ride_count = ?, ride_temperature = ?, updated_at = NOW() WHERE id = ?',
                            [updatedRideCount, updatedRideTemp, passenger.passenger_id]
                        );
                    } else {
                        await connection.promise().query(
                            'INSERT INTO user_point (id, ride_count, ride_temperature, updated_at) VALUES (?, ?, ?, NOW())',
                            [passenger.passenger_id, updatedRideCount, ride_temperature]
                        );
                    }
                }

                // 운전자 평가 상태 업데이트
                await connection.promise().query(
                    'UPDATE carpool_passengers SET has_reviewed = 1 WHERE room_id = ?',
                    [room_id]
                );
            }

            // 트랜잭션 커밋
            await connection.promise().commit();
            res.status(200).json({ message: '탑승 및 운전 데이터가 성공적으로 업데이트되었습니다.' });
        } catch (err) {
            console.error('데이터 저장 중 오류 발생:', err);

            // 트랜잭션 롤백
            await connection.promise().rollback();
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        } finally {
            connection.release(); // 연결 반환
        }
    });
});

app.get('/getDriverCarpools', (req, res) => {
  const { id } = req.query;

    const query = `
        SELECT 
            c.room_id, 
            c.start_region, 
            c.end_region, 
            c.start_time, 
            ce.details,
            uv.vehicle_number, -- 차량 번호 추가
            c.driver
        FROM carpool c
        LEFT JOIN carpool_etc ce ON c.room_id = ce.room_id
        LEFT JOIN user_vehicle uv ON c.driver = uv.owner_id -- driver와 vehicle의 owner_id를 조인
        WHERE c.driver = ?
        AND c.start_time > DATE_ADD(NOW(), INTERVAL 30 MINUTE) -- 현재 시간 + 30분 이후
    `;
    

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching driver carpools:', err);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    res.status(200).json({ carpools: results });
  });
});

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(port, () => {
    console.log(`서버가 실행되었습니다. http://localhost:${port}`);
});
