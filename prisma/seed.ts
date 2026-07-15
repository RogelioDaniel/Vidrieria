import { PrismaClient } from "@prisma/client";
import {
  atelierProducts,
  atelierProjects,
  atelierTestimonials,
} from "../src/data/atelier-content";

const db = new PrismaClient();

async function main() {
  console.log("Seeding PRISMA database...");

  for (const product of atelierProducts) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`✓ ${atelierProducts.length} products`);

  await db.project.deleteMany({});
  for (const project of atelierProjects) {
    await db.project.create({ data: project });
  }
  console.log(`✓ ${atelierProjects.length} projects`);

  await db.testimonial.deleteMany({});
  for (const testimonial of atelierTestimonials) {
    await db.testimonial.create({ data: testimonial });
  }
  console.log(`✓ ${atelierTestimonials.length} testimonials`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
