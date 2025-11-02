import { useEffect, useState } from 'react';
import '../../../assets/css/gestion-productos-styles/registros-y-movimientos-style/registros-y-movimientos-style.css';
import { RegistrosYMovimientosInterface } from '@/app/shared/interfaces/registros-y-movimientos/RegistrosYMovimientosInterface';
import { obtenerMovimientosPromise } from '@/app/firebase/Promesas';

const MOVIMIENTOS_POR_PAGINA = 10;

export const RegistrosYMovimientosComponent = () => {
    const [MovimientosRecuperados, setMovimientosRecuperados] = useState<RegistrosYMovimientosInterface[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [filtroAccion, setFiltroAccion] = useState("todos");

    // ✅ Convertidor seguro de fecha (dd/mm/yyyy hh:mm:ss -> Date)
    const parsearFecha = (fechaHora: string) => {
        const [fecha, hora] = fechaHora.split(", ");
        const [dia, mes, año] = fecha.split("/").map(Number);
        return new Date(año, mes - 1, dia, ...hora.split(":").map(Number));
    };

    useEffect(() => {
        obtenerMovimientosPromise()
            .then((movimientosGet) => {
                const ordenados = [...movimientosGet].sort((a, b) =>
                    parsearFecha(b.fechaHora).getTime() - parsearFecha(a.fechaHora).getTime()
                );
                setMovimientosRecuperados(ordenados);
            })
            .catch((e) => console.log("Error al obtener movimientos:", e));
    }, []);

    // ✅ Filtro de acción sin romper el orden
    const Filtrados = MovimientosRecuperados.filter(mov => {
        const accionLower = mov.accion.toLowerCase();
        if (filtroAccion === "todos") return true;
        return accionLower.includes(filtroAccion);
    });

    const totalPaginas = Math.ceil(Filtrados.length / MOVIMIENTOS_POR_PAGINA);

    const movimientosPaginados = Filtrados.slice(
        (paginaActual - 1) * MOVIMIENTOS_POR_PAGINA,
        paginaActual * MOVIMIENTOS_POR_PAGINA
    );

    const iconoAccion = (accion: string) => {
        const a = accion.toLowerCase();
        if (a.includes("registrar")) return "📦";
        if (a.includes("modificar")) return "✏️";
        return "🗑️";
    };

    return (
        <div className="bloque-unificado">

            {/* ✅ Header */}
            <h1 className="header-title">REGISTROS Y MOVIMIENTOS</h1>

            {/* ✅ Filtro de acciones */}
            <div className="filtro-movimientos">
                <label>Filtrar por acción:</label>
                <select
                    value={filtroAccion}
                    onChange={(e) => {
                        setFiltroAccion(e.target.value);
                        setPaginaActual(1);
                    }}
                >
                    <option value="todos">Todos</option>
                    <option value="registrar">Registrar</option>
                    <option value="modificar">Modificar</option>
                    <option value="eliminar">Eliminar</option>
                </select>
            </div>

            <table className="tabla-acciones">
                <thead>
                    <tr>
                        <td>ACCIÓN</td>
                        <td className="col-cambios">MOVIMIENTO REGISTRADO</td>
                        <td className="col-fecha">FECHA Y HORA</td>
                    </tr>
                </thead>

                <tbody>
                    {Filtrados.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="no-productos">
                                ⚠ No hay movimientos con los filtros aplicados
                            </td>
                        </tr>
                    ) : (
                        movimientosPaginados.map((mov, idx) => (
                            <tr key={idx}>
                                <td className="accion-col">
                                    {iconoAccion(mov.accion)} {mov.accion}
                                </td>
                                <td className="texto-cambios">{mov.cambios}</td>
                                <td className="fecha-col">{mov.fechaHora}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ✅ PAGINACIÓN */}
            {Filtrados.length > 0 && (
                <div className="paginacion">
                    <button
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        disabled={paginaActual === 1}
                    >
                        ← Anterior
                    </button>

                    <span>Página {paginaActual} de {totalPaginas}</span>

                    <button
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegistrosYMovimientosComponent;
