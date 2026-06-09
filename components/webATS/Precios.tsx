import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: 24.99,
    description: "Para consultoras que están arrancando.",
    features: [
      "Hasta 100 candidatos activos",
      "Hasta 3 puestos simultáneos",
      "1 usuario del panel",
      "Landing básica (formulario)",
      "Integración MercadoPago",
      "Correos automáticos",
      "Soporte por email",
    ],
  },
  {
    name: "Pro",
    price: 44.99,
    description: "Para consultoras en crecimiento.",
    highlighted: true,
    badge: "Más popular",
    features: [
      "Hasta 500 candidatos activos",
      "Hasta 10 puestos simultáneos",
      "Hasta 3 usuarios del panel",
      "Landing personalizada completa",
      "Todo lo del Starter",
      "Correos masivos",
      "Soporte prioritario por WhatsApp",
    ],
  },
  {
    name: "Agency",
    price: 59.00,
    description: "Para consultoras grandes o agencias.",
    features: [
      "Candidatos ilimitados",
      "Puestos ilimitados",
      "Usuarios ilimitados",
      "Todo lo del Pro",
      "Onboarding personalizado",
      "Soporte dedicado",
    ],
  },
];

export default function Precios() {
  return (
    <section
      id="precios"
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-32"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6f300]/[0.025] blur-[200px]" />
        <div className="absolute top-0 right-0 h-[300px] w-[400px] rounded-full bg-[#b6f300]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        {/* Heading */}
        <div className="mb-14 text-center md:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Planes{" "}
            <span className="text-[#b6f300]">simples</span>, sin sorpresas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/50 md:text-lg">
            Elegí el plan que se adapte a tu equipo. Podés cambiar o cancelar en
            cualquier momento.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl md:p-8 ${
                plan.highlighted
                  ? "border-[#b6f300]/50 bg-[#b6f300]/[0.04] hover:border-[#b6f300] hover:bg-[#b6f300]/[0.07]"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-[#b6f300]/30 hover:bg-white/[0.05]"
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b6f300] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Glow on highlighted */}
              {plan.highlighted && (
                <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-[#b6f300]/[0.05] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              )}

              {/* Plan name & description */}
              <div className="relative mb-6">
                <h3
                  className={`text-xl font-bold md:text-2xl ${
                    plan.highlighted ? "text-[#b6f300]" : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-white/40">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="relative mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-white/40">USD</span>
                  <span
                    className={`text-5xl font-bold tracking-tight md:text-6xl ${
                      plan.highlighted ? "text-[#b6f300]" : "text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/40">/mes</span>
                </div>
              </div>

              {/* Features */}
              <ul className="relative mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-[#b6f300]" : "text-[#b6f300]/60"
                      }`}
                    />
                    <span className="text-sm text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="relative">
                {plan.highlighted ? (
                  <Button
                    variant="flowATS"
                    className="group/btn flex w-full items-center justify-center gap-2"
                  >
                    Comenzar ahora
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                ) : (
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-[#b6f300]/40 hover:bg-white/[0.08]">
                    Elegir plan
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-white/30">
          Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de
          crédito.
        </p>
      </div>
    </section>
  );
}
