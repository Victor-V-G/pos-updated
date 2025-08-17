import { SidebarInterfaceProps } from "@/app/shared/interfaces/sidebar/SidebarInterfaceProps";

export const InicioComponent = ({setOpenManagerInicio, setOpenManagerVenta, setOpenManagerVerStock, setOpenManagerHistorialDeVenta, setOpenManagerGestion} : SidebarInterfaceProps) => {
    return (
        <>
            <div>

                <header>

                    <h1>BIENVENIDO. ELIJA UNA OPCION.</h1>

                </header>

                <main>

                    <nav>

                        <button
                            onClick={()=>{
                                setOpenManagerInicio(false);
                                setOpenManagerVenta(true);
                                setOpenManagerVerStock(false);
                                setOpenManagerHistorialDeVenta(false);
                                setOpenManagerGestion(false);
                            }}>
                            <span>REALIZAR VENTA</span>
                        </button>

                        <button
                            onClick={()=>{
                                setOpenManagerInicio(false);
                                setOpenManagerVenta(false);
                                setOpenManagerVerStock(true);
                                setOpenManagerHistorialDeVenta(false);
                                setOpenManagerGestion(false);
                            }}>
                            <span>VER STOCK</span>
                        </button>

                        <button
                            onClick={()=>{
                                setOpenManagerInicio(false);
                                setOpenManagerVenta(false);
                                setOpenManagerVerStock(false);
                                setOpenManagerHistorialDeVenta(true);
                                setOpenManagerGestion(false);
                            }}>
                            <span>HISTORIAL DE VENTAS</span>
                        </button>

                    </nav>

                </main>

            </div>
        </>
    )
}

export default InicioComponent;