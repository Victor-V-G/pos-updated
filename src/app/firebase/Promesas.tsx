import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc, QuerySnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./Conexion"
import { ProductoInterface } from "../shared/interfaces/producto/ProductoInterface";
import { IDDocumentosInterface } from "../shared/interfaces/id-documentos/IDDocumentosInterface";
import { RegistrosYMovimientosInterface } from "../shared/interfaces/registros-y-movimientos/RegistrosYMovimientosInterface";
import { PropsProductosVenta } from "../shared/interfaces/ingresar-cdb/PropsProductosVenta";
import { PropsRealizarVenta } from "../shared/interfaces/ingresar-cdb/PropsRealizarVenta";


export const registrarProductoPromise = async(productoGet : ProductoInterface) => {
    const docRef = await addDoc(collection(db, "Productos"), productoGet);
    console.log("Producto registrado con ID: ", docRef.id);
}


export const obtenerProductosPromise = async () => {
    let listadoObtenidoGet : ProductoInterface[] = []
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            let productoGet : ProductoInterface = {
                    NombreProducto : doc.data().NombreProducto,
                    CodigoDeBarras : doc.data().CodigoDeBarras,
                    Precio : doc.data().Precio,
                    Stock : doc.data().Stock
            }
        listadoObtenidoGet.push(productoGet);
        console.log("PRODUCTO RECUPERADO");
    });
    return listadoObtenidoGet;
}


export const obtenerIDProductosPromise = async () => {
    let idsDocumentosGet : IDDocumentosInterface[] = []
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            let idDocumentoGet : IDDocumentosInterface = {
                IDDocumento : doc.id
            }
        idsDocumentosGet.push(idDocumentoGet);
        console.log("ID DEL DOCUMENTO RECUPERADO: ", doc.id)
        });
    return idsDocumentosGet;
}


export const modificarProductoPromise = async (idGet : IDDocumentosInterface, productoModificadoGet : ProductoInterface) => {
    const docRef = doc(db, "Productos", idGet.IDDocumento);
        await updateDoc(docRef, {
            NombreProducto : productoModificadoGet.NombreProducto,
            CodigoDeBarras : productoModificadoGet.CodigoDeBarras,
            Precio : productoModificadoGet.Precio,
            Stock : productoModificadoGet.Stock
        });
    console.log("PRODUCTO MODIFICADO CON ID: ", idGet.IDDocumento);
}


export const eliminarProductoPromise = async (idGet : IDDocumentosInterface) => {
    await deleteDoc(doc(db, "Productos", idGet.IDDocumento));
    console.log("PRODUCTO ELIMINADO CON ID: ", idGet.IDDocumento);
}


/*----------------------------------SEARCH COMPONENTS--------------------------------------*/

export const obtenerIDProductoSearchModificarPromise = async (campo : string, valor : string) => {
    const idRecuperadaDocumentosGet : IDDocumentosInterface[] = []
    const DatosAPreguntar = query(collection(db, "Productos"), where(campo, "==", valor));
    const querySnapshot = await getDocs(DatosAPreguntar);
    
    querySnapshot.forEach((doc) => {
        const idDocumentoGet : IDDocumentosInterface = {
            IDDocumento : doc.id
        };
        idRecuperadaDocumentosGet.push(idDocumentoGet);
        console.log("ID DEL DOCUMENTO RECUPERADO MEDIANTE CODIGO DE BARRAS")        
    });
    return idRecuperadaDocumentosGet;
}


export const searchObtenerProductoPorIdPromise = async (idGet: IDDocumentosInterface) => {
    let listadoObtenidoGet: ProductoInterface[] = [];

    const docRef = doc(db, "Productos", idGet.IDDocumento);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let productoGet: ProductoInterface = {
            NombreProducto: docSnap.data().NombreProducto,
            CodigoDeBarras: docSnap.data().CodigoDeBarras,
            Precio: docSnap.data().Precio,
            Stock: docSnap.data().Stock
        };
        listadoObtenidoGet.push(productoGet);
        console.log("PRODUCTO RECUPERADO MEDIANTE ID");
    } else {
        console.log("NO SE ENCONTRÓ EL PRODUCTO CON ESE ID");
    }

    return listadoObtenidoGet;
};


export const ObtenerIDProductoSearchEliminarPromise = async (campo : string, valor : string) => {
    const idRecuperadaDocumentosGet : IDDocumentosInterface[] = []
    const DatosAPreguntar = query(collection(db, "Productos"), where (campo, "==", valor));
    const querySnapshot = await getDocs(DatosAPreguntar);

    querySnapshot.forEach((doc) => {
        const idDocumentoGet : IDDocumentosInterface = {
            IDDocumento : doc.id
        };
        idRecuperadaDocumentosGet.push(idDocumentoGet);
        console.log("ID DEL DOCUMENTO PARA ELIMINAR RECUPERADO MEDIANTE CODIGO DE BARRAS")  
    })
    return idRecuperadaDocumentosGet;
}

/*-------------------------------------------------------------------------------------------*/


/*-------------------------------REGISTROS Y MOVIMIENTOS-------------------------------------*/
export const registrarMovimientosPromise = async(accion : string , cambios : string) => {
    await addDoc(collection(db, "Movimientos"), {
        accion,
        cambios,
        fechaHora : serverTimestamp()
    });
};


export const obtenerMovimientosPromise = async () => {
    let listadoObtenidoMovimientosGet : RegistrosYMovimientosInterface[] = []
        const querySnapshot = await getDocs(collection(db, "Movimientos"));
        querySnapshot.forEach((doc) => {
            let movimientosGet : RegistrosYMovimientosInterface = {
                    accion : doc.data().accion,
                    cambios : doc.data().cambios,
                    fechaHora : doc.data().fechaHora ? doc.data().fechaHora.toDate().toLocaleString() : "Sin fecha"
            }
        listadoObtenidoMovimientosGet.push(movimientosGet);
        console.log("MOVIMIENTOS RECUPERADOS");
    });
    return listadoObtenidoMovimientosGet;
}
/*-------------------------------------------------------------------------------------------*/


/*-------------------------------VENTA Y HISTORIAL------------------------------------*/
export const registrarVentaPromise = async({ProductosVenta, TotalGeneral} : PropsRealizarVenta) => {
    const docRef = await  addDoc(collection(db, "Ventas"), {ProductosVenta, TotalGeneral});
    console.log("Venta registrada con ID: ", docRef.id);
}
