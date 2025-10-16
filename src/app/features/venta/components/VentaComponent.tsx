import { useState } from "react";
import IngresarCDB from "./IngresarCDB";
import MostrarProductosVenta from "./MostrarProductosVenta";
import RealizarVenta from "./RealizarVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import ProductoEncontradoAgregar from "./ProductoEncontradoAgregar";

export const VentaComponent = () => {

    const [ProductoFindSetter, setProductoFindSetter] = useState<ProductoInterface[]>([])

    const [ProductoAgregado, setProductoAgregado] = useState<ProductoInterface[]>([])

    const [LimpiarInput, setLimpiarInput] = useState(false)
    console.log(ProductoAgregado)
    return (

        <>  
            <header><h1>REALIZAR VENTA</h1></header>

            <IngresarCDB setProductoFindSetter={setProductoFindSetter} LimpiarImput={LimpiarInput} setLimpiarInput={setLimpiarInput}/>
            
            <ProductoEncontradoAgregar ProductoFindSetter={ProductoFindSetter} setProductoAgregado={setProductoAgregado} setLimpiarInput={setLimpiarInput}/>

            <MostrarProductosVenta ProductoAgregado={ProductoAgregado}/>

            <RealizarVenta/> 
        </>

    )

}

export default VentaComponent;