const express =  require ('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: 'vadMiLhwtXmOWeTpYchfRPDHPzeZJqhr',
    database: 'railway',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
    } else {
      console.log('Connected to MySQL');
    }
  });


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

app.listen(3000,function(){
    console.log('Servidor activado ' );
})