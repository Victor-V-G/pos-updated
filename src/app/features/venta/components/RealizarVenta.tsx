
import { registrarVentaPromise } from "@/app/firebase/Promesas";
import { PropsRealizarVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsRealizarVenta";
import { SetterResetVenta } from "@/app/shared/interfaces/ingresar-cdb/SetterResetVenta";

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
        <div className={className}>

            <header><h1>FACTURA</h1></header>

            <main>
                <h1>TOTAL: {TotalGeneral}</h1>
                {TotalGeneral === 0 ? (
                    <h1>DEBES INGRESAR ALGUN PRODUCTO</h1>
                ):(
                    <button onClick={()=>{
                        handleCallPromiseVentaRealizada();
                    }}
                    disabled={TotalGeneral == 0}>
                        <h1>REALIZAR VENTA</h1>
                    </button>
                )} 
                
            </main>
        </div>
    )
}

export default RealizarVenta;