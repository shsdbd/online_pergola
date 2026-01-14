const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// 데이터베이스 연결
const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('SQLite 데이터베이스에 연결되었습니다.');
});

// 테이블 생성
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            likes INTEGER DEFAULT 0,
            dislikes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts (id)
        )
    `);
});


app.use(express.static(__dirname));
app.use(express.json());

// --- API 엔드포인트 ---

// 모든 게시글 가져오기 (또는 상위 N개)
app.get('/api/posts', (req, res) => {
    let sql = `SELECT id, title, author, likes, dislikes FROM posts ORDER BY created_at DESC`;
    if (req.query.limit) {
        const limit = parseInt(req.query.limit);
        if (!isNaN(limit) && limit > 0) {
            sql += ` LIMIT ${limit}`;
        }
    }

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 특정 ID의 게시글 하나와 댓글들 가져오기
app.get('/api/posts/:id', (req, res) => {
    const postSql = `SELECT * FROM posts WHERE id = ?`;
    const commentsSql = `SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`;

    db.get(postSql, [req.params.id], (err, post) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!post) {
            res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
            return;
        }

        db.all(commentsSql, [req.params.id], (err, comments) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            post.comments = comments || [];
            res.json(post);
        });
    });
});

// 새 게시글 추가
app.post('/api/posts', (req, res) => {
    const { title, author, content } = req.body;
    if (!title || !author || !content) {
        return res.status(400).json({ error: '제목, 작성자, 내용이 모두 필요합니다.' });
    }
    const sql = `INSERT INTO posts (title, author, content) VALUES (?, ?, ?)`;
    db.run(sql, [title, author, content], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

// 좋아요
app.post('/api/posts/:id/like', (req, res) => {
    const sql = `UPDATE posts SET likes = likes + 1 WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ changes: this.changes });
    });
});

// 싫어요
app.post('/api/posts/:id/dislike', (req, res) => {
    const sql = `UPDATE posts SET dislikes = dislikes + 1 WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ changes: this.changes });
    });
});

// 댓글 추가
app.post('/api/posts/:id/comments', (req, res) => {
    const { author, content } = req.body;
    if (!author || !content) {
        return res.status(400).json({ error: '댓글 작성자와 내용이 모두 필요합니다.' });
    }
    const sql = `INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)`;
    db.run(sql, [req.params.id, author, content], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});


app.listen(port, '0.0.0.0', () => {
    console.log(`서버가 http://localhost:${port} 및 네트워크 주소에서 실행 중입니다.`);
});