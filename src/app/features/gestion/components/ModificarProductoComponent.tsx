import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";



export const ModificarProductoComponent = ({ObtenerIndexModificar} : ModificarProductoInterface) => {

    return (

        <>
            {ObtenerIndexModificar}
            <button>
                <span>MODIFICAR</span>
            </button>

        </>

    )

}

export default ModificarProductoComponent;