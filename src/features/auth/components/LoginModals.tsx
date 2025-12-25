
import '@/assets/styles/login-style.css'
import { useState } from "react";
import { PasswordInterface } from "@/shared/types";
import { LoginInterfaceProps } from '@/shared/types';

const InitialStatePassword : PasswordInterface = {
    Password : ""
}


export const LoginModals = ({setOpenManagerLogin } : LoginInterfaceProps) => {
    
    const [Password, setPassword] = useState(InitialStatePassword)

    const handleObtenerPassword = (name:string, value:string) => {
        setPassword(
            {...Password,[name]:value}
        )
    }

    const handleVerificarPassword = () => {
        if (Password.Password === '123'){
            setOpenManagerLogin(false);
        }
    }

    return (
        <>
            <main className="main-login">

                <div>
                    
                    <h1>INICIO DE SESION</h1> <br />
                    <h2>INGRESE LA CONTRASEÑA PARA ACCEDER AL PANEL</h2>

                </div>
                
                <form>

                    <input 
                        type="text"
                        name="Password"
                        placeholder="ingrese la contraseña"
                        onChange={(e)=>handleObtenerPassword(e.currentTarget.name,e.currentTarget.value)}
                    /> <br />

                    <button
                        onClick={(e)=>{
                            e.preventDefault()
                            handleVerificarPassword()
                        }}>
                        <span>ACCEDER</span>
                    </button>
                    
                </form>

            </main>
        </>
    )

}

export default LoginModals;