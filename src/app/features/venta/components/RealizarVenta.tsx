import { PropsRealizarVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsRealizarVenta";

export const RealizarVenta = ({TotalGeneral}:PropsRealizarVenta) => {
    return (
        <>
            <h1>REALIZAR VENTA</h1>
            {TotalGeneral}
        </>
    )
}

export default RealizarVenta;