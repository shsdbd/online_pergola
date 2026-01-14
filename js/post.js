document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/posts';
    const postDetailContainer = document.getElementById('post-detail-container');
    const backToBoardBtn = document.getElementById('back-to-board-btn');

    const postId = new URLSearchParams(window.location.search).get('id');

    // 게시글 상세 정보 렌더링
    const fetchAndRenderPostDetail = async () => {
        if (!postId) {
            postDetailContainer.innerHTML = '<p>잘못된 게시글 ID입니다.</p>';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${postId}`);
            if (!response.ok) throw new Error('네트워크 응답 오류');
            const post = await response.json();

            const commentsHtml = post.comments.map(comment => `
                <div class="comment">
                    <p><strong>${comment.author}</strong>: ${comment.content}</p>
                </div>
            `).join('');

            postDetailContainer.innerHTML = `
                <article class="post" data-post-id="${post.id}">
                    <h3>${post.title}</h3>
                    <p><strong>작성자:</strong> ${post.author}</p>
                    <p>${post.content}</p>
                    <div class="post-actions">
                        <button class="like-btn">좋아요</button>
                        <span class="likes-count">${post.likes}</span>
                        <button class="dislike-btn">싫어요</button>
                        <span class="dislikes-count">${post.dislikes}</span>
                    </div>
                    <div class="comments-section">
                        <h5>댓글</h5>
                        ${commentsHtml}
                        <form class="comment-form">
                            <input type="text" class="comment-author-input" placeholder="작성자" required>
                            <input type="text" class="comment-content-input" placeholder="댓글 내용" required>
                            <button type="submit">댓글 등록</button>
                        </form>
                    </div>
                </article>
            `;
        } catch (error) {
            console.error('게시글 상세 로딩 오류:', error);
            postDetailContainer.innerHTML = '<p>게시글을 불러오지 못했습니다.</p>';
        }
    };

    // '게시판으로 돌아가기' 버튼 이벤트
    backToBoardBtn.addEventListener('click', () => {
        window.location.href = 'board.html';
    });

    // 이벤트 위임을 사용하여 좋아요, 싫어요, 댓글 기능 처리
    postDetailContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const postElement = target.closest('.post');
        if (!postElement) return;

        const currentPostId = postElement.dataset.postId;

        // 좋아요 처리
        if (target.classList.contains('like-btn')) {
            try {
                const response = await fetch(`${API_URL}/${currentPostId}/like`, { method: 'POST' });
                if (!response.ok) throw new Error('좋아요 처리에 실패했습니다.');
                fetchAndRenderPostDetail(); // 상세 정보 새로고침
            } catch (error) {
                console.error('좋아요 처리 중 오류:', error);
            }
        }

        // 싫어요 처리
        if (target.classList.contains('dislike-btn')) {
            try {
                const response = await fetch(`${API_URL}/${currentPostId}/dislike`, { method: 'POST' });
                if (!response.ok) throw new Error('싫어요 처리에 실패했습니다.');
                fetchAndRenderPostDetail(); // 상세 정보 새로고침
            } catch (error) {
                console.error('싫어요 처리 중 오류:', error);
            }
        }
    });

    postDetailContainer.addEventListener('submit', async(e) => {
        e.preventDefault();
        const target = e.target;
        if(target.classList.contains('comment-form')) {
            const postElement = target.closest('.post');
            const currentPostId = postElement.dataset.postId;
            const author = target.querySelector('.comment-author-input').value.trim();
            const content = target.querySelector('.comment-content-input').value.trim();

            if (!author || !content) return alert('댓글 작성자와 내용을 모두 입력해주세요.');
            
            try {
                await fetch(`${API_URL}/${currentPostId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author, content }),
                });
                fetchAndRenderPostDetail(); // 상세 정보 새로고침
            } catch (error) {
                console.error('댓글 등록 중 오류:', error);
            }
        }
    })

    // 초기 실행
    fetchAndRenderPostDetail();
});
