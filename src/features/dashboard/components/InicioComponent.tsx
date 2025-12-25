import '@/assets/styles/inicio-style.css'
import { SidebarInterfaceProps } from "@/shared/types";
import Image from 'next/image';
import VentaImg from '@/assets/images/shopping-cart-inicio.png'
import VerStockImg from '@/assets/images/paquete-o-empaquetar.png'
import HistorialVenta from '@/assets/images/reporte.png'


export const InicioComponent = ({setOpenManagerInicio, setOpenManagerVenta, setOpenManagerVerStock, setOpenManagerHistorialDeVenta, setOpenManagerGestion} : SidebarInterfaceProps) => {
    return (
        <>
            <div className='inicio-div-style'>

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
                            <Image
                                className='inicio-style-img'
                                src={VentaImg}
                                alt='REALIZAR VENTA'
                            />
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
                            <Image
                                className='inicio-style-img'
                                src={VerStockImg}
                                alt='REALIZAR VENTA'
                            />
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
                            <Image
                                className='inicio-style-img'
                                src={HistorialVenta}
                                alt='REALIZAR VENTA'
                            />
                            <span>HISTORIAL DE VENTAS</span>
                        </button>

                    </nav>

                </main>

            </div>
        </>
    )
}

export default InicioComponent;