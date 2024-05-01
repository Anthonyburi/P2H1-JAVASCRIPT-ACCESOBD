const express =  require ('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: 'vadMiLhwtXmOWeTpYchfRPDHPzeZJqhr',
    database: 'railway',
    port:'15107'
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
// Middleware para obtener usuarios y agregar a `req`
const obtenerUsuarios = (req, res, next) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener datos de la base de datos');
    }

    req.usuarios = results; // Agregar datos al objeto `req`
    next(); // Llama al siguiente middleware o ruta
  });
};

// Rutas que usan el middleware `obtenerUsuarios`
app.get('/home', obtenerUsuarios, (req, res) => {
  console.log('Usuarios obtenidos:', req.usuarios);
  res.sendFile(__dirname + '/home.html');
});

  app.get('/home/acercade', (req, res) => {
    res.sendFile(__dirname + '/acerca.html');
  });
  app.get('/home/servicios', (req, res) => {
    res.sendFile(__dirname + '/pages/servicios.html');
  });
  app.get('/home/contacto', (req, res) => {
    res.sendFile(__dirname + '/pages/contacto.html');
  });

app.listen(3000,function(){
    console.log('Servidor activado ' );
})
