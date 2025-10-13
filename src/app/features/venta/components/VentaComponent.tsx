import { useState } from "react";
import IngresarCDB from "./IngresarCDB";
import MostrarProductosVenta from "./MostrarProductosVenta";
import RealizarVenta from "./RealizarVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import ProductoEncontradoAgregar from "./ProductoEncontradoAgregar";

export const VentaComponent = () => {

    const [ProductoFindSetter, setProductoFindSetter] = useState<ProductoInterface[]>([])

    console.log(ProductoFindSetter)
    return (

        <>  
            <header><h1>REALIZAR VENTA</h1></header>

            <IngresarCDB setProductoFindSetter={setProductoFindSetter}/>
            
            <ProductoEncontradoAgregar ProductoFindSetter={ProductoFindSetter}/>

            <MostrarProductosVenta/>

            <RealizarVenta/> 
        </>

    )

}

export default VentaComponent;