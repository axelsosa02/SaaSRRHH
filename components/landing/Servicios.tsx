import { ServiciosContent } from "@/types/landingSections";

interface ServiciosProps {
    content: ServiciosContent;
    colorBrand: string;
}

export default function ServicioSection({ content, colorBrand }: ServiciosProps) {

   return (
      <section id="servicios" className="py-16 px-4 md:px-8 bg-[#fdfbf7]">
         <div className="max-w-md mx-auto sm:max-w-3xl lg:max-w-6xl">

            {/* Encabezado */}
            <div className="mb-12 max-w-3xl mx-auto text-center md:mb-16">
               <h2 className="text-[#472825] text-3xl font-bold mb-6 md:text-4xl">
                  {content.title}
               </h2>
               {content.subtitle && (
                  <p className="text-base text-slate-600 leading-relaxed">
                     {content.subtitle}
                  </p>
               )}
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {content.items.map((item, index) => (
                  <a
                     key={index}
                     href={item.cta_url || '#'}
                     className="block rounded-2xl overflow-hidden relative group before:absolute before:inset-0 before:z-10 before:bg-black/10"
                  >
                     {/* Imagen de fondo */}
                     <div className="w-full aspect-[119/128]">
                        {item.image ? (
                           <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                           />
                        ) : (
                           /* Placeholder si no hay imagen */
                           <div className="w-full h-full bg-gradient-to-br from-[#c1a280]/30 to-[#472825]/20 flex items-center justify-center">
                              <span className="text-5xl text-[#c1a280]/40 font-bold select-none">
                                 {index + 1}
                              </span>
                           </div>
                        )}
                     </div>

                     {/* Panel de texto superpuesto */}
                     <div className="px-6 py-4 absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm z-10">
                        {item.cta_text && (
                           <span
                              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                              style={{ color: colorBrand }}
                           >
                              {item.cta_text}
                           </span>
                        )}
                        <h3 className="text-lg font-semibold text-[#472825] line-clamp-1">
                           {item.title}
                        </h3>

                        {/* Descripción que aparece al hover */}
                        <div className="h-0 overflow-hidden group-hover:h-[75px] group-hover:mt-3 transition-all duration-300">
                           <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                              {item.description}
                           </p>
                        </div>
                     </div>
                  </a>
               ))}
            </div>

         </div>
      </section>
   );
}