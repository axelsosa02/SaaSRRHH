import ComoFunciona from "@/components/webATS/ComoFunciona";
import Contacto from "@/components/webATS/Contacto";
import FAQ from "@/components/webATS/FAQ";
import Footer from "@/components/webATS/Footer";
import Funcionalidades from "@/components/webATS/Funcionalidades";
import Hero from "@/components/webATS/Hero";
import Navbar from "@/components/webATS/Navbar";
import Precios from "@/components/webATS/Precios";
import Problematica from "@/components/webATS/Problematica";
import UsarFlowATS from "@/components/webATS/UsarFlowATS";


export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans dark:bg-black">
      <Navbar />
      <Hero />
      <Problematica />
      <UsarFlowATS />
      <ComoFunciona />
      <Funcionalidades />
      <Precios />
      <FAQ />
      <Contacto />
      <Footer />
    </div>
  );
}
