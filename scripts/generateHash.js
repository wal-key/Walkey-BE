const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
    console.error('사용법: node scripts/generateHash.js <비밀번호>');
    process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('에러 발생:', err);
        return;
    }
    console.log('✅ 비밀번호 Hash 생성 완료!');
    console.log('----------------------------------------');
    console.log(`입력된 비밀번호: ${password}`);
    console.log(`생성된 해시: ${hash}`);
    console.log('----------------------------------------');
    console.log('아래 SQL을 실행하여 테스트 유저를 추가하세요 (pgAdmin 또는 SQL 툴 사용):');
    console.log(`INSERT INTO public."user" (email, nickname, password) VALUES ('test@example.com', '테스터', '${hash}');`);
});
