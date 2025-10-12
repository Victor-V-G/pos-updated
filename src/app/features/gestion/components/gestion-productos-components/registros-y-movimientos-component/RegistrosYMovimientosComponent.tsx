import { useEffect, useState } from 'react';
import '../../../assets/css/gestion-productos-styles/registros-y-movimientos-style/registros-y-movimientos-style.css';
import { RegistrosYMovimientosInterface } from '@/app/shared/interfaces/registros-y-movimientos/RegistrosYMovimientosInterface';
import { obtenerMovimientosPromise } from '@/app/firebase/Promesas';

const MOVIMIENTOS_POR_PAGINA = 10;

export const RegistrosYMovimientosComponent = () => {
    const [MovimientosRecuperados, setMovimientosRecuperados] = useState<RegistrosYMovimientosInterface[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        obtenerMovimientosPromise()
            .then((movimientosGet) => {
                const movimientosOrdenados = movimientosGet.sort((a, b) => {
                    // Convertimos las fechas a objetos Date
                    const fechaA = new Date(a.fechaHora);
                    const fechaB = new Date(b.fechaHora);

                    // Orden descendente: más reciente primero
                    return fechaB.getTime() - fechaA.getTime();
                });

                setMovimientosRecuperados(movimientosOrdenados);
            })
            .catch((error) => {
                alert("NO SE PUDIERON RECUPERAR LOS MOVIMIENTOS");
                console.log(error);
            });
    }, []);


    // Calcular cuántas páginas hay
    const totalPaginas = Math.ceil(MovimientosRecuperados.length / MOVIMIENTOS_POR_PAGINA);

    // Obtener los movimientos que deben mostrarse en la página actual
    const movimientosPaginados = MovimientosRecuperados.slice(
        (paginaActual - 1) * MOVIMIENTOS_POR_PAGINA,
        paginaActual * MOVIMIENTOS_POR_PAGINA
    );

    // Navegar a la página anterior
    const irPaginaAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    // Navegar a la página siguiente
    const irPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
        }
    };

    return (
        <div className="bloque-unificado">
            <header className="header-title">
                <h1>REGISTROS Y MOVIMIENTOS</h1>
            </header>

            <main>
                <table className="tabla-acciones">
                    <thead>
                        <tr>
                            <td>ACCION</td>
                            <td>MOVIMIENTOS REGISTRADOS</td>
                            <td>FECHA</td>
                        </tr>
                    </thead>
                    <tbody>
                        {MovimientosRecuperados.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="no-productos">
                                    SE DEBE REALIZAR UNA ACCION PREVIAMENTE
                                </td>
                            </tr>
                        ) : (
                            movimientosPaginados.map((movimientosMap, index) => (
                                <tr key={index}>
                                    <td>{movimientosMap.accion}</td>
                                    <td>{movimientosMap.cambios}</td>
                                    <td>{movimientosMap.fechaHora}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Controles de paginación */}
                {MovimientosRecuperados.length > 0 && (
                    <div className="paginacion">
                        <button onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                            ← Anterior
                        </button>
                        <span>Página {paginaActual} de {totalPaginas}</span>
                        <button onClick={irPaginaSiguiente} disabled={paginaActual === totalPaginas}>
                            Siguiente →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RegistrosYMovimientosComponent;
