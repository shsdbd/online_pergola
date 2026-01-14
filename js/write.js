document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/posts';
    const postForm = document.getElementById('post-form');
    const titleInput = document.getElementById('title-input');
    const authorInput = document.getElementById('author-input');
    const contentInput = document.getElementById('content-input');
    const cancelWriteBtn = document.getElementById('cancel-write-btn');

    // 새 게시글 등록
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !author || !content) return alert('제목, 작성자, 내용을 모두 입력해주세요.');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, author, content }),
            });
            if (!response.ok) throw new Error('게시글 등록 실패');
            
            // 성공 시 게시판 페이지로 이동
            window.location.href = 'board.html';

        } catch (error) {
            console.error('게시글 등록 오류:', error);
            alert('게시글 등록에 실패했습니다.');
        }
    });

    // '게시판으로 돌아가기' 버튼 이벤트
    cancelWriteBtn.addEventListener('click', () => {
        window.location.href = 'board.html';
    });
});
