import '../assets/css/ingresar-cdb-style.css'

export const IngresarCBD = () => {

    return (

        <>
            <form className='ingresar-cdb'>
                <div className='input-box'>
                    <input 
                        type="text"
                        required spellCheck="false"
                    />
                    <label>CODIGO DE BARRAS</label>
                </div>
            </form>
        </>

    )
}

export default IngresarCBD