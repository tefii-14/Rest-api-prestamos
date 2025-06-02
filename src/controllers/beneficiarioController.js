import { pool } from '../db.js'; // Cambiado de '../routes/db.js'

// Obtener todos los beneficiarios
export const getBeneficiarios = async (req, res) => {
  try {
    const querySQL = "SELECT * FROM beneficiarios";
    const [results] = await pool.query(querySQL);
    res.send(results);
  } catch {
    console.error("No se pudo concretar GET");
    res.status(500).json({ message: "Error al obtener beneficiarios" });
  }
};

// Obtener un beneficiario por ID
export const getBeneficiarioById = async (req, res) => {
  try {
    const querySQL = "SELECT * FROM beneficiarios WHERE idbeneficiario = ?";
    const [results] = await pool.query(querySQL, [req.params.id]);

    if (results.length == 0) {
      return res.status(404).json({ message: 'No existe el ID' });
    }
    res.send(results[0]);
  } catch {
    console.error("No se pudo concretar GET");
    res.status(500).json({ message: "Error al obtener beneficiario" });
  }
};

// Crear un beneficiario
export const createBeneficiario = async (req, res) => {
  try {
    const querySQL = `INSERT INTO beneficiarios (apellidos, nombres, dni, telefono, direccion) VALUES (?, ?, ?, ?, ?)`;
    const { apellidos, nombres, dni, telefono, direccion } = req.body;

    const [results] = await pool.query(querySQL, [apellidos, nombres, dni, telefono, direccion]);

    if (results.affectedRows == 0) {
      res.send({ status: false, message: "No se pudo completar el proceso", id: null });
    } else {
      res.send({ status: true, message: "Beneficiario registrado correctamente", id: results.insertId });
    }
  } catch {
    console.error("No se pudo concretar POST");
    res.status(500).json({ message: "Error al crear beneficiario" });
  }
};

// Actualizar un beneficiario
export const updateBeneficiario = async (req, res) => {
  try {
    const id = req.params.id;
    const { apellidos, nombres, dni, telefono, direccion } = req.body;

    const querySQL = `
      UPDATE beneficiarios SET
        apellidos = ?,
        nombres = ?,
        dni = ?,
        telefono = ?,
        direccion = ?
      WHERE idbeneficiario = ?
    `;
    const [results] = await pool.query(querySQL, [apellidos, nombres, dni, telefono, direccion, id]);

    if (results.affectedRows == 0) {
      return res.status(404).json({ message: 'El ID no existe' });
    }

    res.send({ message: "Beneficiario actualizado correctamente" });
  } catch {
    console.error("No se pudo concretar PUT");
    res.status(500).json({ message: "Error al actualizar beneficiario" });
  }
};

// Eliminar un beneficiario
export const deleteBeneficiario = async (req, res) => {
  try {
    const querySQL = 'DELETE FROM beneficiarios WHERE idbeneficiario = ?';
    const id = req.params.id;

    const [results] = await pool.query(querySQL, [id]);

    if (results.affectedRows == 0) {
      return res.status(404).json({ message: 'El ID enviado NO existe' });
    }

    res.send({ message: 'Beneficiario eliminado correctamente' });
  } catch {
    console.error("No se pudo concretar DELETE");
    res.status(500).json({ message: "Error al eliminar beneficiario" });
  }
};