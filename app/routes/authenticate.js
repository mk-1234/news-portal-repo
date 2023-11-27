module.exports = (express, pool, jwt, secret, bcrypt) => {

  const authRouter = express.Router();

  authRouter.route('/signup').post((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT * FROM users WHERE username = ?';
      conn.query(qr, req.body.username, async (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.send({
            success: false,
            message: 'username already exists'
          });
        } else {
          console.log(req.body.password, ' - password before hash');
          req.body.password = await bcrypt.hash(req.body.password, 10);
          console.log(req.body.password, ' - password after hash');
          console.log('req body after hash:', req.body);
          let insertQr = 'INSERT INTO users SET ?';
          conn.query(insertQr, req.body, (insertErr, insertResult) => {
            if (insertErr) throw insertErr;
            conn.release();
            if (insertResult.affectedRows > 0) {
              res.send({
                success: true,
                message: 'user registration successful', 
                id: insertResult.insertId
              });
            } else {
              res.send({
                success: false,
                message: 'user registration failed!'
              });
            }
          });
        }
      });
    });
  });

  authRouter.route('/login').post((req, res) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      let qr = 'SELECT * FROM users WHERE username = ?';
      conn.query(qr, req.body.username, async (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          let data = {
            id: result[0].id,
            username: result[0].username,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            email: result[0].email,
            level: result[0].level
          }
          let comparedPassword = await bcrypt.compare(req.body.password, result[0].password);
          console.log(comparedPassword, ' - compare passwords');
          if (comparedPassword) {
            const token = jwt.sign(data, secret, {expiresIn: 1440});
            console.log('token:', token);
            res.send({
              success: true,
              token: token,
              result: data,
              message: 'user login successful'
            });
          } else {
            res.send({
              success: false,
              message: 'password does not match'
            });
          }
        } else {
          res.send({
            success: false,
            message: 'username not found'
          });
        }
      });
    });
  });

  authRouter.route('/users').put((req, res) => {
    pool.getConnection(async (err, conn) => {
      if (err) throw err;
      let qr;
      let values;
      if (req.body.password) {
        console.log(req.body.password, ' - password before hash');
        req.body.password = await bcrypt.hash(req.body.password, 10);
        console.log(req.body.password, ' - password after hash');
        console.log('req body after hash:', req.body);
        qr = 'UPDATE users SET username = ?, password = ?, firstName = ?, lastName = ?, email = ? WHERE id = ?';
        values = [
          req.body.username, req.body.password, req.body.firstName, 
          req.body.lastName, req.body.email, req.body.id
        ];
      } else {
        qr = 'UPDATE users SET username = ?, firstName = ?, lastName = ?, email = ?, level = ? WHERE id = ?';
        values = [
          req.body.username, req.body.firstName, req.body.lastName,
          req.body.email, req.body.level, req.body.id
        ];
      }
      conn.query(qr, values, (err, result) => {
        if (err) throw err;
        conn.release();
        console.log('update user result:', result);
        if (result.affectedRows > 0) {
          res.send({
            success: true, 
            message: 'user updated', 
            affected: result.affectedRows
          });
        } else {
          res.send({
            success: false,
            message: 'user update failed'
          });
        }
      });
    });
  });

  return authRouter;

};