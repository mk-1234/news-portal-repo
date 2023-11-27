module.exports = {
    port:  process.env.PORT || 8080,
    /*pool: {
      connectionLimit : 100,
      host     : 'localhost',
      user     : 'root',
      password : 'root',
      database : 'db_newsportal',
      debug    :  false
    },*/
    pool: {
      connectionLimit : 100,
      host     : 'eporqep6b4b8ql12.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
      user     : 'g0arga8ctz031l48',
      password : 'mftaskya376b73p0',
      database : 'd4mtfzzkolfb74cm',
      debug    :  false
    },
    secret:'stringfortokenABcaBcEfhfddSfht3123dfsVVsdZr62'
  }
  