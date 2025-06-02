import { pool } from '../db.js';

// Obtener todos los contratos
export const getContratos = async (req, res) => {
  try {
    const querySQL = "SELECT * FROM contratos";
    const [results] = await pool.query(querySQL);
    res.send(results);
  } catch {
    console.error("No se pudo concretar GET");
    res.status(500).json({ message: "Error al obtener contratos" });
  }
};

// Obtener un contrato por ID
export const getContratoById = async (req, res) => {
  try {
    const querySQL = "SELECT * FROM contratos WHERE idcontrato = ?";
    const [results] = await pool.query(querySQL, [req.params.id]);

    if (results.length == 0) {
      return res.status(404).json({ message: 'No existe el ID' });
    }
    res.send(results[0]);
  } catch {
    console.error("No se pudo concretar GET");
    res.status(500).json({ message: "Error al obtener contrato" });
  }
};

// Crear un contrato
export const createContrato = async (req, res) => {
  try {
    const querySQL = `INSERT INTO contratos (idbeneficiario, monto, interes, fechainicio, diapago, numcuotas) VALUES (?, ?, ?, ?, ?, ?)`;
    const { idbeneficiario, monto, interes, fechainicio, diapago, numcuotas } = req.body;

    const [results] = await pool.query(querySQL, [idbeneficiario, monto, interes, fechainicio, diapago, numcuotas]);

    if (results.affectedRows == 0) {
      res.send({ status: false, message: "No se pudo completar el proceso", id: null });
    } else {
      res.send({ status: true, message: "Contrato registrado correctamente", id: results.insertId });
    }
  } catch {
    console.error("No se pudo concretar POST");
    res.status(500).json({ message: "Error al crear contrato" });
  }
};

// Actualizar un contrato
export const updateContrato = async (req, res) => {
  try {
    const id = req.params.id;
    const { idbeneficiario, monto, interes, fechainicio, diapago, numcuotas, estado } = req.body;

    const querySQL = `
      UPDATE contratos SET
        idbeneficiario = ?,
        monto = ?,
        interes = ?,
        fechainicio = ?,
        diapago = ?,
        numcuotas = ?,
        estado = ?
      WHERE idcontrato = ?
    `;
    const [results] = await pool.query(querySQL, [idbeneficiario, monto, interes, fechainicio, diapago, numcuotas, estado, id]);

    if (results.affectedRows == 0) {
      return res.status(404).json({ message: 'El ID no existe' });
    }

    res.send({ message: "Contrato actualizado correctamente" });
  } catch {
    console.error("No se pudo concretar PUT");
    res.status(500).json({ message: "Error al actualizar contrato" });
  }
};

// Eliminar un contrato
export const deleteContrato = async (req, res) => {
  try {
    const querySQL = 'DELETE FROM contratos WHERE idcontrato = ?';
    const id = req.params.id;

    const [results] = await pool.query(querySQL, [id]);

    if (results.affectedRows == 0) {
      return res.status(404).json({ message: 'El ID enviado NO existe' });
    }

    res.send({ message: 'Contrato eliminado correctamente' });
  } catch {
    console.error("No se pudo concretar DELETE");
    res.status(500).json({ message: "Error al eliminar contrato" });
  }
};