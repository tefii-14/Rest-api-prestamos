import { pool } from '../db.js';

// Generar cronograma de pagos por beneficiario
export const getCronogramaPagos = async (req, res) => {
  try {
    // Obtener todos los beneficiarios
    const queryBeneficiarios = "SELECT idbeneficiario FROM beneficiarios";
    const [beneficiarios] = await pool.query(queryBeneficiarios);

    if (beneficiarios.length === 0) {
      return res.status(404).json({ message: 'No hay beneficiarios registrados' });
    }

    const cronogramasPorBeneficiario = {};

    for (const beneficiario of beneficiarios) {
      const idBeneficiario = beneficiario.idbeneficiario;

      // Obtener contratos asociados al beneficiario
      const queryContratos = "SELECT idcontrato, fechainicio, diapago FROM contratos WHERE idbeneficiario = ?";
      const [contratos] = await pool.query(queryContratos, [idBeneficiario]);

      if (contratos.length === 0) {
        cronogramasPorBeneficiario[idBeneficiario] = [];
        continue;
      }

      const cronogramaBeneficiario = [];

      // Obtener pagos asociados a los contratos del beneficiario
      for (const contrato of contratos) {
        const idContrato = contrato.idcontrato;
        // Ajustar fechainicio para manejar formatos con zona horaria
        const fechaInicio = new Date(contrato.fechainicio.replace('T', ' ').split('.')[0]);
        const diaPago = contrato.diapago;

        const queryPagos = `
          SELECT idcontrato, numcuota, monto, penalidad, medio 
          FROM pagos 
          WHERE idcontrato = ?
          ORDER BY numcuota
        `;
        const [pagos] = await pool.query(queryPagos, [idContrato]);

        pagos.forEach(pago => {
          // Calcular siempre la fecha programada según diapago
          let fechaProgramada = new Date(fechaInicio);
          fechaProgramada.setMonth(fechaProgramada.getMonth() + (pago.numcuota - 1)); // Incrementar meses
          fechaProgramada.setDate(diaPago); // Ajustar al día de pago

          cronogramaBeneficiario.push({
            idcontrato: pago.idcontrato,
            numcuota: pago.numcuota,
            fechapago: fechaProgramada.toISOString().split('T')[0], // Siempre la fecha programada
            monto: pago.monto.toFixed(2),
            penalidad: pago.penalidad.toFixed(2),
            medio: pago.medio
          });
        });
      }

      cronogramasPorBeneficiario[idBeneficiario] = cronogramaBeneficiario;
    }

    res.json(cronogramasPorBeneficiario);
  } catch (error) {
    console.error("No se pudo generar el cronograma:", error);
    res.status(500).json({ message: "Error al generar el cronograma de pagos" });
  }
};