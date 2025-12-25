'use client'
import '../assets/css/sidebar-style.css'
import Image from 'next/image';
import homeImg from '../assets/img/home.png'
import cartImg from '../assets/img/cart.png'
import packageImg from '../assets/img/package.png'
import detailsImg from '../assets/img/file-detail.png'
import storeImg from '../assets/img/store-alt-2.png'
import { SidebarInterfaceProps } from '@/shared/types';

export const Sidebar = ({setOpenManagerInicio, setOpenManagerVenta, setOpenManagerVerStock, setOpenManagerHistorialDeVenta, setOpenManagerGestion} : SidebarInterfaceProps) =>{

    return (
        <>
            <div className='aside-content'>
                <nav className='nav-content'>

                    <button
                        onClick={()=>{
                            setOpenManagerInicio(true)
                            setOpenManagerVenta(false)
                            setOpenManagerVerStock(false)
                            setOpenManagerHistorialDeVenta(false)
                            setOpenManagerGestion(false)
                        }}>
                        <Image
                            className='button-img'
                            src={homeImg}
                            alt='INICIO'
                        />
                        <span>INICIO</span>
                    </button> <br />

                    <button
                        onClick={()=>{
                            setOpenManagerInicio(false)
                            setOpenManagerVenta(true)
                            setOpenManagerVerStock(false)
                            setOpenManagerHistorialDeVenta(false)
                            setOpenManagerGestion(false)
                        }}>
                        <Image
                            className='button-img'
                            src={cartImg}
                            alt='VENTA'
                        />
                        <span>VENTA</span>
                    </button> <br />

                    <button
                        onClick={()=>{
                            setOpenManagerInicio(false)
                            setOpenManagerVenta(false)
                            setOpenManagerVerStock(true)
                            setOpenManagerHistorialDeVenta(false)
                            setOpenManagerGestion(false)
                        }}>
                        <Image
                            className='button-img'
                            src={packageImg}
                            alt='VER STOCK'
                        />
                        <span>VER STOCK</span>
                    </button> <br />
                    
                    <button
                        onClick={()=>{
                            setOpenManagerInicio(false)
                            setOpenManagerVenta(false)
                            setOpenManagerVerStock(false)
                            setOpenManagerHistorialDeVenta(true)
                            setOpenManagerGestion(false)
                        }}>
                        <Image
                            className='button-img'
                            src={detailsImg}
                            alt='HISTORIAL DE VENTAS'
                        />
                        <span>HISTORIAL DE VENTAS</span>
                    </button> <br />

                    <button
                        onClick={()=>{
                            setOpenManagerInicio(false)
                            setOpenManagerVenta(false)
                            setOpenManagerVerStock(false)
                            setOpenManagerHistorialDeVenta(false)
                            setOpenManagerGestion(true)
                        }}>
                        <Image
                            className='button-img'
                            src={storeImg}
                            alt='GESTION'
                        />
                        <span>GESTION</span>
                    </button>
                    
                </nav>
                
            </div>
        </>
    )
}

export default Sidebar;