module.exports = {
    port:  process.env.PORT || 8080,
    pool: {
      connectionLimit : process.env.CONNECTION_LIMIT || 100,
      host     : process.env.HOST || 'localhost',
      user     : process.env.USER || 'root',
      password : process.env.PASSWORD || 'root',
      database : process.env.DATABASE || 'db_newsportal',
      debug    : process.env.DEBUG || false
    }, 
    secret: process.env.SECRET_STRING || 'justarandomstring'
  }
  