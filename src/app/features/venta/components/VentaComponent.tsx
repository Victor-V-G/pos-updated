import IngresarCBD from "./IngresarCDB";
import MostrarProductosVenta from "./MostrarProductosVenta";
import RealizarVenta from "./RealizarVenta";

export const VentaComponent = () => {

    return (

        <>  
            <header><h1>REALIZAR VENTA</h1></header>

            <IngresarCBD/>

            <RealizarVenta/> 

            <MostrarProductosVenta/>
        </>

    )

}

export default VentaComponent;