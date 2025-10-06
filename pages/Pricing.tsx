import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Head from "next/head";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Empieza a escuchar y explorar música IA sin costo.",
      features: [
        "Reproducción limitada con anuncios",
        "Acceso básico a artistas",
        "Listas aleatorias por IA",
      ],
      button: { text: "Comenzar gratis", link: "/signup" },
    },
    {
      name: "Premium Listener",
      price: "$6.99 / mes",
      description: "Disfruta música sin anuncios y recomendaciones personalizadas.",
      features: [
        "Sin anuncios",
        "Escucha ilimitada",
        "Listas personalizadas por IA",
        "Modo offline (próximamente)",
      ],
      button: { text: "Suscribirme", link: "/api/checkout?plan=premium-listener" },
    },
    {
      name: "Artist Pro",
      price: "$9.99 / mes",
      description: "Publica, promociona y crece con herramientas para artistas.",
      features: [
        "Subidas ilimitadas",
        "Estadísticas avanzadas",
        "Promoción con IA",
        "Soporte prioritario",
      ],
      button: { text: "Suscribirme", link: "/api/checkout?plan=artist-pro" },
    },
    {
      name: "Artist AI+",
      price: "$14.99 / mes",
      description: "IA al servicio de tu creatividad musical.",
      features: [
        "Generación de música por IA",
        "Mastering automático",
        "Destacados en el feed IA",
        "Acceso anticipado a nuevas funciones",
      ],
      button: { text: "Suscribirme", link: "/api/checkout?plan=artist-ai-plus" },
    },
  ];

  return (
    <>
      <Head>
        <title>Planes y precios - StableMusic SP AI</title>
      </Head>

      <main className="p-10 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
        <h1 className="text-4xl font-extrabold text-center mb-8">Elige tu plan</h1>
        <p className="text-center mb-12 text-gray-300">
          Escucha, crea y comparte con el poder de la Inteligencia Artificial.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <CardHeader>
                <CardTitle className="text-2xl text-purple-400">
                  {plan.name}
                </CardTitle>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
                <p className="text-gray-400 mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="text-green-400 w-5 h-5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => (window.location.href = plan.button.link)}
                >
                  {plan.button.text}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}