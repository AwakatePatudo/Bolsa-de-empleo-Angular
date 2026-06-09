const express = require('express');
const cors = require('cors');
const router = express.Router();
const mysql = require('mysql2'); 
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cors({
origin: 'http://localhost:4200',
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// CONFIGURACION DE LA BASE DE DATOS (POOL)
// ==========================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'bolsaangular', 
    multipleStatements: true 
});

console.log('Pool de conexiones a MySQL listo y activo');


// ==========================================
// RUTA DE AUTENTICACION (LOGIN MULTIUSUARIO)
// ==========================================
app.post('/api/v1/auth/login', (req, res) => {
    // Forzado explicito de politicas CORS para la persistencia de la sesion
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contrasena son obligatorios' });
    }

    const query = 'SELECT Id, Nombre, Correo, Rol FROM usuarios WHERE Correo = ? AND Contrasena = ?';
    
    db.query(query, [correo, contrasena], (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario en la base de datos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Correo o contrasena incorrectos' });
        }

        const usuarioLogueado = results[0];
        
        return res.status(200).json({
            mensaje: 'Autenticacion exitosa',
            usuario: {
                id: usuarioLogueado.Id,
                nombre: usuarioLogueado.Nombre,
                correo: usuarioLogueado.Correo,
                rol: usuarioLogueado.Rol.toLowerCase().trim() 
            }
        });
    });
});

// ==========================================
// RUTA DE REGISTRO PARA ESTUDIANTES
// ==========================================
app.post('/api/v1/auth/register-student', (req, res) => {
    const { nombres, correo, contrasena } = req.body;
    if (!nombres || !correo || !contrasena) {
        return res.status(400).json({ error: 'Nombre, correo y contrasena son obligatorios' });
    }
    const query = 'INSERT INTO usuarios (Nombre, Correo, Contrasena, Rol) VALUES (?, ?, ?, ?)';
    const rolDefault = 'estudiante';

    db.query(query, [nombres, correo, contrasena, rolDefault], (err, resultado) => {
        if (err) {
            console.error('Error al insertar el estudiante en MySQL:', err);
            return res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
        }

        res.status(201).json({ 
            mensaje: 'Estudiante registrado con exito en la base de datos', 
            id: resultado.insertId 
        });
    });
});

// ==========================================
// RUTA DE REGISTRO PARA EMPRESAS
// ==========================================
app.post('/api/v1/auth/register-company', (req, res) => {
    const { razonSocial, correo, contrasena } = req.body;

    if (!razonSocial || !correo || !contrasena) {
        return res.status(400).json({ error: 'Razon social, correo y contrasena son obligatorios' });
    }

    const query = 'INSERT INTO usuarios (Nombre, Correo, Contrasena, Rol) VALUES (?, ?, ?, ?)';
    const rolEmpresa = 'empresa';

    db.query(query, [razonSocial, correo, contrasena, rolEmpresa], (err, resultado) => {
        if (err) {
            console.error('Error al insertar la empresa en MySQL:', err);
            return res.status(500).json({ error: 'Error al guardar la empresa en la base de datos' });
        }

        res.status(201).json({ 
            mensaje: 'Empresa registrada con exito en el catalogo de usuarios', 
            id: resultado.insertId 
        });
    });
});


// ==========================================
// OPERACIONES CRUD DE VACANTES
// ==========================================

app.get('/api/v1/jobs', (req, res) => {
    const query = 'SELECT * FROM vacantes'; 

    db.query(query, (err, resultados) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar las vacantes' });
        }
        res.json(resultados); 
    });
});

app.put('/api/v1/jobs/:id', (req, res) => {
    const idEditar = req.params.id;
    const { Titulo, Descripcion, Empresa, Sueldo } = req.body;

    const query = 'UPDATE vacantes SET Titulo = ?, Descripcion = ?, Empresa = ?, Sueldo = ? WHERE Id = ?';
    
    db.query(query, [Titulo, Descripcion, Empresa, Sueldo, idEditar], (err, resultado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar la vacante' });
        }
        res.json({ mensaje: 'Vacante actualizada con exito' });
    });
});

app.patch('/api/v1/jobs/:id/status', (req, res) => {
    const idEstado = req.params.id;
    const { Activo } = req.body; 

    const query = 'UPDATE vacantes SET Activo = ? WHERE Id = ?';
    
    db.query(query, [Activo, idEstado], (err, resultado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al cambiar el estado de la vacante' });
        }
        res.json({ mensaje: 'Estado de la vacante actualizado correctamente' });
    });
});

app.post('/api/v1/jobs', (req, res) => {
    const { Titulo, Descripcion, Empresa, Sueldo } = req.body;

    const query = 'INSERT INTO vacantes (Titulo, Descripcion, Empresa, Sueldo, Activo) VALUES (?, ?, ?, ?, 1)';
    
    db.query(query, [Titulo, Descripcion, Empresa, Sueldo], (err, resultado) => {
        if (err) {
            console.error('Error interno de MySQL:', err);
            return res.status(500).json({ error: 'Error al insertar la vacante en la base de datos' });
        }
        res.status(201).json({ 
            mensaje: 'Vacante guardada con exito en MySQL', 
            id: resultado.insertId 
        });
    });
});

app.delete('/api/v1/jobs/:id', (req, res) => {
    const idBorrar = req.params.id;
    const query = 'DELETE FROM vacantes WHERE Id = ?';

    db.query(query, [idBorrar], (err, resultado) => {
        if (err) {
            return res.status(500).json({ error: 'Error al intentar eliminar la vacante' });
        }
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontro la vacante para eliminar' });
        }

        res.json({ mensaje: 'Vacante eliminada de forma exitosa de la base de datos' });
    });
});

// =========================================================================
// RUTA CORREGIDA: Obtener métricas por Empresa (Métricas Reales con MySQL)
// =========================================================================
app.get('/api/v1/jobs/valores-dashboard/:nombreEmpresa', (req, res) => {
    const { nombreEmpresa } = req.params;
    const sqlPublicadas = 'SELECT COUNT(*) AS total FROM vacantes WHERE Empresa = ?';
    const sqlActivas    = 'SELECT COUNT(*) AS total FROM vacantes WHERE Empresa = ? AND Activo = 1';
    const sqlInactivas  = 'SELECT COUNT(*) AS total FROM vacantes WHERE Empresa = ? AND Activo = 0';

    db.query(sqlPublicadas, [nombreEmpresa], (err, resPublicadas) => {
        if (err) {
            console.error('Error al contar vacantes publicadas:', err);
            return res.status(500).json({ error: 'Error en base de datos al calcular métricas' });
        }

        db.query(sqlActivas, [nombreEmpresa], (err, resActivas) => {
            if (err) {
                console.error('Error al contar vacantes activas:', err);
                return res.status(500).json({ error: 'Error en base de datos al calcular métricas' });
            }

            db.query(sqlInactivas, [nombreEmpresa], (err, resInactivas) => {
                if (err) {
                    console.error('Error al contar vacantes inactivas:', err);
                    return res.status(500).json({ error: 'Error en base de datos al calcular métricas' });
                }

                const totalPublicadas = resPublicadas[0].total || 0;
                const totalActivas    = resActivas[0].total || 0;
                const totalInactivas  = resInactivas[0].total || 0;

                res.status(200).json({
                    publicadas: totalPublicadas,
                    postulaciones: totalActivas,   
                    enRevision: totalInactivas     
                });
            });
        });
    });
});

// ==========================================
// ENDPOINT DE ESTADISTICAS REALES
// ==========================================
app.get('/api/v1/home/stats', (req, res) => {
    // Forzado explicito de cabeceras CORS para navegadores en modo F5
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const queryEstudiantes = "SELECT COUNT(*) AS total FROM usuarios WHERE Rol = 'estudiante'";
    const queryEmpresas = "SELECT COUNT(*) AS total FROM usuarios WHERE Rol = 'empresa'";
    const queryVacantes = "SELECT COUNT(*) AS total FROM vacantes WHERE Activo = 1";

    db.query(queryEstudiantes, (err, resEstudiantes) => {
        if (err) {
            console.error('Error SQL en Estudiantes:', err);
            return res.status(500).json({ error: 'Error al contar estudiantes' });
        }

        db.query(queryEmpresas, (err, resEmpresas) => {
            if (err) {
                console.error('Error SQL en Empresas:', err);
                return res.status(500).json({ error: 'Error al contar empresas' });
            }

            db.query(queryVacantes, (err, resVacantes) => {
                if (err) {
                    console.error('Error SQL en Vacantes:', err);
                    return res.status(500).json({ error: 'Error al contar vacantes' });
                }

                res.json({
                    totalEstudiantes: resEstudiantes[0].total,
                    totalEmpresas: resEmpresas[0].total,
                    totalVacantes: resVacantes[0].total
                });
            });
        });
    });
});

// ==========================================
// OBTENER LAS ULTIMAS 3 VACANTES ACTIVAS
// ==========================================
app.get('/api/v1/home/latest-jobs', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const query = 'SELECT Id, Titulo, Empresa, Sueldo FROM vacantes WHERE Activo = 1 ORDER BY Id DESC LIMIT 3';

    db.query(query, (err, resultados) => {
        if (err) {
            console.error('Error SQL en Vacantes Recientes:', err);
            return res.status(500).json({ error: 'Error al consultar vacantes recientes' });
        }
        res.json(resultados);
    });
});
// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor de la Bolsa de Empleo corriendo en: http://localhost:${PORT}`);
});
// =========================================================================
//            ENDPOINTS PANEL DE ADMINISTRADOR 
// =========================================================================

// 1. Estadísticas Generales (¡Totalmente operacionales!)
app.get('/api/v1/admin/stats', (req, res) => {
  const qEstudiantes = "SELECT COUNT(*) AS total FROM usuarios WHERE Rol = 'estudiante'";
  const qEmpresas = "SELECT COUNT(*) AS total FROM usuarios WHERE Rol = 'empresa'";
  const qVacantes = "SELECT COUNT(*) AS total FROM vacantes";

  db.query(`${qEstudiantes}; ${qEmpresas}; ${qVacantes}`, (err, results) => {
    if (err) {
      console.error("Error en estadísticas:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      estudiantes: results[0][0].total,
      empresas: results[1][0].total,
      vacantes: results[2][0].total
    });
  });
});

// 2. Control de Empresas (Mapeando tu nueva columna 'estado')
app.get('/api/v1/admin/empresas', (req, res) => {
  // Usamos IFNULL por si algún registro viejo tiene el campo 'estado' vacío
  const query = "SELECT Id, Nombre AS razonSocial, Correo, 'NIT-Faltante' AS nit, IFNULL(estado, 'Pendiente') AS estado FROM usuarios WHERE Rol = 'empresa'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener empresas:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Modificar Estado de una Empresa en la BD
app.put('/api/v1/admin/empresas/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 
  db.query("UPDATE usuarios SET estado = ? WHERE Id = ? AND Rol = 'empresa'", [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Estado de la empresa actualizado con éxito' });
  });
});
app.get('/api/v1/admin/vacantes', (req, res) => {

const query = `
    SELECT 
      Id AS id, 
      Titulo AS titulo, 
      Empresa AS empresa, 
      Sueldo AS salario, 
      IF(Activo = 1, 'Activa', 'Inactiva') AS estado 
    FROM vacantes
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener vacantes:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Eliminar Vacante por Id
app.delete('/api/v1/admin/vacantes/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM vacantes WHERE Id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Vacante eliminada del sistema' });
  });
});

// 4. Control de Estudiantes
app.get('/api/v1/admin/estudiantes', (req, res) => {
  const query = "SELECT Id, Nombre, Correo, 'Programa Unipaz' AS programa, IFNULL(estado, 'Activo') AS estado FROM usuarios WHERE Rol = 'estudiante'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener estudiantes:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Cambiar Estado del Estudiante
app.put('/api/v1/admin/estudiantes/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 
  db.query("UPDATE usuarios SET estado = ? WHERE Id = ? AND Rol = 'estudiante'", [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Estado del estudiante actualizado' });
  });
});