import { doc,collection, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc, QuerySnapshot, serverTimestamp, orderBy, writeBatch, FieldValue, deleteField, } from "firebase/firestore";
import { db } from "./Conexion"
import { ProductoInterface } from "../shared/interfaces/producto/ProductoInterface";
import { IDDocumentosInterface } from "../shared/interfaces/id-documentos/IDDocumentosInterface";
import { RegistrosYMovimientosInterface } from "../shared/interfaces/registros-y-movimientos/RegistrosYMovimientosInterface";
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


export interface ProductoConIDInterface {
    id: string;
    NombreProducto: string;
    CodigoDeBarras: string;
    Precio: string;
    Stock: string;
}

export const obtenerProductosPromiseUpdate = async (): Promise<ProductoConIDInterface[]> => {
    let listado: ProductoConIDInterface[] = [];

    const querySnapshot = await getDocs(collection(db, "Productos"));

    querySnapshot.forEach((doc) => {
        listado.push({
            id: doc.id,
            NombreProducto: doc.data().NombreProducto,
            CodigoDeBarras: doc.data().CodigoDeBarras,
            Precio: doc.data().Precio,
            Stock: doc.data().Stock
        });
    });

    return listado;
};


export const modificarProductoPromise = async (id: string, producto: ProductoConIDInterface) => {
    const ref = doc(db, "Productos", id);
    await updateDoc(ref, {
        NombreProducto: producto.NombreProducto,
        CodigoDeBarras: producto.CodigoDeBarras,
        Precio: producto.Precio,
        Stock: producto.Stock
    });
};

export const eliminarProductoPromise = async (id: string) => {
    await deleteDoc(doc(db, "Productos", id));
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
export const registrarVentaYActualizarStockPromise = async ({ ProductosVenta, TotalGeneral }: PropsRealizarVenta) => {
    try {
        const ventaRef = await addDoc(collection(db, "Ventas"), {
            ProductosVenta,
            TotalGeneral,
            fechaHora: serverTimestamp(), // ✅ Marca de tiempo única para ordenar
        });

        console.log("✅ Venta ID:", ventaRef.id);

        for (const item of ProductosVenta) {
            const q = query(
                collection(db, "Productos"),
                where("CodigoDeBarras", "==", item.CodigoDeBarras)
            );

            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (docSnap) => {
                const stockActual = docSnap.data().Stock;
                const stockNuevo = Number(stockActual) - Number(item.cantidad);

                await updateDoc(doc(db, "Productos", docSnap.id), {
                    Stock: stockNuevo < 0 ? 0 : stockNuevo,
                });

                console.log(`📉 Stock actualizado: ${item.NombreProducto}`);
            });
        }

        return true;
    } catch (error) {
        console.error("❌ Error al registrar venta:", error);
        return false;
    }
};


export const obtenerVentasPromise = async () => {
    const q = query(
        collection(db, "Ventas"),
        orderBy("fechaHora", "desc") // ✅ Siempre más reciente primero
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaHora: doc.data().fechaHora?.toDate().toLocaleString("es-CL") ?? "Sin fecha",
    }));
};

