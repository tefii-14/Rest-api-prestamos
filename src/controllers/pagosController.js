import { pool } from '../db.js';

// Generar cronograma de pagos por beneficiario (formato completo)
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
      const queryContratos = "SELECT idcontrato, fechainicio, diapago, monto, interes, numcuotas FROM contratos WHERE idbeneficiario = ?";
      const [contratos] = await pool.query(queryContratos, [idBeneficiario]);

      if (contratos.length === 0) {
        cronogramasPorBeneficiario[idBeneficiario] = [];
        continue;
      }

      const cronogramaBeneficiario = [];

      // Obtener pagos asociados a los contratos del beneficiario
      for (const contrato of contratos) {
        const idContrato = contrato.idcontrato;
        let fechaInicio = new Date(contrato.fechainicio);
        if (isNaN(fechaInicio.getTime())) {
          fechaInicio = new Date(contrato.fechainicio.replace('T', ' ').split('.')[0]) || new Date('2025-03-10');
        }
        const diaPago = contrato.diapago;
        const montoInicial = parseFloat(contrato.monto);
        const tasaAnual = parseFloat(contrato.interes) / 100; // Convertir a decimal (ej. 5% -> 0.05)
        const tasaMensual = tasaAnual / 12; // Tasa mensual
        const numCuotas = contrato.numcuotas;

        // Calcular cuota fija (método francés)
        const cuotaFija = montoInicial * (tasaMensual * Math.pow(1 + tasaMensual, numCuotas)) / (Math.pow(1 + tasaMensual, numCuotas) - 1);
        const cuotaFijaFormatted = isNaN(cuotaFija) ? 0 : parseFloat(cuotaFija.toFixed(2));

        // Obtener pagos existentes
        const queryPagos = `
          SELECT idcontrato, numcuota, monto, penalidad, medio 
          FROM pagos 
          WHERE idcontrato = ?
          ORDER BY numcuota
        `;
        const [pagos] = await pool.query(queryPagos, [idContrato]);

        if (pagos.length > 0) {
          // Si hay pagos, usarlos
          pagos.forEach(pago => {
            let fechaProgramada = new Date(fechaInicio);
            fechaProgramada.setMonth(fechaProgramada.getMonth() + (pago.numcuota - 1));
            fechaProgramada.setDate(diaPago);

            const montoNum = Number(pago.monto) || cuotaFijaFormatted;
            const penalidadNum = Number(pago.penalidad) || 0;

            cronogramaBeneficiario.push({
              idcontrato: pago.idcontrato,
              numcuota: pago.numcuota,
              fechapago: fechaProgramada.toISOString().split('T')[0],
              monto: montoNum.toFixed(2),
              penalidad: penalidadNum.toFixed(2),
              medio: pago.medio || null
            });
          });
        } else {
          // Si no hay pagos, generar cronograma predeterminado
          for (let i = 1; i <= numCuotas; i++) {
            let fechaProgramada = new Date(fechaInicio);
            fechaProgramada.setMonth(fechaProgramada.getMonth() + (i - 1));
            fechaProgramada.setDate(diaPago);

            cronogramaBeneficiario.push({
              idcontrato: idContrato,
              numcuota: i,
              fechapago: fechaProgramada.toISOString().split('T')[0],
              monto: cuotaFijaFormatted.toFixed(2),
              penalidad: "0.00",
              medio: null
            });
          }
        }
      }

      cronogramasPorBeneficiario[idBeneficiario] = cronogramaBeneficiario;
    }

    res.json(cronogramasPorBeneficiario);
  } catch (error) {
    console.error("No se pudo generar el cronograma:", error);
    res.status(500).json({ message: "Error al generar el cronograma de pagos" });
  }
};