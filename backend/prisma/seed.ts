import "dotenv/config";
import { PrismaClient, Difficulty } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const problems = [
  {
    title: "Parking Lot",
    description:
      "Design a parking lot system that can manage vehicles, parking spots, tickets, and charges.",
    difficulty: Difficulty.EASY,
    requirements: [
      "The parking lot can have multiple floors.",
      "Each floor can have multiple parking spots.",
      "The system should support Bike, Car, and Truck.",
      "A vehicle should be assigned to an appropriate spot.",
      "A ticket should be generated when a vehicle enters.",
      "A parking spot should become available when the vehicle exits.",
      "The system should calculate parking charges.",
      "The design should allow adding new vehicle types and pricing rules.",
    ],
  },

  {
    title: "Vending Machine",
    description:
      "Design a vending machine that allows users to select products, insert money, and receive products and change.",
    difficulty: Difficulty.MEDIUM,
    requirements: [
      "The machine should contain multiple products.",
      "Each product should have a price and quantity.",
      "A user can select a product.",
      "The machine should accept different denominations.",
      "The machine should return change.",
      "The machine should handle insufficient money.",
      "The machine should handle out-of-stock products.",
      "The design should support adding new products.",
    ],
  },

  {
    title: "Elevator System",
    description:
      "Design an elevator system that manages multiple elevators, floor requests, and elevator movement.",
    difficulty: Difficulty.MEDIUM,
    requirements: [
      "The building can have multiple floors.",
      "The system can have multiple elevators.",
      "Users can request an elevator from a floor.",
      "Users can select a destination floor inside an elevator.",
      "The system should decide which elevator handles a request.",
      "The elevator should move between floors.",
      "The system should handle multiple requests.",
      "The design should allow changing the elevator selection strategy.",
    ],
  },
];

async function main() {
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: {
        title: problem.title,
      },
      update: {
        description: problem.description,
        difficulty: problem.difficulty,
        requirements: problem.requirements,
      },
      create: problem,
    });
  }

  console.log("Problems seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });