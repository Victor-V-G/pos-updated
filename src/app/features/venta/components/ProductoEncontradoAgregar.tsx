import { PropsProductoFind } from "@/app/shared/interfaces/ingresar-cdb/PropsProductoFind";

export const ProductoEncontradoAgregar = ({ProductoFindSetter} : PropsProductoFind) => {

    return (
        <>
            {
                ProductoFindSetter.length === 0 ? (
                    <h1>SE DEBE ESCANEAR UN PRODUCTO PREVIAMENTE</h1>
                ) : (
                    <table>
                        <tbody>
                            <tr>
                                <td>NOMBRE DEL PRODUCTO</td>
                                <td>CODIGO DE BARRAS</td>
                                <td>PRECIO</td>
                                <td>STOCK</td>
                                <td>ACCION</td>
                            </tr>
                                {ProductoFindSetter.map((productoMap, index) => (
                                    <tr 
                                        key={index}
                                        className={
                                            Number(productoMap.Stock) <= 1 ? "fila-stock-bajo" : 
                                            Number(productoMap.Stock) <= 5 ? "fila-stock-medio" : ""}>
                                        <td>{productoMap.NombreProducto}</td>
                                        <td>{productoMap.CodigoDeBarras}</td>
                                        <td>{productoMap.Precio}</td>
                                        <td>{productoMap.Stock}</td>
                                        <td>
                                            <button onClick={()=>{
                                            }}>
                                                <h1>AGREGAR</h1>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )
            }
            {ProductoFindSetter.some(p => Number(p.Stock) <= 5) && (
                <div>
                    <h1>El producto se encuentra bajo el umbral de stock de 5u</h1>
                </div>
            )}  
            
        </>
    )
}

export default ProductoEncontradoAgregar;