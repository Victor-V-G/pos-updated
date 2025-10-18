import { useState } from "react";
import IngresarCDB from "./IngresarCDB";
import MostrarProductosVenta from "./MostrarProductosVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import ProductoEncontradoAgregar from "./ProductoEncontradoAgregar";
import '../assets/css/venta-component-style.css'
export const VentaComponent = () => {

    const [ProductoFindSetter, setProductoFindSetter] = useState<ProductoInterface[]>([])
    const [ProductoAgregado, setProductoAgregado] = useState<ProductoInterface[]>([])
    const [LimpiarInput, setLimpiarInput] = useState(false)

    return (

        <div className="venta-grid">  

            <div>
                <header className="venta-header">
                    <h1>REALIZAR VENTA</h1>
                </header>
            </div>
            
            <div className="venta-input">
                <IngresarCDB setProductoFindSetter={setProductoFindSetter} LimpiarImput={LimpiarInput} setLimpiarInput={setLimpiarInput}/>
            </div>

            <div className="venta-producto-agregar">
                <ProductoEncontradoAgregar ProductoFindSetter={ProductoFindSetter} setProductoAgregado={setProductoAgregado} setLimpiarInput={setLimpiarInput}/>
            </div>
            
            <div className="venta-main">
                <div className="venta-tabla">
                    <MostrarProductosVenta ProductoAgregado={ProductoAgregado}/>
                </div>
            </div>

        </div>

    )

}

export default VentaComponent;