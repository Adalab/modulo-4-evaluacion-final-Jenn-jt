// Servidor Express

// Para probar los ficheros estáticos del fronend, entrar en <http://localhost:4500/>
// Para probar el API, entrar en <http://localhost:4500/api/items>

// Imports

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Arracar el servidor

const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({ limit: '25mb' }));
server.set('view engine', 'ejs');

// Conexion a la base de datos

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS, // <-- Pon aquí tu contraseña o en el fichero /.env en la carpeta raíz
    database: process.env.DB_NAME || 'Clase',
  });

  connection.connect();

  return connection;
}

// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});

// Endpoints

// GET/recetas, mostrar toda la tabla

server.get('/recetas', async (req, res) => {
  const select = 'SELECT * FROM recetas';
  const conn = await getConnection();
  const [results] = await conn.query(select);
  conn.end();
  res.json({
    info: { count: results.length },
    results: results,
  });
});

// GET/recetas/:id busca la receta por id

server.get('/recetas/:id', async (req, res) => {
  const idRecipe = req.params.id;
  const select = 'Select * from recetas where id = ?';
  const conn = await getConnection();
  const [results] = await conn.query(select, idRecipe);
  res.json(results[0]);
});

//añadir nueva receta

server.post('/recetas', async (req, res) => {
  console.log('HOLIS');
  const newRecipe = req.body;
  try {
    const insert =
      'INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?,?,?)';
    const conn = await getConnection();
    const [results] = await conn.query(insert, [
      newRecipe.nombre,
      newRecipe.ingredientes,
      newRecipe.instrucciones,
    ]);
    conn.end();
    console.log(results);
    res.json({
      success: true,
      id: results.insertId,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'error no se ha podido añadir la receta',
    });
  }
});

//actualizar receta

server.put('/recetas/:id', async (req, res) => {
  const idRecipe = req.params.id;
  const { nombre, ingredientes, instrucciones } = req.body;
  try {
    const update =
      'UPDATE recetas SET nombre = ?, ingredientes = ?, instrucciones = ? WHERE id = ?';
    const conn = await getConnection();
    const [results] = await conn.query(update, [
      nombre,
      ingredientes,
      instrucciones,
      idRecipe,
    ]);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Error al actualizar la receta',
    });
  }
});

//Eliminar receta

server.delete('/recetas/:id', async (req, res) => {
  const idRecipe = req.params.id;
  try {
    const sql = 'DELETE FROM recetas WHERE id = ?';
    const conn = await getConnection();
    const [results] = await conn.query(sql, idRecipe);
    conn.end();
    res.json({
      success: true,
      id: idRecipe,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Error receta no encontrada',
    });
  }
});
