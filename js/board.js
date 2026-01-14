document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/posts';
    const postsListContainer = document.getElementById('posts-list-container');
    const writePostBtn = document.getElementById('write-post-btn');
    const backToMainBtn = document.getElementById('back-to-main-btn');

    // 게시글 목록 렌더링
    const fetchAndRenderPosts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('네트워크 응답 오류');
            const posts = await response.json();
            
            postsListContainer.innerHTML = '<h3>게시글 목록</h3>';
            if (posts.length === 0) {
                postsListContainer.innerHTML += '<p>게시글이 없습니다.</p>';
                return;
            }

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>좋아요</th>
                        <th>싫어요</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr data-post-id="${post.id}" class="post-link">
                            <td><a href="post.html?id=${post.id}">${post.title}</a></td>
                            <td>${post.author}</td>
                            <td>${post.likes}</td>
                            <td>${post.dislikes}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            postsListContainer.appendChild(table);
        } catch (error) {
            console.error('게시글 목록 로딩 오류:', error);
            postsListContainer.innerHTML = '<p>게시글 목록을 불러오지 못했습니다.</p>';
        }
    };

    // '글 작성' 버튼 이벤트
    writePostBtn.addEventListener('click', () => {
        window.location.href = 'write.html';
    });

    // '메인으로 돌아가기' 버튼 이벤트
    backToMainBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // 초기 실행
    fetchAndRenderPosts();
});
