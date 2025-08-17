'use client'
import { useState } from "react";
import InicioModals from "./features/inicio/modals/InicioModals";
import Sidebar from "./shared/sidebar/components/Sidebar";
import VentaModals from "./features/venta/modals/VentaModals";
import VerStockModals from "./features/ver-stock/modals/VerStockModals";
import GestionModals from "./features/gestion/modals/GestionModals";
import HistorialDeVentaModals from "./features/historial-de-ventas/modals/HistorialDeVentasModals";


export default function Home() {

  //-------------------Hooks de Modals / Sidebar-----------------------//
  const [OpenManagerInicio, setOpenManagerInicio] = useState(true)
  const [OpenManagerVenta, setOpenManagerVenta] = useState(false)
  const [OpenManagerVerStock, setOpenManagerVerStock] = useState(false)
  const [OpenManagerHistorialDeVenta, setOpenManagerHistorialDeVenta] = useState(false)
  const [OpenManagerGestion, setOpenManagerGestion] = useState(false)
  //-------------------------------------------------------------------//


  return (
    <>
      <div className="grid-container">

          {/*----------------Carga del Sidebar----------------*/}
          <aside className="aside">
            <Sidebar
              setOpenManagerInicio={setOpenManagerInicio}
              setOpenManagerVenta={setOpenManagerVenta}
              setOpenManagerVerStock={setOpenManagerVerStock}
              setOpenManagerHistorialDeVenta={setOpenManagerHistorialDeVenta}
              setOpenManagerGestion={setOpenManagerGestion}
            />
          </aside>
          {/*--------------------------------------------------*/}

          <header className="header">
            header
          </header>

          {/*-----------------Carga de Modals------------------*/}
          <main className="main">

            <InicioModals 
              OpenManager={OpenManagerInicio} 
              setOpenManager={setOpenManagerInicio}
              setOpenManagerInicio={setOpenManagerInicio}
              setOpenManagerVenta={setOpenManagerVenta}
              setOpenManagerVerStock={setOpenManagerVerStock}
              setOpenManagerHistorialDeVenta={setOpenManagerHistorialDeVenta}
              setOpenManagerGestion={setOpenManagerGestion}
            />

            <VentaModals
              OpenManager={OpenManagerVenta}
              setOpenManager={setOpenManagerVenta}
            />

            <VerStockModals
              OpenManager={OpenManagerVerStock}
              setOpenManager={setOpenManagerVerStock}
            />

            <HistorialDeVentaModals
              OpenManager={OpenManagerHistorialDeVenta}
              setOpenManager={setOpenManagerHistorialDeVenta} 
            />

            <GestionModals
              OpenManager={OpenManagerGestion}
              setOpenManager={setOpenManagerGestion}
            />

          </main>
          {/*--------------------------------------------------*/}

          <footer className="footer">
            footer
          </footer>


      </div>


    </>
  );
}
