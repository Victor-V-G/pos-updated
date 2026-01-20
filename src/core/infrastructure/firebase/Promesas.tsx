import {
  doc,
  collection,
  addDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import { db } from "./Conexion";

import {
  ProductoInterface,
  ProductoConIDInterface,
} from "../../domain/entities";

import { IDDocumentosInterface } from "@/shared/types";
import { RegistrosYMovimientosInterface } from "@/shared/types";
import { ProductoVenta } from "@/shared/types";
import { saveReportDesfaseOffline, getReportesDesfaseOffline } from '@/core/infrastructure/offline/offlineSync';

/*----------------------------------PRODUCTOS--------------------------------------*/

export const registrarProductoPromise = async (
  productoGet: ProductoInterface
) => {
  const docRef = await addDoc(collection(db, "Productos"), {
    NombreProducto: productoGet.NombreProducto,
    CodigoDeBarras: productoGet.CodigoDeBarras,
    Precio: productoGet.Precio,
    Stock: productoGet.Stock,
    TipoProducto: productoGet.TipoProducto ?? "unidad",
  });

  console.log("PRODUCTO REGISTRADO ID:", docRef.id);
};

export const obtenerProductoPorCodigoPromise = async (
  codigoDeBarras: string
): Promise<ProductoConIDInterface | null> => {
  try {
    const q = query(
      collection(db, "Productos"),
      where("CodigoDeBarras", "==", codigoDeBarras)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    };
  } catch (error) {
    console.error("Error al obtener producto por código:", error);
    return null;
  }
};

export const obtenerProductoPorNombrePromise = async (
  nombreProducto: string
): Promise<ProductoConIDInterface | null> => {
  try {
    const q = query(
      collection(db, "Productos"),
      where("NombreProducto", "==", nombreProducto)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    };
  } catch (error) {
    console.error("Error al obtener producto por nombre:", error);
    return null;
  }
};

export const obtenerProductosPromise = async () => {
  let listadoObtenidoGet: ProductoInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    listadoObtenidoGet.push({
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    });
  });

  return listadoObtenidoGet;
};

export const obtenerIDProductosPromise = async () => {
  let ids: IDDocumentosInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    ids.push({ IDDocumento: docSnap.id });
  });

  return ids;
};

export const obtenerProductosPromiseUpdate = async (): Promise<
  ProductoConIDInterface[]
> => {
  let listado: ProductoConIDInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    listado.push({
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    });
  });

  return listado;
};

export const modificarProductoPromise = async (
  id: string,
  producto: ProductoConIDInterface
) => {
  await updateDoc(doc(db, "Productos", id), {
    NombreProducto: producto.NombreProducto,
    CodigoDeBarras: producto.CodigoDeBarras,
    Precio: producto.Precio,
    Stock: producto.Stock,
    TipoProducto: producto.TipoProducto ?? "unidad",
  });
};

export const reponerStockPromise = async (
  id: string,
  cantidad: number
) => {
  const docRef = doc(db, "Productos", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const stockActual = Number(snapshot.data().Stock) || 0;
  const stockNuevo = stockActual + Number(cantidad);

  await updateDoc(docRef, { Stock: stockNuevo });

   try {
     const data = snapshot.data() as ProductoConIDInterface;
     const nombre = data.NombreProducto || "Producto";
     const codigo = data.CodigoDeBarras || "-";

     await registrarMovimientosPromise(
       "Reestock",
       `Stock repuesto: nombre: ${nombre}, código de barras: ${codigo}, cantidad agregada: ${cantidad}, stock anterior: ${stockActual}, stock final: ${stockNuevo}`
     );
   } catch (err) {
     console.error("Error registrando movimiento de reestock", err);
   }

  return stockNuevo;
};

export const eliminarProductoPromise = async (id: string) => {
  await deleteDoc(doc(db, "Productos", id));
};

/*----------------------------------SEARCH--------------------------------------*/

export const obtenerIDProductoSearchModificarPromise = async (
  campo: string,
  valor: string
) => {
  let ids: IDDocumentosInterface[] = [];
  const qSnap = query(collection(db, "Productos"), where(campo, "==", valor));
  const rs = await getDocs(qSnap);

  rs.forEach((docSnap) => ids.push({ IDDocumento: docSnap.id }));

  return ids;
};

export const searchObtenerProductoPorIdPromise = async (
  idGet: IDDocumentosInterface
) => {
  const docRef = doc(db, "Productos", idGet.IDDocumento);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();

  return [
    {
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    },
  ];
};

/*-------------------------------REGISTROS-------------------------------------*/

export const registrarMovimientosPromise = async (
  accion: string,
  cambios: string
) => {
  await addDoc(collection(db, "Movimientos"), {
    accion,
    cambios,
    fechaHora: serverTimestamp(),
  });
};

export const obtenerMovimientosPromise = async () => {
  let listado: RegistrosYMovimientosInterface[] = [];
  const rs = await getDocs(collection(db, "Movimientos"));

  rs.forEach((docSnap) =>
    listado.push({
      accion: docSnap.data().accion,
      cambios: docSnap.data().cambios,
      fechaHora: docSnap.data().fechaHora
        ? docSnap.data().fechaHora.toDate().toLocaleString()
        : "Sin fecha",
    })
  );

  return listado;
};

/*-------------------------------VENTAS-------------------------------------*/

interface RegistrarVentaPayload {
  ProductosVenta: ProductoVenta[];
  TotalGeneral: number;
  metodoPago: "EFECTIVO" | "DEBITO";
  pagoCliente: number | null;
  vueltoEntregado: number | null;
}

interface RegistrarTransaccionCajaPayload {
  tipo: "GIRO" | "DEPOSITO";
  monto: number;
  descripcion?: string;
}

export const registrarVentaYActualizarStockPromise = async ({
  ProductosVenta,
  TotalGeneral,
  metodoPago,
  pagoCliente,
  vueltoEntregado,
}: RegistrarVentaPayload) => {
  try {
    const ventaRef = await addDoc(collection(db, "Ventas"), {
      ProductosVenta,
      TotalGeneral,
      metodoPago,
      pagoCliente,
      vueltoEntregado,
      fechaHora: serverTimestamp(),
    });

    console.log("VENTA OK ID:", ventaRef.id);

    // Actualizar stock y generar alertas
    for (const item of ProductosVenta) {
      const qProd = query(
        collection(db, "Productos"),
        where("CodigoDeBarras", "==", item.CodigoDeBarras)
      );

      const rs = await getDocs(qProd);

      for (const docSnap of rs.docs) {
        const data = docSnap.data();
        const stockActual = Number(data.Stock);
        const stockNuevo = stockActual - Number(item.cantidad);

        await updateDoc(doc(db, "Productos", docSnap.id), {
          Stock: stockNuevo < 0 ? 0 : stockNuevo,
        });

        // Generar alertas automáticas basadas en el nuevo stock
        await verificarYGenerarAlertasPromise(
          docSnap.id,
          item.NombreProducto || data.NombreProducto,
          Math.max(0, stockNuevo),
          item.CodigoDeBarras
        );
      }
    }

    return true;
  } catch (err) {
    console.error("ERROR VENTA:", err);
    return false;
  }
};

export const registrarTransaccionCajaPromise = async ({
  tipo,
  monto,
  descripcion,
}: RegistrarTransaccionCajaPayload) => {
  try {
    await addDoc(collection(db, "TransaccionesCaja"), {
      tipo,
      monto,
      descripcion: descripcion ?? "",
      fechaHora: serverTimestamp(),
      fechaHoraCL: new Date().toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
    });

    return true;
  } catch (err) {
    console.error("ERROR TRANSACCION CAJA:", err);
    return false;
  }
};

export const obtenerTransaccionesCajaPromise = async () => {
  const q = query(collection(db, "TransaccionesCaja"), orderBy("fechaHora", "desc"));
  const rs = await getDocs(q);

  return rs.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const obtenerVentasPromise = async () => {
  const q = query(collection(db, "Ventas"), orderBy("fechaHora", "desc"));
  const rs = await getDocs(q);

  return rs.docs.map((docSnap) => {
    const data = docSnap.data();
    
    // Mapear los campos de Firebase a la estructura esperada
    const total = Number(data.total) || 
                  Number(data.TotalGeneral) ||
                  (Array.isArray(data.ProductosVenta) 
                    ? data.ProductosVenta.reduce((sum: number, p: any) => sum + ((p.PrecioUnitario || p.precioUnitario || p.precio || 0) * (p.cantidad || 0)), 0)
                    : 0);
    
    const productos = Array.isArray(data.ProductosVenta) 
      ? data.ProductosVenta.map((p: any) => ({
          nombre: p.NombreProducto || p.nombreProducto || p.nombre || 'Producto',
          cantidad: p.cantidad || 0,
          precio: p.PrecioUnitario || p.precioUnitario || p.precio || 0,
          TipoProducto: p.TipoProducto || p.tipoProducto || p.tipo || p.Tipo || undefined,
        }))
      : [];
    
    return {
      id: docSnap.id,
      ...data,
      total: total,
      productos: productos,
      metodo: data.metodoPago || data.metodo || 'N/A',
      fechaHora: data.fechaHora, // Devolver tal como viene de Firebase (Timestamp o string)
    };
  });
};

export const eliminarVentaPromise = async (id: string) => {
  // Antes de eliminar, guardar una copia en la colección de ventas eliminadas
  const ventaRef = doc(db, "Ventas", id);
  const ventaSnap = await getDoc(ventaRef);

  if (ventaSnap.exists()) {
    const data = ventaSnap.data();
    // Guardar datos originales junto con metadatos de eliminación
    await addDoc(collection(db, "VentasEliminadas"), {
      ...data,
      originalId: id,
      eliminada: true,
      fechaEliminacion: serverTimestamp(),
    });
  }

  await deleteDoc(ventaRef);
  return true;
};

export const obtenerVentasEliminadasPromise = async () => {
  // Ordenar por fecha de eliminación descendente; si no existe, por fecha original
  const q = query(collection(db, "VentasEliminadas"), orderBy("fechaEliminacion", "desc"));
  const rs = await getDocs(q);

  return rs.docs.map((docSnap) => {
    const raw = docSnap.data();
    // Formatear fechaHora como en obtenerVentasPromise
    const fechaHoraFormateada = raw.fechaHora?.toDate
      ? raw.fechaHora.toDate().toLocaleString("es-CL")
      : typeof raw.fechaHora === "string"
      ? raw.fechaHora
      : "Sin fecha";

    const fechaEliminacionFormateada = raw.fechaEliminacion?.toDate
      ? raw.fechaEliminacion.toDate().toLocaleString("es-CL")
      : typeof raw.fechaEliminacion === "string"
      ? raw.fechaEliminacion
      : null;

    return {
      id: docSnap.id,
      ...raw,
      fechaHora: fechaHoraFormateada,
      fechaEliminacion: fechaEliminacionFormateada,
    };
  });
};

/*----------------------------------REPORTES SEMANALES Y MENSUALES--------------------------------------*/

export const guardarReporteSemanalPromise = async (reporteSemanal: {
  fechaInicio: Date;
  fechaFin: Date;
  totalGanancia: number;
  totalVentas: number;
  totalProductos: number;
  semana: number;
  año: number;
  mes: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "ReportesSemanal"), {
      fechaInicio: reporteSemanal.fechaInicio instanceof Date ? Timestamp.fromDate(reporteSemanal.fechaInicio) : reporteSemanal.fechaInicio,
      fechaFin: reporteSemanal.fechaFin instanceof Date ? Timestamp.fromDate(reporteSemanal.fechaFin) : reporteSemanal.fechaFin,
      totalGanancia: reporteSemanal.totalGanancia,
      totalVentas: reporteSemanal.totalVentas,
      totalProductos: reporteSemanal.totalProductos,
      semana: reporteSemanal.semana,
      año: reporteSemanal.año,
      mes: reporteSemanal.mes,
      fechaRegistro: serverTimestamp(),
    });
    console.log("REPORTE SEMANAL GUARDADO ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar reporte semanal:", error);
    throw error;
  }
};

export const obtenerReportesSemanalesPromise = async () => {
  try {
    const q = query(
      collection(db, "ReportesSemanal"),
      orderBy("fechaFin", "desc")
    );
    const rs = await getDocs(q);
    return rs.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        fechaInicio: data.fechaInicio?.toDate?.() || new Date(data.fechaInicio),
        fechaFin: data.fechaFin?.toDate?.() || new Date(data.fechaFin),
        fechaRegistro: data.fechaRegistro?.toDate?.() || new Date(),
        totalGanancia: Number(data.totalGanancia) || 0,
        totalVentas: Number(data.totalVentas) || 0,
        totalProductos: Number(data.totalProductos) || 0,
        semana: Number(data.semana) || 0,
        año: Number(data.año) || new Date().getFullYear(),
        mes: String(data.mes || ''),
      };
    });
  } catch (error) {
    console.error("Error al obtener reportes semanales:", error);
    return [];
  }
};

export const guardarReporteMessualPromise = async (reporteMensual: {
  fechaInicio: Date;
  fechaFin: Date;
  totalGanancia: number;
  totalVentas: number;
  totalProductos: number;
  mes: string;
  año: number;
}) => {
  try {
    const docRef = await addDoc(collection(db, "ReportesMensual"), {
      fechaInicio: reporteMensual.fechaInicio instanceof Date ? Timestamp.fromDate(reporteMensual.fechaInicio) : reporteMensual.fechaInicio,
      fechaFin: reporteMensual.fechaFin instanceof Date ? Timestamp.fromDate(reporteMensual.fechaFin) : reporteMensual.fechaFin,
      totalGanancia: reporteMensual.totalGanancia,
      totalVentas: reporteMensual.totalVentas,
      totalProductos: reporteMensual.totalProductos,
      mes: reporteMensual.mes,
      año: reporteMensual.año,
      fechaRegistro: serverTimestamp(),
    });
    console.log("REPORTE MENSUAL GUARDADO ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar reporte mensual:", error);
    throw error;
  }
};

export const obtenerReportesMensualesPromise = async () => {
  try {
    const q = query(
      collection(db, "ReportesMensual"),
      orderBy("fechaFin", "desc")
    );
    const rs = await getDocs(q);
    return rs.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        fechaInicio: data.fechaInicio?.toDate?.() || new Date(data.fechaInicio),
        fechaFin: data.fechaFin?.toDate?.() || new Date(data.fechaFin),
        fechaRegistro: data.fechaRegistro?.toDate?.() || new Date(),
        totalGanancia: Number(data.totalGanancia) || 0,
        totalVentas: Number(data.totalVentas) || 0,
        totalProductos: Number(data.totalProductos) || 0,
        mes: String(data.mes || ''),
        año: Number(data.año) || new Date().getFullYear(),
      };
    });
  } catch (error) {
    console.error("Error al obtener reportes mensuales:", error);
    return [];
  }
};

export const eliminarReporteSemanalPromise = async (reporteId: string) => {
  try {
    await deleteDoc(doc(db, "ReportesSemanal", reporteId));
    console.log("REPORTE SEMANAL ELIMINADO ID:", reporteId);
    return true;
  } catch (error) {
    console.error("Error al eliminar reporte semanal:", error);
    throw error;
  }
};

/*----------------------------------REPORTES DESFASE--------------------------------------*/

export const guardarReporteDesfasePromise = async (reporteDesfase: {
  idProducto: string;
  nombreProducto: string;
  codigoBarras: string;
  stockSistema: number;
  stockReal: number;
  diferencia: number;
  anotacion: string;
  fecha: string;
  estado: 'pendiente' | 'revisado' | 'resuelto';
}) => {
  const isOnline = navigator.onLine;
  
  try {
    if (isOnline) {
      // Intentar guardar en Firebase
      const docRef = await addDoc(collection(db, "ReportesDesfase"), {
        idProducto: reporteDesfase.idProducto,
        nombreProducto: reporteDesfase.nombreProducto,
        codigoBarras: reporteDesfase.codigoBarras,
        stockSistema: reporteDesfase.stockSistema,
        stockReal: reporteDesfase.stockReal,
        diferencia: reporteDesfase.diferencia,
        anotacion: reporteDesfase.anotacion,
        fecha: reporteDesfase.fecha,
        estado: reporteDesfase.estado,
        fechaCreacion: serverTimestamp(),
      });
      console.log("✅ REPORTE DESFASE GUARDADO EN FIREBASE ID:", docRef.id);
      return docRef.id;
    } else {
      // Sin conexión, guardar localmente
      const reporteId = `offline_desfase_${Date.now()}_${Math.random()}`;
      await saveReportDesfaseOffline({ ...reporteDesfase, id: reporteId }, false);
      console.log("📱 REPORTE DESFASE GUARDADO LOCALMENTE ID:", reporteId);
      return reporteId;
    }
  } catch (error) {
    console.warn("⚠️ Error al guardar en Firebase, guardando localmente:", error);
    // Si Firebase falla, guardar localmente como fallback
    const reporteId = `offline_desfase_${Date.now()}_${Math.random()}`;
    await saveReportDesfaseOffline({ ...reporteDesfase, id: reporteId }, false);
    return reporteId;
  }
};

export const obtenerReportesDesfasePromise = async (): Promise<any[]> => {
  const isOnline = navigator.onLine;
  
  try {
    if (isOnline) {
      // Obtener de Firebase
      const q = query(
        collection(db, "ReportesDesfase"),
        orderBy("fechaCreacion", "desc")
      );
      const querySnapshot = await getDocs(q);
      const firebaseReportes = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate?.() || new Date(),
        };
      });
      return firebaseReportes;
    } else {
      // Obtener localmente
      return await getReportesDesfaseOffline();
    }
  } catch (error) {
    console.error("Error al obtener reportes de desfase:", error);
    // Fallback a offline
    return await getReportesDesfaseOffline();
  }
};

/*----------------------------------ALERTAS--------------------------------------*/

interface AlertaInterface {
  id: string;
  tipo: 'sin-stock' | 'stock-critico' | 'stock-bajo' | 'desfase';
  producto: string;
  idProducto: string;
  mensaje: string;
  fecha: Date;
  valorDesfase?: number;
  stockRestante?: number;
  leida: boolean;
}

export const crearAlertaPromise = async (alerta: Omit<AlertaInterface, 'id' | 'fecha'> & { idAlerta?: string }): Promise<string | null> => {
  try {
    // Generar ID consistente basado en tipo e idProducto para evitar duplicados
    const alertaId = alerta.idAlerta || `${alerta.idProducto}_${alerta.tipo}`;
    
    await setDoc(doc(db, "Alertas", alertaId), {
      ...alerta,
      fecha: serverTimestamp(),
      leida: false,
    }, { merge: true });
    
    console.log("✅ ALERTA CREADA/ACTUALIZADA ID:", alertaId);
    return alertaId;
  } catch (error) {
    console.error("Error al crear alerta:", error);
    return null;
  }
};

export const obtenerAlertasPromise = async (): Promise<AlertaInterface[]> => {
  try {
    const q = query(collection(db, "Alertas"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const fecha = data.fecha?.toDate?.() || new Date(data.fecha);
      return {
        id: docSnap.id,
        tipo: data.tipo,
        producto: data.producto,
        idProducto: data.idProducto,
        mensaje: data.mensaje,
        fecha: fecha as Date,
        valorDesfase: data.valorDesfase,
        stockRestante: data.stockRestante,
        leida: data.leida || false,
      } as AlertaInterface;
    });
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    return [];
  }
};

export const verificarYGenerarAlertasPromise = async (
  idProducto: string,
  nombreProducto: string,
  stockNuevo: number,
  codigoBarras?: string
): Promise<void> => {
  try {
    // Obtener la configuración de umbrales (valores por defecto)
    const UMBRAL_STOCK_CRITICO = 5;
    const UMBRAL_STOCK_BAJO = 15;

    let tipoAlerta: 'sin-stock' | 'stock-critico' | 'stock-bajo' | null = null;
    let mensaje = '';

    if (stockNuevo === 0) {
      tipoAlerta = 'sin-stock';
      mensaje = `Producto sin stock disponible`;
    } else if (stockNuevo <= UMBRAL_STOCK_CRITICO) {
      tipoAlerta = 'stock-critico';
      mensaje = `Stock crítico: ${stockNuevo} unidades restantes`;
    } else if (stockNuevo <= UMBRAL_STOCK_BAJO) {
      tipoAlerta = 'stock-bajo';
      mensaje = `Stock bajo: ${stockNuevo} unidades restantes`;
    }

    if (tipoAlerta) {
      const baseId = (codigoBarras || idProducto).replace(/\//g, "-");
      const alertaId = `${baseId}_${tipoAlerta}`;

      await setDoc(
        doc(db, "Alertas", alertaId),
        {
          tipo: tipoAlerta,
          producto: nombreProducto,
          idProducto: idProducto,
          mensaje: mensaje,
          stockRestante: stockNuevo,
          leida: false,
          fecha: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error al verificar y generar alertas:", error);
  }
};

  export const generarAlertasDesdeReportesPromise = async (): Promise<void> => {
    try {
      // Obtener todos los reportes de desfase pendientes
      const reportes = await obtenerReportesDesfasePromise();
      const reportesPendientes = reportes.filter((r: any) => r.estado === 'pendiente');

      // Por cada reporte pendiente, crear una alerta de desfase con ID consistente
      for (const reporte of reportesPendientes) {
        // Usar ID consistente para evitar duplicados
        const alertaId = `${reporte.idProducto}_desfase`;
        
        await crearAlertaPromise({
          idAlerta: alertaId,
          tipo: "desfase",
          producto: reporte.nombreProducto,
          idProducto: reporte.idProducto,
          mensaje: `Desfase reportado: ${reporte.diferencia > 0 ? '+' : ''}${reporte.diferencia} unidades. Sistema: ${reporte.stockSistema}, Real: ${reporte.stockReal}`,
          valorDesfase: reporte.diferencia,
          stockRestante: reporte.stockReal,
          leida: false,
        });
      }
    } catch (error) {
      console.error("Error al generar alertas desde reportes:", error);
    }
  };

export const marcarAlertaComoLeidaPromise = async (id: string): Promise<boolean> => {
  try {
    const alertaRef = doc(db, "Alertas", id);
    await updateDoc(alertaRef, {
      leida: true,
    });
    console.log("ALERTA MARCADA COMO LEIDA ID:", id);
    return true;
  } catch (error) {
    console.error("Error al marcar alerta como leída:", error);
    return false;
  }
};

export const eliminarAlertaPromise = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "Alertas", id));
    console.log("ALERTA ELIMINADA ID:", id);
    return true;
  } catch (error) {
    console.error("Error al eliminar alerta:", error);
    return false;
  }
};
