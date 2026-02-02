module.exports = {
    // 초기 세팅 커밋은 모든 규칙 무시
    ignores: [
        (message) => /^(INIT|SETUP|BOOTSTRAP)\b/.test(message),
    ],

    plugins: [
        {
            rules: {
                // 커밋 메시지 맨 앞에 Jira 티켓 키 필수
                'jira-ticket-required': ({ header }) => {
                    const jiraRegex = /^[A-Z]+-\d+\b/;

                    return [
                        jiraRegex.test(header),
                        '커밋 메시지 맨 앞에 Jira 티켓 키를 붙이세요 (예: MT2-123 add: 로그인 버튼 추가)',
                    ];
                },
            },
        },
    ],

    rules: {
        // Jira 티켓 키 필수
        'jira-ticket-required': [2, 'always'],

        // conventional commit 형식 강제 안 함
        'type-enum': [0],
        'type-case': [0],
        'subject-empty': [0],
    },
};
