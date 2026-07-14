import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const products = [
  {
    name: "Cristal Incoloro Flotado",
    slug: "cristal-incoloro",
    category: "cristales",
    summary: "Cristal transparente de óptica pura para ventanas y mostradores.",
    description:
      "Vidrio flotado incoloro de primera selección. Transmite luz natural sin distorsión cromática. Disponible en espesores de 3 a 19 mm. Ideal para ventanas, mostradores, vitrinas y aplicaciones donde la claridad visual es prioridad.",
    pricePerM2: 480,
    thickness: "6 mm",
    finish: "Incoloro",
    features: "Óptica pura|Sin distorsión|3 a 19 mm|Primera selección",
    image: "/images/texture-frost.png",
    featured: true,
  },
  {
    name: "Cristal Bronce Antisol",
    slug: "cristal-bronce",
    category: "cristales",
    summary: "Vidrio de tono bronce que reduce trasmisión térmica y luminosa.",
    description:
      "Vidrio coloreado en masa tono bronce que filtra el sol y reduce la ganancia térmica hasta un 40%. Aporta privacidad sin sacrificar visibilidad. Excelente para fachadas con orientación poniente.",
    pricePerM2: 720,
    thickness: "8 mm",
    finish: "Bronce",
    features: "Antisol|Reduce calor -40%|Privacidad diurna|Color en masa",
    image: "/images/project-fachada.png",
    featured: false,
  },
  {
    name: "Espejo de Autor Púlido",
    slug: "espejo-autor",
    category: "espejos",
    summary: "Espejo de cobre envejecido con bordes pulidos a diamante.",
    description:
      "Espejo fabricado con plata de primera calidad y tratamiento anticorrosivo. Disponible en acabado incoloro, bronce, ahumado y cobre envejecido. Los bordes se pulen a diamante o biselado según diseño. Resiste hasta 15 años sin oxidación.",
    pricePerM2: 980,
    thickness: "6 mm",
    finish: "Cobre envejecido",
    features: "Plata 1ª calidad|Antioxidante 15 años|Bisuelo diamante|A medida",
    image: "/images/project-espejo.png",
    featured: true,
  },
  {
    name: "Espejo Iluminado LED",
    slug: "espejo-led",
    category: "espejos",
    summary: "Espejo con retroiluminación LED de temperatura regulable.",
    description:
      "Espejo con perímetro de LED de 3000K a 6000K regulable, anti-vaho mediante película calefactora. Incluye sensor de encendido por proximidad. Diseñado para baños y vestidores premium.",
    pricePerM2: 1850,
    thickness: "6 mm",
    finish: "Incoloro + LED",
    features: "LED regulable|Anti-vaho|Sensor proximidad|IP44",
    image: "/images/project-espejo.png",
    featured: false,
  },
  {
    name: "Vidrio Templado de Seguridad",
    slug: "vidrio-templado",
    category: "templado",
    summary: "Vidrio templado 5x más resistente, fragmentos seguros al romper.",
    description:
      "Vidrio templado térmicamente que resiste impactos hasta 5 veces más que el cristal común. Al fracturarse se desmenuza en pequeños fragmentos no cortantes. Obligatorio en puertas, mamparas y barandales según NOM-006.",
    pricePerM2: 1250,
    thickness: "10 mm",
    finish: "Incoloro",
    features: "5x resistente|Norma NOM-006|Fragmentos seguros|Resistente térmico",
    image: "/images/project-puerta.png",
    featured: true,
  },
  {
    name: "Mampara de Vidrio Frameless",
    slug: "mampara-frameless",
    category: "mamparas",
    summary: "Mampara de baño sin marco con herrajes de cobre macizo.",
    description:
      "Mampara de vidrio templado 8 mm sin perfiles verticales, abatible o corrediza. Herrajes de acero inoxidable con acabado cobre. Cierre magnético y burlete transparente. Instalación incluida en CDMX y zona metropolitana.",
    pricePerM2: 2400,
    thickness: "8 mm",
    finish: "Incoloro + cobre",
    features: "Sin marco|Herrajes cobre|8 mm templado|Instalación incluida",
    image: "/images/project-mampara.png",
    featured: true,
  },
  {
    name: "Mampara Fija Divisoria",
    slug: "mampara-divisoria",
    category: "mamparas",
    summary: "Divisor de spaces fijo con perfil minimalista de aluminio.",
    description:
      "Mampara fija de piso a techo con vidrio templado 12 mm y perfil U de aluminio anodizado. Ideal para separar áreas de trabajo, salas o vestidores. Aislamiento acústico de hasta 32 dB.",
    pricePerM2: 1950,
    thickness: "12 mm",
    finish: "Esmerilado",
    features: "Piso a techo|Aislamiento 32 dB|Perfil anodizado|12 mm",
    image: "/images/project-mampara.png",
    featured: false,
  },
  {
    name: "Barandal de Cristal Templado",
    slug: "barandal-cristal",
    category: "barandales",
    summary: "Barandal de vidrio con postes de cobre macizo tornillado.",
    description:
      "Barandal de seguridad con vidrio templado laminado 10+10 mm y postes de acero inoxidable acabado cobre. Sistema de fijación por punto o por canal. Cumple normativa de altura mínima 90 cm para escaleras y 100 cm para balcones.",
    pricePerM2: 2850,
    thickness: "10+10 mm laminado",
    finish: "Incoloro + cobre",
    features: "Laminado 10+10|Postes cobre|Altura normativa|Fijación a punto",
    image: "/images/project-barandal.png",
    featured: true,
  },
  {
    name: "Vitral de Autor Geométrico",
    slug: "vitral-autor",
    category: "vitrales",
    summary: "Vitral artesanal con emplomado tradicional y vidrio soplado.",
    description:
      "Vitral de autor elaborado con técnica de emplomado tradicional. Vidrio soplado a mano importado y vidrio mexicano de Tonala. Diseños geométricos, figurativos o abstractos. Cada pieza es única y firmada por el maestro vitralista.",
    pricePerM2: 6800,
    thickness: "3 mm soplado",
    finish: "Emplomado artesanal",
    features: "Vidrio soplado|Emplomado tradicional|Pieza única firmada|Tonala",
    image: "/images/project-vitral.png",
    featured: true,
  },
  {
    name: "Puerta Pivotante de Vidrio",
    slug: "puerta-pivotante",
    category: "puertas",
    summary: "Puerta pivotante de vidrio templado con cierre suave.",
    description:
      "Puerta pivotante de vidrio templado 12 mm con herrajes de acero inoxidable negro mate. Sistema de pivote oculto con cierre amortiguado. Incluye manija de cobre macizo. Para interiores residenciales y comerciales.",
    pricePerM2: 3200,
    thickness: "12 mm",
    finish: "Incoloro + negro mate",
    features: "Pivote oculto|Cierre amortiguado|Manija cobre|12 mm templado",
    image: "/images/project-puerta.png",
    featured: true,
  },
  {
    name: "Fachada de Aluminio y Vidrio",
    slug: "fachada-aluminio",
    category: "aluminio",
    summary: "Fachada cortina de vidrio con perfilería de aluminio térmico.",
    description:
      "Sistema de fachada cortina con perfilería de aluminio con ruptura de puente térmico. Vidrio doble cámara con control solar. Aislamiento térmico y acústico de alto rendimiento. Para edificios comerciales y residenciales premium.",
    pricePerM2: 4500,
    thickness: "6+12+6 doble cámara",
    finish: "Aluminio térmico",
    features: "Ruptura térmica|Doble cámara|Control solar|Alto rendimiento",
    image: "/images/project-fachada.png",
    featured: false,
  },
  {
    name: "Ventana de Aluminio Premium",
    slug: "ventana-aluminio",
    category: "aluminio",
    summary: "Ventana corrediza de aluminio con doble vidrio y cámara.",
    description:
      "Ventana corrediza de aluminio anodizado con ruptura de puente térmico y doble vidrio hermético. Rodamientos de acero sellados. Cierre multipunto. Aislamiento acústico y térmico certificado.",
    pricePerM2: 2100,
    thickness: "4+12+4 doble",
    finish: "Anodizado bronce",
    features: "Ruptura térmica|Doble vidrio|Cierre multipunto|Rodamientos sellados",
    image: "/images/project-fachada.png",
    featured: false,
  },
];

const projects = [
  {
    title: "Mampara Atelier Polanco",
    category: "mamparas",
    location: "Polanco, CDMX",
    year: "2024",
    image: "/images/project-mampara.png",
    description:
      "Mampara frameless de 2.4 m en baño principal con herrajes de cobre macizo y vidrio templado esmerilado.",
  },
  {
    title: "Barandal Residencial Lomas",
    category: "barandales",
    location: "Lomas de Chapultepec",
    year: "2024",
    image: "/images/project-barandal.png",
    description:
      "Barandal perimetral de 18 m lineales con vidrio laminado y postes de cobre tornillados a punto.",
  },
  {
    title: "Espejo Iluminado Roma Norte",
    category: "espejos",
    location: "Roma Norte, CDMX",
    year: "2023",
    image: "/images/project-espejo.png",
    description:
      "Espejo circular de 1.2 m con retroiluminación LED cobre y película anti-vaho en vestidor.",
  },
  {
    title: "Vitral Geométrico Coyoacán",
    category: "vitrales",
    location: "Coyoacán, CDMX",
    year: "2023",
    image: "/images/project-vitral.png",
    description:
      "Vitral de 3.2 m² con emplomado tradicional, vidrio soplado de Tonala y diseño geométrico de autor.",
  },
  {
    title: "Puerta Pivotante Condesa",
    category: "puertas",
    location: "Condesa, CDMX",
    year: "2024",
    image: "/images/project-puerta.png",
    description:
      "Puerta pivotante de 2.6 m en vidrio templado negro con manija de cobre y cierre amortiguado.",
  },
  {
    title: "Fachada Corporativa Santa Fe",
    category: "fachadas",
    location: "Santa Fe, CDMX",
    year: "2024",
    image: "/images/project-fachada.png",
    description:
      "Fachada cortina de 240 m² con aluminio de ruptura térmica y vidrio doble cámara de control solar.",
  },
];

const testimonials = [
  {
    name: "Mariana Fuentes",
    role: "Arquitecta de Interiores",
    location: "Polanco, CDMX",
    content:
      "El nivel de detalle en los cortes y la precisión milimétrica de la instalación superaron lo que pidió mi cliente. El cobre de los herrajes combina con todo el proyecto.",
    rating: 5,
  },
  {
    name: "Javier Montes de Oca",
    role: "Propietario · Loft Condesa",
    location: "Condesa, CDMX",
    content:
      "Cotización instantánea por la web, medición al día siguiente y entrega en 72 horas. La puerta pivotante es una pieza de diseño, no solo un cristal.",
    rating: 5,
  },
  {
    name: "Estudio mA Arquitectura",
    role: "Despacho de Arquitectura",
    location: "San Ángel, CDMX",
    content:
      "Trabajamos con PRISMA en tres proyectos seguidos. Responden igual de bien para una mampara residencial que para una fachada corporativa de 200 m².",
    rating: 5,
  },
  {
    name: "Daniela Ríos",
    role: "Diseñadora",
    location: "Roma Norte, CDMX",
    content:
      "El vitral de autor que encargué es una pieza única. El maestro vitralista me mostró el proceso completo en el taller. Resultado de colección.",
    rating: 5,
  },
  {
    name: "Grupo Inmobiliario Andares",
    role: "Desarrolladora",
    location: "Miguel Hidalgo, CDMX",
    content:
      "Cumplieron tiempos y normas NOM en un edificio de 12 niveles. La asesoría técnica previa a la instalación hizo la diferencia frente a otros proveedores.",
    rating: 5,
  },
];

async function main() {
  console.log("Seeding PRISMA database...");

  // Products
  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`✓ ${products.length} products`);

  // Projects
  await db.project.deleteMany({});
  for (const proj of projects) {
    await db.project.create({ data: proj });
  }
  console.log(`✓ ${projects.length} projects`);

  // Testimonials
  await db.testimonial.deleteMany({});
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log(`✓ ${testimonials.length} testimonials`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
