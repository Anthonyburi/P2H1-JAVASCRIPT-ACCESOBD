const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Express para usar EJS
app.set("view engine", "ejs");
app.set("views", "views");

// Configurar MySQL

const db = mysql.createConnection({
  host: "roundhouse.proxy.rlwy.net",
  user: "root",
  password: "vadMiLhwtXmOWeTpYchfRPDHPzeZJqhr",
  database: "railway",
  port: "15107",
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    process.exit(1);
  } else {
    console.log("Conectado a la base de datos");
  }
});

// Configurar sesiones
app.use(
  session({
    secret: "secreto-muy-secreto",
    resave: false,
    saveUninitialized: true,
  })
);

// Ruta para el inicio
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/inicio");
  } else {
    res.redirect("/login");
  }
});

// Ruta para mostrar el formulario de login
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/inicio");
  } else {
    res.render("login");
  }
});

// Ruta para la página de inicio protegida
app.get("/inicio", (req, res) => {
  res.render("index");
});

// Ruta para la página de inicio protegida
app.get("/register", (req, res) => {
  res.render("registro");
});

app.get("/incio/acerca", (req, res) => {
  res.render("acerca");
});
app.get("/incio/contacto", (req, res) => {
  res.render("contacto");
});
app.get("/incio/servicios", (req, res) => {
  res.render("servicios");
});
app.get("/incio/productos", (req, res) => {
  res.render("productos");
});



app.post("/register", async (req, res) => {
    const { usuario, email, password } = req.body;
  
    try {
      // Insertar el nuevo usuario en la base de datos
      const query = "INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)";
      db.query(query, [usuario, email, password], (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "El correo electrónico ya está en uso." });
            return; // Detener ejecución después de enviar respuesta
          } else {
            res.status(500).json({ error: "Error al registrar el usuario." });
            return; // Detener ejecución después de enviar respuesta
          }
        }
  
        // Si no hay errores, redirigir a la página de login
        res.redirect("/login");
      });
    } catch (error) {
      res.status(500).json({ error: "Error al procesar la solicitud." });
    }
  });
  

// Ruta para procesar el login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM usuarios WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      res.status(500).send("Error al procesar la solicitud.");
    } else if (results.length === 0) {
      res.render("login", { error: "Credenciales incorrectas." });
    } else {
      const usuario = results[0];
      req.session.userId = usuario.id;
      req.session.nombreUsuario = usuario.nombre;
      console.log(usuario.id);
      res.redirect("/inicio");
    }
  });
});

// Ruta para cerrar sesión
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Cierre de sesión exitoso." });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
