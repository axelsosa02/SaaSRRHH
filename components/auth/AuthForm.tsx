"use client"

import { ArrowLeft } from "lucide-react";
import RecoverPasswordForm from "./RecoverPasswordForm";
import SignInForm from "./SignInForm";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";

export interface AuthFormProps {
    setTypeSelected: Dispatch<SetStateAction<"sign-up" | "sign-in" | "recover-password">>;
}

interface AuthModalProps {
    type: 'sign-up' | 'sign-in' | 'recover-password'
}

const AuthForm = ({ type }: AuthModalProps) => {

    const [typeSelected, setTypeSelected] = useState<'sign-up' | 'sign-in' | 'recover-password'>(type);

    return (
        <section className="flex min-h-screen w-full bg-[#0a0a0a] text-white">
            {/* Left Column - Branding (Hidden on mobile) */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/10 bg-[#0a0a0a] p-12 lg:flex">
                
                {/* Top: Logo & Back Link */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/">
                        <img
                            src="/images/logoATS-v3.png"
                            alt="FlowATS Logo"
                            width={140}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-[#b6f300]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
                {/* Middle: Value Proposition */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight">
                        Transformá tu <br />
                        <span className="text-[#b6f300]">selección de talento</span>
                    </h1>
                    <p className="text-lg leading-relaxed text-white/60">
                        Gestioná candidatos, colaborá con tu equipo y cerrá búsquedas más rápido. Todo desde un único lugar.
                    </p>
                </div>
                {/* Bottom: Testimonial or Trust Badge */}
                <div className="relative z-10">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
                        <p className="mb-4 text-sm font-medium leading-relaxed text-white/80">
                            "Desde que implementamos FlowATS, redujimos a la mitad el tiempo de contratación y nuestro equipo está 100% alineado."
                        </p>
                    </div>
                </div>
            </div>
            {/* Right Column - Form */}
            <div className="relative flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:p-12">
                {/* Mobile Header (Only visible on small screens) */}
                <div className="absolute left-6 top-6 flex w-full items-center justify-between pr-12 lg:hidden">
                    <Link href="/">
                        <img
                            src="/images/logoATS-v3.png"
                            alt="FlowATS Logo"
                            width={110}
                            height={32}
                            className="object-contain"
                        />
                    </Link>
                </div>
                <div className="w-full max-w-md lg:max-w-xl mt-12 lg:mt-0">
                    <div className="p-8">
                        <div className="relative z-10">
                            {typeSelected === 'sign-in' && (<SignInForm setTypeSelected={setTypeSelected} />)}
                            {typeSelected === 'recover-password' && (<RecoverPasswordForm setTypeSelected={setTypeSelected} />)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AuthForm;