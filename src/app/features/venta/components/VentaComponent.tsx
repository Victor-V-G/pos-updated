import { useState } from "react";
import IngresarCDB from "./IngresarCDB";
import MostrarProductosVenta from "./MostrarProductosVenta";
import RealizarVenta from "./RealizarVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";

export const VentaComponent = () => {

    const [ProductoFindSetter, setProductoFindSetter] = useState<ProductoInterface[]>([])

    console.log(ProductoFindSetter)
    return (

        <>  
            <header><h1>REALIZAR VENTA</h1></header>

            <IngresarCDB setProductoFindSetter={setProductoFindSetter}/>

            <RealizarVenta/> 

            <MostrarProductosVenta/>
        </>

    )

}

export default VentaComponent;