
import '@/assets/styles/login-style.css'
import { useState } from "react";
import { PasswordInterface } from "@/shared/types";
import { LoginInterfaceProps } from '@/shared/types';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const InitialStatePassword : PasswordInterface = {
    Password : ""
}


export const LoginModals = ({setOpenManagerLogin } : LoginInterfaceProps) => {
    
    const [Password, setPassword] = useState(InitialStatePassword)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(false)

    const handleObtenerPassword = (name:string, value:string) => {
        setError(false)
        setPassword(
            {...Password,[name]:value}
        )
    }

    const handleVerificarPassword = () => {
        if (Password.Password === '123'){
            setOpenManagerLogin(false);
        } else {
            setError(true)
        }
    }

    return (
        <main className="main-login bg-gray-50/95 backdrop-blur-md shadow-2xl border border-gray-200 p-12 rounded-3xl max-w-5xl w-full mx-auto transition-all duration-300">
            <div className="flex flex-col items-center mb-10">
                <div className="bg-blue-900 p-5 rounded-full shadow-xl mb-6">
                    <ShieldCheck className="text-white h-10 w-10" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">INICIO DE SESIÓN</h1>
                <p className="text-base text-gray-500 mt-3 text-center">INGRESE LA CONTRASEÑA PARA ACCEDER AL PANEL DE CONTROL</p>
            </div>
            
            <form className="w-full space-y-8 mt-40" onSubmit={(e) => { e.preventDefault(); handleVerificarPassword(); }}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-900 text-gray-400">
                        <Lock size={22} />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"}
                        name="Password"
                        placeholder="Contraseña de acceso"
                        className={`w-full bg-white border ${error ? 'border-red-600 bg-red-50 text-red-700 placeholder-red-400 focus:ring-red-300 ring-2 ring-red-200' : 'border-gray-300 focus:border-blue-900 focus:ring-blue-100'} rounded-xl py-4 pl-12 pr-12 text-lg outline-none transition-all duration-200 shadow-sm focus:ring-4`}
                        onChange={(e)=>handleObtenerPassword(e.currentTarget.name,e.currentTarget.value)}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-900 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full bg-blue-900 hover:bg-blue-950 active:bg-black text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        <span className="flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
                            INGRESAR AL SISTEMA
                        </span>
                    </button>
                </div>
                
                <div className="pt-6 text-center border-t border-gray-100">
                    <p className="text-base font-semibold text-gray-500">Panel de control Minimarket Los Hermanos Hortiz</p>
                </div>
            </form>
        </main>
    )
}

export default LoginModals;