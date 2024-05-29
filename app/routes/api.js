module.exports = (express,pool, jwt, secret) => {

  const apiRouter = express.Router();

  apiRouter.get('/', (req, res) => {
    console.log('Welcome to API!');
    res.send({
      message: 'Welcome to the API!'
    });
  });

  apiRouter.use((req, res, next) => {
    const token = req.body.token || req.params.token || req.headers['x-access-token'] || req.query.token || req.headers["token"];
    if (token) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          return res.status(403).send({
            success: false,
            message:'Wrong token.'
          });
        } else {
          console.log('decoded -->', decoded);
          req.decoded = decoded;
          next();
        }
      });
    } else {
      next();
    }
  });


  // --- ARTICLES ---

  apiRouter.route('/articles')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT articles.*, users.username FROM articles, users WHERE articles.authorId = users.id ORDER BY articles.createdDate DESC';
      conn.query(qr, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'all articles', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'no articles found'
          });
        }
      });
    });
  })

  .post((req, res) => {
    delete req.body.id;
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'INSERT INTO articles SET ?';
      conn.query(qr, req.body, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('insert article result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true,
            message: 'inserted article', 
            id: result.insertId
          });
        } else {
          res.send({
            success: false,
            message: 'article not inserted!'
          });
        }
      });
    });
  })

  .put((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'UPDATE articles SET authorId = ?, title = ?, category = ?, summary = ?, article = ?, image = ?, createdDate = ? WHERE id = ?';
      let values = [
        req.body.authorId, req.body.title, req.body.category, req.body.summary, 
        req.body.article, req.body.image, req.body.createdDate, req.body.id
      ];
      conn.query(qr, values, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('update article result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true, 
            message: 'article updated', 
            affected: result.affectedRows
          });
        } else {
          res.send({
            success: false,
            message: 'article update failed'
          });
        }
      });
    });
  });

  apiRouter.route('/articles/category/:category')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT articles.*, users.username FROM articles, users WHERE articles.authorId = users.id AND category = ? ORDER BY articles.createdDate DESC';
      conn.query(qr, req.params.category, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'articles by category found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'articles by category not found'
          });
        }
      });
    });
  });

  apiRouter.route('/articles/category/limit/:category')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT articles.*, users.username FROM articles, users WHERE articles.authorId = users.id AND category = ? ORDER BY articles.createdDate DESC LIMIT 13';
      conn.query(qr, req.params.category, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'articles by category and limit found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'articles by category and limit not found'
          });
        }
      });
    });
  });

  apiRouter.route('/articles/author/:authorId')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT articles.*, users.username FROM articles, users WHERE articles.authorId = users.id AND authorId = ? ORDER BY articles.createdDate DESC';
      conn.query(qr, req.params.authorId, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'articles by author found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'articles by author not found'
          });
        }
      });
    });
  });

  apiRouter.route('/articles/:id')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT articles.*, users.username FROM articles, users WHERE articles.authorId = users.id AND articles.id = ?'
      conn.query(qr, req.params.id, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'article by id found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'article by id not found'
          });
        }
      });
    });
  })

  .delete((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'DELETE FROM articles WHERE id = ?';
      conn.query(qr, req.params.id, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('delete article result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true,
            message: 'article deleted'
          });
        } else {
          res.send({
            success: false,
            message: 'article not deleted'
          });
        }
      });
    });
  });


  // --- USERS ---

  apiRouter.route('/users')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT id, username, firstName, lastName, email, level FROM users';
      conn.query(qr, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'all users', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'no users found'
          });
        }
      });
    });
  });

  apiRouter.route('/users/:id')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT id, username, firstName, lastName, email, level FROM users WHERE id = ?';
      conn.query(qr, req.params.id, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'user by id found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'user by id not found'
          });
        }
      });
    });
  })

  .delete((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'DELETE FROM users WHERE id = ?';
      conn.query(qr, req.params.id, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('delete user result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true,
            message: 'user deleted'
          });
        } else {
          res.send({
            success: false,
            message: 'user not deleted'
          });
        }
      });
    });
  });


  // --- COMMENTS ---

  apiRouter.route('/comments')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT comments.*, articles.title, users.username FROM comments, articles, users WHERE comments.userId = users.id AND comments.articleId = articles.id ORDER BY comments.createdDate DESC';
      conn.query(qr, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'all comments', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'no comments found'
          });
        }
      });
    });
  })

  .post((req, res) => {
    delete req.body.id;
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'INSERT INTO comments SET ?';
      conn.query(qr, req.body, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('insert comment result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true,
            message: 'inserted comment', 
            id: result.insertId
          });
        } else {
          res.send({
            success: false,
            message: 'comment not inserted!'
          });
        }
      });
    });
  })

  .put((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'UPDATE comments SET articleId = ?, userId = ?, comment = ?, createdDate = ? WHERE id = ?';
      let values = [req.body.articleId, req.body.userId, req.body.comment, req.body.createdDate, req.body.id];
      conn.query(qr, values, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('update comment result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true, 
            message: 'comment updated', 
            affected: result.affectedRows
          });
        } else {
          res.send({
            success: false,
            message: 'comment update failed'
          });
        }
      });
    });
  });

  apiRouter.route('/comments/article/:articleId')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT comments.*, articles.title, users.username FROM comments, articles, users WHERE comments.userId = users.id AND comments.articleId = articles.id AND comments.articleId = ? ORDER BY comments.createdDate DESC';
      conn.query(qr, req.params.articleId, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'comments by article found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'comments by article not found'
          });
        }
      });
    });
  });

  apiRouter.route('/comments/user/:userId')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT comments.*, articles.title, users.username FROM comments, articles, users WHERE comments.userId = users.id AND comments.articleId = articles.id AND comments.userId = ? ORDER BY comments.createdDate DESC';
      conn.query(qr, req.params.userId, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'comments by user found', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'comments by user not found'
          });
        }
      });
    });
  });

  apiRouter.route('/comments/:id')

  .delete((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'DELETE FROM comments WHERE id = ?';
      conn.query(qr, req.params.id, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('delete comment result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true,
            message: 'comment deleted'
          });
        } else {
          res.send({
            success: false,
            message: 'comment not deleted'
          });
        }
      });
    });
  });


  // --- IMAGES ---

  apiRouter.route('/images')

  .get((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT * FROM images';
      conn.query(qr, (err, result) => {
        if (err) throw err;
        conn.release();
        if (result.length > 0) {
          res.send({
            success: true,
            message: 'all images', 
            data: result
          });
        } else {
          res.send({
            success: false,
            message: 'no images found'
          });
        }
      });
    });
  });


  // --- ME ---

  apiRouter.get('/me', (req, res) => {
    if (req.decoded) {
      res.status(200).send({
        success: true,
        user: req.decoded,
        message: 'req.decoded found'
      });
    } else {
      res.send({
        success: false,
        message: 'req.decoded not found'
      });
    }
  });

  return apiRouter;
}
