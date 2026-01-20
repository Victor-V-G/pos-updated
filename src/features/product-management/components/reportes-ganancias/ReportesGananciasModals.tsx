import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Clock, Package, Calendar, Wifi, WifiOff } from 'lucide-react';
import { obtenerVentasPromise, obtenerReportesSemanalesPromise, obtenerReportesMensualesPromise, guardarReporteSemanalPromise, guardarReporteMessualPromise, eliminarReporteSemanalPromise, obtenerTransaccionesCajaPromise } from '@/core/infrastructure/firebase/Promesas';
import { useOfflineSync, useOnlineStatus } from '@/core/infrastructure/offline';

interface ReportesProps {
  onClose: () => void;
  onAbrirHistorial?: (ventaId: string) => void;
}

interface Venta {
  id: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number; TipoProducto?: string }>;
  total: number;
  metodo: string;
  fechaHora: string | Date;
}

interface TransaccionCaja {
  id?: string;
  tipo?: "GIRO" | "DEPOSITO";
  monto?: number;
  descripcion?: string;
  fechaHora?: any;
  fechaHoraCL?: string;
}

interface ReporteSemanal {
  id: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalGanancia: number;
  totalVentas: number;
  totalProductos: number;
  semana: number;
  año: number;
  mes: string;
}

interface ReporteMensual {
  id: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalGanancia: number;
  totalVentas: number;
  totalProductos: number;
  mes: string;
  año: number;
}

export function Reportes({ onClose, onAbrirHistorial }: ReportesProps) {
  const [ventasFirebase, setVentasFirebase] = useState<Venta[]>([]);
  const [transaccionesCaja, setTransaccionesCaja] = useState<TransaccionCaja[]>([]);
  const [reportesSemanales, setReportesSemanales] = useState<ReporteSemanal[]>([]);
  const [reportesMensuales, setReportesMensuales] = useState<ReporteMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<'actual' | 'historial'>('actual');
  const [semanaFiltrada, setSemanaFiltrada] = useState<string>('');
  const [mesFiltrado, setMesFiltrado] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Offline functionality
  const { getSales } = useOfflineSync();
  const isOnline = useOnlineStatus();

  // Función reutilizable para cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      const [respuestaVentas, respuestaSemanales, respuestaMensuales, respuestaTransacciones] = await Promise.all([
        getSales(obtenerVentasPromise),
        obtenerReportesSemanalesPromise(),
        obtenerReportesMensualesPromise(),
        obtenerTransaccionesCajaPromise(),
      ]);
      
      console.log('📊 Respuesta de ventas crudas:', respuestaVentas);
      
      if (respuestaVentas && Array.isArray(respuestaVentas)) {
        console.log('✅ Ventas cargadas:', respuestaVentas.length, respuestaVentas);
        // Normalizar ventas: TotalGeneral -> total
        const ventasNormalizadas = respuestaVentas.map((v: any) => ({
          ...v,
          total: Number(v.total || v.TotalGeneral || 0),
          metodo: v.metodo || v.metodoPago || '',
          productos: v.productos || v.ProductosVenta || []
        }));
        setVentasFirebase(ventasNormalizadas as unknown as Venta[]);
      } else {
        console.log('⚠️ No hay ventas o formato incorrecto:', respuestaVentas);
        setVentasFirebase([]);
      }

      if (respuestaTransacciones && Array.isArray(respuestaTransacciones)) {
        console.log('✅ Transacciones cargadas:', respuestaTransacciones.length, respuestaTransacciones);
        setTransaccionesCaja(respuestaTransacciones as unknown as TransaccionCaja[]);
      } else {
        console.log('⚠️ No hay transacciones o formato incorrecto:', respuestaTransacciones);
        setTransaccionesCaja([]);
      }
      
      if (respuestaSemanales && Array.isArray(respuestaSemanales)) {
        console.log('🔍 Reportes semanales recibidos de Firebase:', respuestaSemanales);
        
        // Filtrar reportes válidos (eliminar los que tienen datos corruptos)
        const reportesValidos = respuestaSemanales.filter((r: any) => {
          const gananciaValida = !isNaN(r.totalGanancia) && r.totalGanancia >= 0;
          const ventasValidas = !isNaN(r.totalVentas) && r.totalVentas >= 0;
          const productosValidos = !isNaN(r.totalProductos) && r.totalProductos >= 0;
          
          console.log(`🔎 Validando Reporte Semana #${r.semana} ${r.año}:`, {
            ganancia: r.totalGanancia,
            gananciaValida,
            ventas: r.totalVentas,
            ventasValidas,
            productos: r.totalProductos,
            productosValidos,
            isValid: gananciaValida && ventasValidas && productosValidos
          });
          
          if (!gananciaValida || !ventasValidas || !productosValidos) {
            console.warn(`⚠️ Reporte semanal corrupto detectado (Semana #${r.semana} ${r.año}) - ELIMINANDO:`, r);
            // Eliminar reporte corrupto de Firebase
            eliminarReporteSemanalPromise(r.id).catch(err => console.error('Error eliminando reporte:', err));
            return false;
          }
          return true;
        });
        
        console.log('✅ Reportes semanales válidos (antes de deduplicar):', reportesValidos);
        
        // Deduplicar: mantener solo el reporte con mayor totalGanancia para cada semana-año
        const reportesMap = new Map<string, any>();
        reportesValidos.forEach((r: any) => {
          const key = `${r.semana}-${r.año}`;
          const existing = reportesMap.get(key);
          
          if (!existing || r.totalGanancia > existing.totalGanancia) {
            // Si este reporte tiene mayor ganancia, reemplazar y eliminar el anterior de Firebase
            if (existing && existing.id !== r.id) {
              console.log(`🗑️ Eliminando reporte duplicado inferior: Semana #${existing.semana} ${existing.año} con $${existing.totalGanancia}`);
              eliminarReporteSemanalPromise(existing.id).catch(err => console.error('Error eliminando duplicado:', err));
            }
            reportesMap.set(key, r);
          } else {
            // Si el existente es mejor, eliminar este de Firebase
            console.log(`🗑️ Eliminando reporte duplicado inferior: Semana #${r.semana} ${r.año} con $${r.totalGanancia}`);
            eliminarReporteSemanalPromise(r.id).catch(err => console.error('Error eliminando duplicado:', err));
          }
        });
        
        const reportesUnicos = Array.from(reportesMap.values());
        console.log('✅ Reportes semanales únicos:', reportesUnicos);
        setReportesSemanales(reportesUnicos as unknown as ReporteSemanal[]);
      }
      if (respuestaMensuales && Array.isArray(respuestaMensuales)) {
        // Filtrar y eliminar reportes de prueba (enero 2026 con valores exactos de prueba)
        const reportesFiltrados = (respuestaMensuales as any[]).filter((r: any) => {
          // Detectar reporte de prueba: enero 2026 con valores específicos
          const esPrueba = r.mes === 'enero' && 
                          r.año === 2026 && 
                          r.totalGanancia === 15750.50 && 
                          r.totalVentas === 45 && 
                          r.totalProductos === 128;
          
          if (esPrueba) {
            console.log('🗑️ Eliminando reporte de prueba detectado:', r);
            // Importar la función de eliminación si existe, o comentar esto
            // eliminarReporteMensualPromise(r.id).catch(err => console.error('Error eliminando reporte de prueba:', err));
          }
          
          return !esPrueba;
        });
        
        setReportesMensuales(reportesFiltrados as unknown as ReporteMensual[]);
      }
    } catch (err) {
      console.error("❌ Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Auto-refrescar cada 2 segundos para detectar nuevas ventas
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 2000);

    return () => clearInterval(intervalo);
  }, [cargarDatos, autoRefreshEnabled]);

  // Funciones para calcular datos
  const obtenerFecha = (fechaHora: any): Date => {
    try {
      // Manejar Timestamp de Firestore
      if (fechaHora && typeof fechaHora === 'object' && 'toDate' in fechaHora) {
        const fecha = fechaHora.toDate();
        return new Date(fecha.getTime()); // Crear nueva instancia
      }
      // Manejar string
      if (typeof fechaHora === 'string') {
        const fecha = new Date(fechaHora);
        return fecha.getTime() > 0 ? fecha : new Date();
      }
      // Manejar Date
      if (fechaHora instanceof Date) {
        return new Date(fechaHora.getTime());
      }
      return new Date();
    } catch (error) {
      console.warn('Error parsing fechaHora:', fechaHora, error);
      return new Date();
    }
  };

  const normalizarFecha = (fecha: Date): Date => {
    // Crear una nueva fecha a las 00:00:00 para comparación consistente
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f;
  };

  const esHoy = (fecha: Date): boolean => {
    const hoy = normalizarFecha(new Date());
    const fechaNormalizada = normalizarFecha(fecha);
    return fechaNormalizada.getTime() === hoy.getTime();
  };

  const obtenerLunesDeEstaSemana = (): Date => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasAlLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diasAlLunes);
    lunes.setHours(0, 0, 0, 0);
    return lunes;
  };

  const obtenerDomingoDeEstaSemana = (): Date => {
    const lunes = obtenerLunesDeEstaSemana();
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    return domingo;
  };

  const esEstaSemanaSemana = (fecha: Date): boolean => {
    const lunes = obtenerLunesDeEstaSemana();
    const domingo = obtenerDomingoDeEstaSemana();
    const fechaNormalizada = normalizarFecha(fecha);
    return fechaNormalizada >= lunes && fechaNormalizada <= domingo;
  };

  const esEstesMes = (fecha: Date): boolean => {
    const hoy = new Date();
    const fechaNormalizada = normalizarFecha(fecha);
    const hoyNormalizado = normalizarFecha(hoy);
    return (
      fechaNormalizada.getMonth() === hoyNormalizado.getMonth() &&
      fechaNormalizada.getFullYear() === hoyNormalizado.getFullYear()
    );
  };

  const obtenerNombreMesActual = (): string => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const hoy = new Date();
    return meses[hoy.getMonth()];
  };

  const obtenerRangoSemanaCal = (): string => {
    const lunes = obtenerLunesDeEstaSemana();
    const domingo = obtenerDomingoDeEstaSemana();
    return `${lunes.getDate()} - ${domingo.getDate()} de ${obtenerNombreMesActual()}`;
  };

  const obtenerProximoDomingo = (): string => {
    const domingo = obtenerDomingoDeEstaSemana();
    return domingo.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calcularNumeroSemana = (fecha: Date): number => {
    const tempDate = new Date(fecha);
    const firstDayOfYear = new Date(tempDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (tempDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const semanasDisponibles = [...new Set(reportesSemanales.map(r => `${r.semana}-${r.año}`))].sort((a, b) => {
    const [semanaA, añoA] = a.split('-').map(Number);
    const [semanaB, añoB] = b.split('-').map(Number);
    if (añoB !== añoA) return añoB - añoA;
    return semanaB - semanaA;
  });

  const mesesDisponibles = [...new Set(reportesMensuales.map(r => `${r.mes}-${r.año}`))].sort((a, b) => {
    const [mesA, añoA] = a.split('-');
    const [mesB, añoB] = b.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const indiceA = meses.indexOf(mesA.toLowerCase());
    const indiceB = meses.indexOf(mesB.toLowerCase());
    
    if (parseInt(añoB) !== parseInt(añoA)) return parseInt(añoB) - parseInt(añoA);
    return indiceB - indiceA;
  });

  const primeraSemanaPorDefecto = semanasDisponibles.length > 0 ? semanasDisponibles[0] : null;
  const semanaActivaFiltro = semanaFiltrada === '' ? primeraSemanaPorDefecto : semanaFiltrada;

  const primerMesPorDefecto = mesesDisponibles.length > 0 ? mesesDisponibles[0] : null;
  const mesActivoFiltro = mesFiltrado === '' ? primerMesPorDefecto : mesFiltrado;

  const reportesFiltrados = semanaActivaFiltro
    ? reportesSemanales.filter(r => `${r.semana}-${r.año}` === semanaActivaFiltro)
    : reportesSemanales.sort((a, b) => {
        if (a.año !== b.año) return b.año - a.año;
        return b.semana - a.semana;
      });

  // Deduplicar reportes por semana-año (mostrar solo el primero de cada grupo)
  const reportesUnicos = reportesFiltrados.reduce((acc: ReporteSemanal[], reporte) => {
    const key = `${reporte.semana}-${reporte.año}`;
    if (!acc.find(r => `${r.semana}-${r.año}` === key)) {
      acc.push(reporte);
    }
    return acc;
  }, []);

  const transaccionesNormalizadas = useMemo<Venta[]>(() => {
    return (transaccionesCaja || []).map((t) => ({
      id: t.id || `transaccion-${Math.random()}`,
      productos: [],
      total: Number(t.monto || 0),
      metodo: t.tipo || "TRANSACCION",
      fechaHora: t.fechaHoraCL || t.fechaHora || new Date(),
    }));
  }, [transaccionesCaja]);

  // Calcular estadísticas
  const ventasHoy = ventasFirebase.filter(v => {
    const fecha = obtenerFecha(v.fechaHora);
    const fechaNorm = normalizarFecha(fecha);
    const hoyNorm = normalizarFecha(new Date());
    const esHoyBool = fechaNorm.getTime() === hoyNorm.getTime();
    console.log(`🔍 Venta ${v.id}: fechaHora=${v.fechaHora}, fecha=${fecha.toISOString()}, fechaNorm=${fechaNorm.toISOString()}, hoyNorm=${hoyNorm.toISOString()}, esHoy=${esHoyBool}`);
    return esHoyBool;
  });
  const transaccionesHoy = transaccionesNormalizadas.filter(t => {
    const fecha = obtenerFecha(t.fechaHora);
    const fechaNorm = normalizarFecha(fecha);
    const hoyNorm = normalizarFecha(new Date());
    return fechaNorm.getTime() === hoyNorm.getTime();
  });
  
  const ventasSemana = ventasFirebase.filter(v => {
    const fecha = obtenerFecha(v.fechaHora);
    const resultado = esEstaSemanaSemana(fecha);
    console.log(`📊 Venta ${v.id} en semana: ${resultado}`);
    return resultado;
  });
  const transaccionesSemana = transaccionesNormalizadas.filter(t => {
    const fecha = obtenerFecha(t.fechaHora);
    return esEstaSemanaSemana(fecha);
  });
  const ventasMes = ventasFirebase.filter(v => {
    const fecha = obtenerFecha(v.fechaHora);
    const resultado = esEstesMes(fecha);
    console.log(`📈 Venta ${v.id} en mes: ${resultado}`);
    return resultado;
  });
  const transaccionesMes = transaccionesNormalizadas.filter(t => {
    const fecha = obtenerFecha(t.fechaHora);
    return esEstesMes(fecha);
  });

  // Logging detallado
  console.log('📅 Total de ventas en Firebase:', ventasFirebase.length);
  console.log('📅 Ventas de hoy:', ventasHoy.length, ventasHoy);
  console.log('📊 Ventas de esta semana:', ventasSemana.length, ventasSemana);
  console.log('📈 Ventas de este mes:', ventasMes.length, ventasMes);

  const gananciaDia = ventasHoy.reduce((sum, v) => sum + v.total, 0) +
    transaccionesHoy.reduce((sum, t) => sum + t.total, 0);
  const gananciaSemanal = ventasSemana.reduce((sum, v) => sum + v.total, 0) +
    transaccionesSemana.reduce((sum, t) => sum + t.total, 0);
  const gananciaMensual = ventasMes.reduce((sum, v) => sum + v.total, 0) +
    transaccionesMes.reduce((sum, t) => sum + t.total, 0);

  const contarProductosVenta = (venta: Venta): number => {
    return (venta.productos || []).reduce((sum, p) => {
      const tipo = (p.TipoProducto || '').toLowerCase();
      const esPeso = tipo === 'peso' || tipo === 'kg' || tipo === 'kilogramo' || tipo === 'kilogramos';
      return sum + (esPeso ? 1 : (p.cantidad || 0));
    }, 0);
  };

  const contarProductosVentas = (ventas: Venta[]): number => {
    return ventas.reduce((sum, v) => sum + contarProductosVenta(v), 0);
  };

  const estadisticasDia = {
    totalVentas: ventasHoy.length,
    productosVendidos: ventasHoy.reduce(
      (sum, v) => sum + contarProductosVenta(v),
      0
    ),
  };

  const estadisticasSemana = {
    totalVentas: ventasSemana.length,
    productosVendidos: ventasSemana.reduce(
      (sum, v) => sum + contarProductosVenta(v),
      0
    ),
  };

  const estadisticasMes = {
    totalVentas: ventasMes.length,
    productosVendidos: ventasMes.reduce(
      (sum, v) => sum + contarProductosVenta(v),
      0
    ),
  };

  const totalEfectivoHoy = ventasHoy
    .filter((v) => String(v.metodo || '').toLowerCase().includes('efectivo'))
    .reduce((sum, v) => sum + v.total, 0);

  const totalDepositosHoy = transaccionesHoy
    .filter((t) => String(t.metodo || '').toLowerCase().includes('deposito'))
    .reduce((sum, t) => sum + t.total, 0);

  const totalCajaHoy = totalEfectivoHoy + totalDepositosHoy;

  // Obtener venta más grande del día
  const ventaMasGrande = ventasHoy.length > 0
    ? ventasHoy.reduce((max, v) => {
        const maxTotal = (max.total || 0);
        const vTotal = (v.total || 0);
        return vTotal > maxTotal ? v : max;
      })
    : null;

  console.log('🏆 Venta más grande del día:', ventaMasGrande);

  const formatearFecha = (fechaHora: string | Date) => {
    const fecha = obtenerFecha(fechaHora);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatearHora = (fechaHora: string | Date) => {
    const fecha = obtenerFecha(fechaHora);
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para guardar reporte de la semana anterior si es domingo o lunes
  const guardarReporteSemanaAnterior = useCallback(async () => {
    try {
      const hoy = new Date();
      const diaSemana = hoy.getDay();
      
      // Si es lunes (1) o domingo (0), generar reporte de la semana anterior
      if (diaSemana === 1 || diaSemana === 0) {
        // Calcular la semana anterior
        let domingoAnterior = new Date(hoy);
        let lunesAnterior = new Date(hoy);
        
        if (diaSemana === 0) {
          // Hoy es domingo - reportar de la semana que termina hoy
          domingoAnterior = new Date(hoy);
          lunesAnterior = new Date(hoy);
          lunesAnterior.setDate(hoy.getDate() - 6);
        } else {
          // Hoy es lunes - reportar de la semana anterior (que terminó ayer)
          domingoAnterior = new Date(hoy);
          domingoAnterior.setDate(hoy.getDate() - 1);
          lunesAnterior = new Date(domingoAnterior);
          lunesAnterior.setDate(domingoAnterior.getDate() - 6);
        }
        
        lunesAnterior.setHours(0, 0, 0, 0);
        domingoAnterior.setHours(23, 59, 59, 999);
        
        // Calcular número de semana
        const tempDate = new Date(lunesAnterior);
        const firstDayOfYear = new Date(tempDate.getFullYear(), 0, 1);
        const pastDaysOfYear = (tempDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const numeroSemana = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        
        // Verificar si este reporte ya existe
        const reporteExistente = reportesSemanales.find(
          r => r.semana === numeroSemana && r.año === lunesAnterior.getFullYear()
        );
        
        if (!reporteExistente) {
          // Filtrar ventas de la semana
          const ventasSemanaPasada = ventasFirebase.filter(v => {
            const fecha = obtenerFecha(v.fechaHora);
            return fecha >= lunesAnterior && fecha <= domingoAnterior;
          });
          
          // Solo incluir depósitos en ganancias
          const transaccionesSemanaPasada = transaccionesNormalizadas.filter(t => {
            const fecha = obtenerFecha(t.fechaHora);
            const enRango = fecha >= lunesAnterior && fecha <= domingoAnterior;
            const esDeposito = String(t.metodo || '').toUpperCase() === 'DEPOSITO';
            return enRango && esDeposito;
          });
          
          const gananciaSemanaAnterior =
            ventasSemanaPasada.reduce((sum, v) => sum + v.total, 0) +
            transaccionesSemanaPasada.reduce((sum, t) => sum + t.total, 0);
            
          const totalProductos = contarProductosVentas(ventasSemanaPasada);
          
          const nombreMes = lunesAnterior.toLocaleDateString('es-ES', { month: 'long' });
          
          await guardarReporteSemanalPromise({
            fechaInicio: lunesAnterior,
            fechaFin: domingoAnterior,
            totalGanancia: gananciaSemanaAnterior,
            totalVentas: ventasSemanaPasada.length,
            totalProductos: totalProductos,
            semana: numeroSemana,
            año: lunesAnterior.getFullYear(),
            mes: nombreMes,
          });
          
          console.log(`✅ Reporte semanal #${numeroSemana} ${lunesAnterior.getFullYear()} generado automáticamente con ${ventasSemanaPasada.length} ventas`);
          
          // Recargar datos para reflejar el nuevo reporte en la lista
          await cargarDatos();
        } else {
          console.log(`ℹ️ Reporte semanal #${numeroSemana} ${lunesAnterior.getFullYear()} ya existe`);
        }
      }
    } catch (error) {
      console.error('❌ Error guardando reporte semanal:', error);
    }
  }, [ventasFirebase, reportesSemanales, transaccionesNormalizadas, cargarDatos]);

  // Función para guardar reporte del mes anterior si es el primer día del mes
  const guardarReportesMesAnterior = useCallback(async () => {
    try {
      const hoy = new Date();
      const diaDelMes = hoy.getDate();
      
      // Si es entre el día 1 y 3 del mes, guardar el mes anterior
      if (diaDelMes <= 3) {
        const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        
        primerDiaMesAnterior.setHours(0, 0, 0, 0);
        ultimoDiaMesAnterior.setHours(23, 59, 59, 999);
        
        // Filtrar ventas del mes anterior
        const ventasMesAnterior = ventasFirebase.filter(v => {
          const fecha = obtenerFecha(v.fechaHora);
          return fecha >= primerDiaMesAnterior && fecha <= ultimoDiaMesAnterior;
        });
        const transaccionesMesAnterior = transaccionesNormalizadas.filter(t => {
          const fecha = obtenerFecha(t.fechaHora);
          return fecha >= primerDiaMesAnterior && fecha <= ultimoDiaMesAnterior;
        });
        
        if (ventasMesAnterior.length > 0 || transaccionesMesAnterior.length > 0) {
          const gananciaMesAnterior =
            ventasMesAnterior.reduce((sum, v) => sum + v.total, 0) +
            transaccionesMesAnterior.reduce((sum, t) => sum + t.total, 0);
          const totalProductos = contarProductosVentas(ventasMesAnterior);
          
          const nombreMes = primerDiaMesAnterior.toLocaleDateString('es-ES', { month: 'long' });
          
          // Verificar si este reporte ya existe
          const reporteExistente = reportesMensuales.find(
            r => r.mes === nombreMes && r.año === ultimoDiaMesAnterior.getFullYear()
          );
          
          if (!reporteExistente) {
            await guardarReporteMessualPromise({
              fechaInicio: primerDiaMesAnterior,
              fechaFin: ultimoDiaMesAnterior,
              totalGanancia: gananciaMesAnterior,
              totalVentas: ventasMesAnterior.length,
              totalProductos: totalProductos,
              mes: nombreMes,
              año: ultimoDiaMesAnterior.getFullYear(),
            });
            console.log('✅ Reporte mensual guardado automáticamente');
            // Recargar datos
            await cargarDatos();
          }
        }
      }
    } catch (error) {
      console.error('Error guardando reporte mensual:', error);
    }
  }, [ventasFirebase, reportesMensuales, transaccionesNormalizadas, cargarDatos]);

  // Función para generar reporte manualmente de cualquier semana
  const generarReporteSemanaManual = useCallback(async () => {
    try {
      // Detener auto-refresh durante la operación
      setAutoRefreshEnabled(false);
      
      // Generar reporte de la semana anterior (semana 2: 05-11 enero)
      // Usar UTC para evitar problemas de zona horaria
      const lunesAnterior = new Date(Date.UTC(2026, 0, 5, 0, 0, 0, 0)); // 5 enero 2026 UTC
      const domingoAnterior = new Date(Date.UTC(2026, 0, 11, 23, 59, 59, 999)); // 11 enero 2026 UTC
      
      console.log('📅 Rango de búsqueda:');
      console.log('  Lunes:', lunesAnterior.toISOString(), lunesAnterior.toLocaleDateString('es-ES'));
      console.log('  Domingo:', domingoAnterior.toISOString(), domingoAnterior.toLocaleDateString('es-ES'));
      console.log('  Total ventas en Firebase:', ventasFirebase.length);
      
      const numeroSemana = 2;
      const año = 2026;
      
      // Verificar si ya existe
      const reporteExistente = reportesSemanales.find(
        r => r.semana === numeroSemana && r.año === año
      );
      
      if (reporteExistente) {
        console.log(`⚠️ Reporte #${numeroSemana} ${año} ya existe. Eliminando para regenerar...`);
        await eliminarReporteSemanalPromise(reporteExistente.id);
        // Esperar a que Firebase confirme la eliminación
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Filtrar ventas de esa semana con logging detallado
      const ventasSemanaPasada = ventasFirebase.filter((v, idx) => {
        const fechaOriginal = v.fechaHora;
        const fecha = obtenerFecha(fechaOriginal);
        const fechaTimestamp = fecha.getTime();
        const dentroDelRango = fechaTimestamp >= lunesAnterior.getTime() && fechaTimestamp <= domingoAnterior.getTime();
        
        if (idx < 5 || dentroDelRango) { // Log primeras 5 o las que coincidan
          console.log(`  Venta ${idx + 1} (${v.id.substring(0, 8)}):`, {
            fechaOriginal: fechaOriginal,
            fechaUTC: fecha.toISOString(),
            fechaLocal: fecha.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            dentroDelRango: dentroDelRango,
            total: v.total
          });
        }
        
        return dentroDelRango;
      });
      
      console.log(`✅ Ventas filtradas: ${ventasSemanaPasada.length}`);
      
      if (ventasSemanaPasada.length === 0) {
        console.warn('⚠️ No hay ventas en la semana 05-11 enero');
        alert('No hay ventas registradas en la semana del 05 al 11 de enero');
        setAutoRefreshEnabled(true);
        return;
      }
      
      const gananciaSemanaAnterior = ventasSemanaPasada.reduce((sum, v) => sum + v.total, 0);
      const totalProductos = contarProductosVentas(ventasSemanaPasada);
      
      const nombreMes = 'enero';
      
      console.log(`📝 Guardando reporte:`, {
        ventas: ventasSemanaPasada.length,
        ganancia: gananciaSemanaAnterior,
        productos: totalProductos,
        semana: numeroSemana,
        año: año
      });
      
      // Guardar con las fechas UTC (convertidas de Date a Date con zona horaria local de Chile)
      const fechaInicioChile = new Date(2026, 0, 5, 0, 0, 0, 0); // Local Chile
      const fechaFinChile = new Date(2026, 0, 11, 23, 59, 59, 999); // Local Chile
      
      await guardarReporteSemanalPromise({
        fechaInicio: fechaInicioChile,
        fechaFin: fechaFinChile,
        totalGanancia: gananciaSemanaAnterior,
        totalVentas: ventasSemanaPasada.length,
        totalProductos: totalProductos,
        semana: numeroSemana,
        año: año,
        mes: nombreMes,
      });
      
      console.log(`✅ Reporte semanal #${numeroSemana} ${año} generado manualmente`);
      
      // Esperar a que Firebase confirme la escritura
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar datos
      await cargarDatos();
      
      alert(`Reporte generado: ${ventasSemanaPasada.length} ventas, $${gananciaSemanaAnterior.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
      
      // Reactivar auto-refresh
      setAutoRefreshEnabled(true);
    } catch (error) {
      console.error('❌ Error generando reporte manual:', error);
      alert('Error al generar el reporte. Revisa la consola.');
      setAutoRefreshEnabled(true);
    }
  }, [ventasFirebase, reportesSemanales, cargarDatos]);

  // Usar useEffect para guardar reportes automáticamente
  useEffect(() => {
    // Solo intentar guardar si no está cargando y hay ventas registradas
    if (!loading && ventasFirebase.length > 0) {
      guardarReporteSemanaAnterior();
      guardarReportesMesAnterior();
    }
  }, [loading, ventasFirebase.length, guardarReporteSemanaAnterior, guardarReportesMesAnterior]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-start justify-center px-6">
      <div className="w-full max-w-[95%] h-full bg-white rounded-lg shadow-md p-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl text-gray-900 mb-1">Reportes de Ganancias</h1>
            <p className="text-sm text-gray-600">Análisis detallado de ventas y ganancias del negocio</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setVistaActiva('actual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  vistaActiva === 'actual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setVistaActiva('historial')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  vistaActiva === 'historial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Historial
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2 text-gray-700 rounded-lg transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al menú
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 space-y-6 pb-8">
          {vistaActiva === 'actual' ? (
            <>
              {/* Vista Actual - Resumen del Día/Semana/Mes */}
          <div>
            <h2 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Resumen de Ganancias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ganancias del Día */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Ganancias del Día</p>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                {estadisticasDia.totalVentas === 0 ? (
                  <>
                    <p className="text-base text-green-700 font-semibold mb-2">No hay ventas realizadas en el día</p>
                    <div className="space-y-0.5 text-sm text-green-700 opacity-50">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-4xl text-green-900 font-bold mb-2">
                      ${gananciaDia.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="space-y-1 text-base text-green-700">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">{estadisticasDia.totalVentas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">{estadisticasDia.productosVendidos}</span>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-sm text-green-600 mt-2 border-t border-green-200 pt-1.5">{formatearFecha(new Date())}</p>
              </div>

              {/* Ganancias Semanales */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Ganancias Semanales</p>
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                {estadisticasSemana.totalVentas === 0 ? (
                  <>
                    <p className="text-base text-blue-700 font-semibold mb-2">No hay ventas realizadas esta semana</p>
                    <div className="space-y-0.5 text-sm text-blue-700 opacity-50">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-4xl text-blue-900 font-bold mb-2">
                      ${gananciaSemanal.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="space-y-1 text-base text-blue-700">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">{estadisticasSemana.totalVentas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">{estadisticasSemana.productosVendidos}</span>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-sm text-blue-600 mt-2 border-t border-blue-200 pt-1.5">{obtenerRangoSemanaCal()}</p>
              </div>

              {/* Ganancias Mensuales */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-purple-700 font-semibold uppercase tracking-wide">Ganancias Mensuales</p>
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                {estadisticasMes.totalVentas === 0 ? (
                  <>
                    <p className="text-base text-purple-700 font-semibold mb-2">No hay ventas realizadas este mes</p>
                    <div className="space-y-0.5 text-sm text-purple-700 opacity-50">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-4xl text-purple-900 font-bold mb-2">
                      ${gananciaMensual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="space-y-1 text-base text-purple-700">
                      <div className="flex justify-between">
                        <span>Total de Ventas:</span>
                        <span className="font-semibold">{estadisticasMes.totalVentas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos Vendidos:</span>
                        <span className="font-semibold">{estadisticasMes.productosVendidos}</span>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-sm text-purple-600 mt-2 border-t border-purple-200 pt-1.5">{obtenerNombreMesActual().charAt(0).toUpperCase() + obtenerNombreMesActual().slice(1)} 2026</p>
              </div>
            </div>
          </div>

          {/* Venta Más Grande del Día + Total en Caja */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch -mt-1">
            <div className="h-full">
              <h2 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Venta Destacada del Día
              </h2>
              {ventaMasGrande ? (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-lg p-3 shadow-md h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Venta de Mayor Valor del Día</p>
                      <p className="text-3xl text-blue-900 font-bold mb-2">
                        ${((ventaMasGrande.total) || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-700 mb-3">
                        <span className="flex items-center gap-1.5 bg-blue-100 px-3 py-2 rounded-md shadow-sm border-2 border-blue-500">
                          <Clock className="w-4 h-4 text-blue-700 font-bold" />
                          <span className="font-bold text-blue-900 text-sm">{formatearHora(ventaMasGrande.fechaHora)}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => onAbrirHistorial?.(ventaMasGrande.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md"
                      >
                        Ver más detalles
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-lg p-3 shadow-md min-h-[160px] h-full flex items-center justify-center">
                  <p className="text-center text-gray-500 text-base">No hay ventas registradas hoy</p>
                </div>
              )}
            </div>

            <div className="h-full">
              <h2 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Total figura en caja hoy
              </h2>
              <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-3 shadow-md min-h-[160px] h-full flex flex-col justify-center">
                <p className="text-sm text-emerald-700 font-medium mb-1">Ventas en efectivo + depósitos</p>
                <p className="text-3xl text-emerald-900 font-bold">
                  ${totalCajaHoy.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
            </>
          ) : (
            <>
              {/* Vista Historial - Reportes Guardados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Reportes Semanales */}
                <div className="h-full">
                  <h2 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Reportes Semanales
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Filtrar por semana:</label>
                      <select
                        value={semanaActivaFiltro || ''}
                        onChange={(e) => setSemanaFiltrada(e.target.value)}
                        disabled={reportesSemanales.length === 0}
                        className={`px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition ${
                          reportesSemanales.length === 0
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-gray-300 text-gray-900 hover:border-gray-400 focus:ring-blue-500'
                        }`}
                      >
                        {semanasDisponibles.map((semana) => (
                          <option key={semana} value={semana}>
                            Semana #{semana}
                          </option>
                        ))}
                      </select>
                    </div>
                    {reportesSemanales.length === 0 ? (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center min-h-[250px] flex items-center justify-center">
                        <p className="text-blue-700 font-medium">Aún no hay registros</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {reportesUnicos.map((reporte, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm min-h-[250px]">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Semana #{reporte.semana} {reporte.año}</p>
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-2xl text-blue-900 font-bold mb-2">
                            ${reporte.totalGanancia.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <div className="space-y-1 text-sm text-blue-700 mb-3 pb-3 border-b border-blue-200">
                            <div className="flex justify-between">
                              <span>Total de Ventas:</span>
                              <span className="font-semibold">{reporte.totalVentas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Productos Vendidos:</span>
                              <span className="font-semibold">{reporte.totalProductos}</span>
                            </div>
                          </div>
                          <p className="text-xs text-blue-600">
                            {formatearFecha(obtenerFecha(reporte.fechaInicio))} - {formatearFecha(obtenerFecha(reporte.fechaFin))}
                          </p>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reportes Mensuales */}
                <div className="h-full">
                  <h2 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Reportes Mensuales
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Filtrar por mes:</label>
                      <select
                        value={mesActivoFiltro || ''}
                        onChange={(e) => setMesFiltrado(e.target.value)}
                        disabled={reportesMensuales.length === 0}
                        className={`px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition ${
                          reportesMensuales.length === 0
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-gray-300 text-gray-900 hover:border-gray-400 focus:ring-purple-500'
                        }`}
                      >
                        {mesesDisponibles.map((mes) => (
                          <option key={mes} value={mes}>
                            {mes.split('-')[0].charAt(0).toUpperCase() + mes.split('-')[0].slice(1)} {mes.split('-')[1]}
                          </option>
                        ))}
                      </select>
                    </div>
                    {reportesMensuales.length === 0 ? (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center min-h-[250px] flex items-center justify-center">
                        <p className="text-purple-700 font-medium">No hay reportes mensuales registrados</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {reportesMensuales
                          .filter(r => `${r.mes}-${r.año}` === mesActivoFiltro)
                          .map((reporte, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4 shadow-sm min-h-[250px]">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-purple-700 font-semibold uppercase tracking-wide">{reporte.mes} {reporte.año}</p>
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-2xl text-purple-900 font-bold mb-2">
                            ${reporte.totalGanancia.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <div className="space-y-1 text-sm text-purple-700 mb-3 pb-3 border-b border-purple-200">
                            <div className="flex justify-between">
                              <span>Total de Ventas:</span>
                              <span className="font-semibold">{reporte.totalVentas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Productos Vendidos:</span>
                              <span className="font-semibold">{reporte.totalProductos}</span>
                            </div>
                          </div>
                          <p className="text-xs text-purple-600">
                            {formatearFecha(obtenerFecha(reporte.fechaInicio))} - {formatearFecha(obtenerFecha(reporte.fechaFin))}
                          </p>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
