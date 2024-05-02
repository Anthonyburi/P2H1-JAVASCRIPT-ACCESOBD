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
app.get('/inicio', (req, res) => {
  // Definir las dos consultas
  const queryProductos = 'SELECT * FROM productos';
  const queryServicios = 'SELECT * FROM servicios';

  // Crear promesas para cada consulta
  const promesaProductos = new Promise((resolve, reject) => {
    db.query(queryProductos, (err, results) => {
      if (err) {
        reject(err); // Rechazar la promesa si hay un error
      } else {
        resolve(results); // Resolver con los resultados
      }
    });
  });

  const promesaServicios = new Promise((resolve, reject) => {
    db.query(queryServicios, (err, results) => {
      if (err) {
        reject(err); // Rechazar la promesa si hay un error
      } else {
        resolve(results); // Resolver con los resultados
      }
    });
  });

  // Usar Promise.all para esperar a que ambas promesas se resuelvan
  Promise.all([promesaProductos, promesaServicios])
    .then(([productos, servicios]) => {
      // Renderizar la plantilla EJS con ambos conjuntos de datos
      res.render('index', { productos, servicios });
    })
    .catch((err) => {
      // Manejar errores en cualquiera de las promesas
      res.status(500).json({ error: 'Error al obtener datos del servidor.' });
    });
});


// Ruta para la página de inicio protegida
app.get("/register", (req, res) => {
  res.render("registro");
});

app.get("/acerca", (req, res) => {
  res.render("acerca");
});
app.get("/contacto", (req, res) => {
  res.render("contacto");
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

//PRODUCTOS
// Leer todos los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los productos.' });
    } else {
     // res.status(200).json(results); // Devuelve todos los productos
     res.render('productos', { productos: results });
    }
  });
});

// Ruta para mostrar el formulario de nuevo producto
app.get('/productos/add', (req, res) => {
  res.render('nuevoProducto'); // Renderiza la plantilla para agregar productos
});


// Leer un producto por ID
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM productos WHERE id_producto = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener el producto.' });
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado.' });
    } else {
      res.status(200).json(result[0]); // Devuelve el producto por ID
    }
  });
});

// Crear un producto
app.post('/productos', (req, res) => {
  const { name_producto, descr_producto, precio_producto, estado_producto,img_producto } = req.body;

  const query = 'INSERT INTO productos (name_producto, descr_producto, precio_producto, estado_producto,img_producto) VALUES (?, ?, ?, ?,?)';
  db.query(query, [name_producto, descr_producto, precio_producto, estado_producto,img_producto], (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar el producto.');
    } else {
      res.redirect('/productos'); // Redirigir a la lista de productos después de agregar
    }
  });
});

// Actualizar un producto por ID
app.get('/productos/editar/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM productos WHERE id_producto = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener el producto.');
    } else if (result.length === 0) {
      res.status(404).send('Producto no encontrado.');
    } else {
      res.render('editarProducto', { producto: result[0] }); // Renderiza el formulario de edición con los datos del producto
    }
  });
});

app.post('/productos/editar/:id', (req, res) => {
  const { id } = req.params;
  const { name_producto, descr_producto, precio_producto, estado_producto ,img_producto } = req.body;

  const query = 'UPDATE productos SET name_producto = ?, descr_producto = ?, precio_producto = ?, estado_producto = ?, img_producto = ? WHERE id_producto = ?';
  db.query(query, [name_producto, descr_producto, precio_producto, estado_producto,img_producto, id], (err, result) => {
    if (err) {
      res.status(500).send('Error al actualizar el producto.');
    } else {
      res.redirect('/productos'); // Redirigir a la lista de productos después de editar
    }
  });
});



// Eliminar un producto por ID
app.post('/productos/eliminar/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM productos WHERE id_producto = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar el producto.');
    } else {
      res.redirect('/productos'); // Redirigir a la lista de productos después de eliminar
    }
  });
});

//SERVICIOS
app.get('/servicios', (req, res) => {
  const query = 'SELECT * FROM servicios';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los servicios.' });
    } else {
      //res.status(200).json(results); // Devuelve todos los servicios
      res.render("servicios",{servicios:results});
    }
  });
});

// Ruta para mostrar el formulario de nuevo producto
app.get('/servicios/add', (req, res) => {
  res.render('nuevoServicio'); // Renderiza la plantilla para agregar productos
});

// Leer un servicio por ID
app.get('/servicios/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM servicios WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener el servicio.' });
    } else if (result.length === 0) {
      res.status(404).json({ error: 'servicio no encontrado.' });
    } else {
      res.status(200).json(result[0]); // Devuelve el servicio por ID
    }
  });
});

//CREAR
app.post('/servicios', (req, res) => {
  const { name_servicio, descr_servicio, img_servicio } = req.body;

  const query = 'INSERT INTO servicios (name_servicio, descr_servicio, img_servicio) VALUES (?, ?, ?)';
  db.query(query, [name_servicio, descr_servicio, img_servicio], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al crear el servicio.' });
    } else {
     // res.status(201).json({ message: 'Servicio creado con éxito.', servicioId: result.insertId });
     res.redirect('/servicios');
    }
  });
});
//ACTUALIZAR
app.get('/servicios/editar/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM servicios WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener el servicio.');
    } else if (result.length === 0) {
      res.status(404).send('Servicio no encontrado.');
    } else {
      res.render('editarServicio', { servicio: result[0] }); // Renderiza el formulario de edición con los datos del producto
    }
  });
});

app.post('/servicios/editar/:id', (req, res) => {
  const { id } = req.params;
  const { name_servicio, descr_servicio, img_servicio } = req.body;

  const query = 'UPDATE servicios SET name_servicio = ?, descr_servicio = ?, img_servicio = ? WHERE id = ?';
  db.query(query, [name_servicio, descr_servicio, img_servicio, id], (err, result) => {
    if (err) {
      res.status(500).send('Error al actualizar el servicio.');
    } else {
      res.redirect('/servicios'); // Redirigir a la lista de productos después de editar
    }
  });
});

//ELIMINAR
app.post('/servicios/eliminar/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM servicios WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar el servicio.');
    } else {
      res.redirect('/servicios'); // Redirigir a la lista de productos después de eliminar
    }
  });
});


// Ruta para cerrar sesión
app.post("/logout", (req, res) => {
  req.session.destroy();
 // res.json({ message: "Cierre de sesión exitoso." });
  res.redirect('/login')
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
