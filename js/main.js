document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/posts';
    const mainBoardPreview = document.getElementById('main-board-preview');
    const goToBoardBtn = document.getElementById('go-to-board-btn');

    // 메인 페이지에 상위 5개 게시글 렌더링
    const fetchAndRenderTopPosts = async () => {
        try {
            const response = await fetch(`${API_URL}?limit=5`);
            if (!response.ok) throw new Error('네트워크 응답 오류');
            const posts = await response.json();

            mainBoardPreview.innerHTML = '<h3>최신 게시글</h3>';
            if (posts.length === 0) {
                mainBoardPreview.innerHTML += '<p>게시글이 없습니다.</p>';
                return;
            }

            const ul = document.createElement('ul');
            posts.forEach(post => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="post.html?id=${post.id}">${post.title} - ${post.author} (좋아요 ${post.likes} / 싫어요 ${post.dislikes})</a>`;
                ul.appendChild(li);
            });
            mainBoardPreview.appendChild(ul);

        } catch (error) {
            console.error('상위 게시글 로딩 오류:', error);
            mainBoardPreview.innerHTML = '<p>게시글을 불러오지 못했습니다.</p>';
        }
    };

    // '글 목록 더보기' 버튼 이벤트
    goToBoardBtn.addEventListener('click', () => {
        window.location.href = 'board.html';
    });

    // 초기 실행
    fetchAndRenderTopPosts();
});
