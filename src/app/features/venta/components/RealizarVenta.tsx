
import { registrarVentaPromise } from "@/app/firebase/Promesas";
import { PropsRealizarVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsRealizarVenta";
import { SetterResetVenta } from "@/app/shared/interfaces/ingresar-cdb/SetterResetVenta";
import '../assets/css/realizar-venta-style.css'

type PropsCombinadas = PropsRealizarVenta & SetterResetVenta & {
  className?: string;
};

export const RealizarVenta = ({TotalGeneral, ProductosVenta, VentaCompletada, className}:PropsCombinadas) => {
    
    const handleCallPromiseVentaRealizada = () => {
        registrarVentaPromise({TotalGeneral, ProductosVenta}).then(()=>{
            VentaCompletada();
        })
    }

    return (
        <>
            {TotalGeneral === 0 ? (
                <div className="esqueleto-factura">
                    <div className="esqueleto-linea-factura"></div>
                    <div className="esqueleto-linea-factura"></div>
                    <div className="esqueleto-linea-factura"></div>
                </div>
            ) : (
                <div className="factura-container">
                    <div className="factura-icon">🧾</div>
                    <h2 className="factura-title">FACTURA</h2>

                    <div className="factura-total">
                        TOTAL: <strong>${TotalGeneral}</strong>
                    </div>

                    <button 
                        className="factura-btn"
                        onClick={handleCallPromiseVentaRealizada}
                    >
                        💵 REALIZAR VENTA
                    </button>
                </div>
            )}
        </>
    )
}

export default RealizarVenta;