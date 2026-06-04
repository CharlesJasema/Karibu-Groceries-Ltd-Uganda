require("dotenv").config();
const mongoose = require("mongoose");
const Inventory = require("./models/inventory");
const Sale = require("./models/sale");
const CreditSale = require("./models/creditSale");
const Payment = require("./models/payment");
const Procurement = require("./models/procurement");

// Demo data for testing and presentation
const demoInventory = [
  {
    name: "Rice - 50kg",
    description: "Premium quality rice",
    category: "Grains",
    quantity: 150,
    unit: "bags",
    costPrice: 180000,
    sellingPrice: 220000,
    reorderLevel: 20,
    supplier: "Uganda Grain Suppliers",
    branch: "Maganjo",
    expiryDate: new Date("2025-12-31"),
    status: "active"
  },
  {
    name: "Cooking Oil - 20L",
    description: "Pure sunflower cooking oil",
    category: "Oils & Fats",
    quantity: 80,
    unit: "jerrycans",
    costPrice: 95000,
    sellingPrice: 115000,
    reorderLevel: 15,
    supplier: "Golden Oil Ltd",
    branch: "Matugga",
    expiryDate: new Date("2025-08-15"),
    status: "active"
  },
  {
    name: "Sugar - 1kg",
    description: "White crystal sugar",
    category: "Sweeteners",
    quantity: 200,
    unit: "packets",
    costPrice: 4500,
    sellingPrice: 5500,
    reorderLevel: 50,
    supplier: "Sugar Corporation",
    branch: "Maganjo",
    expiryDate: new Date("2026-03-20"),
    status: "active"
  }
];

const demoSales = [
  {
    customer: "John Mukasa",
    customerPhone: "+256701234567",
    items: [
      {
        name: "Rice - 50kg",
        quantity: 2,
        unitPrice: 220000,
        total: 440000
      }
    ],
    totalAmount: 440000,
    paymentMethod: "cash",
    branch: "Maganjo",
    recordedBy: "agent",
    saleDate: new Date()
  }
];

const demoCreditSales = [
  {
    customer: "Mary Nakato",
    customerPhone: "+256702345678",
    customerAddress: "Kampala, Uganda",
    items: [
      {
        name: "Cooking Oil - 20L",
        quantity: 1,
        unitPrice: 115000,
        total: 115000
      }
    ],
    totalAmount: 115000,
    amountPaid: 50000,
    balance: 65000,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "pending",
    branch: "Matugga",
    recordedBy: "agent"
  }
];

async function seedDemoData() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected for demo data seeding");

    // Clear existing demo data
    console.log("Clearing existing demo data...");
    await Inventory.deleteMany({ name: { $in: demoInventory.map(item => item.name) } });
    await Sale.deleteMany({ customer: { $in: demoSales.map(sale => sale.customer) } });
    await CreditSale.deleteMany({ customer: { $in: demoCreditSales.map(sale => sale.customer) } });

    // Seed inventory
    console.log("Seeding inventory...");
    for (const item of demoInventory) {
      const inventory = await Inventory.create(item);
      console.log(`✅ Created inventory: ${inventory.name}`);
    }

    // Seed sales
    console.log("Seeding cash sales...");
    for (const sale of demoSales) {
      const newSale = await Sale.create(sale);
      console.log(`✅ Created sale: ${newSale.customer} - UGX ${newSale.totalAmount}`);
    }

    // Seed credit sales
    console.log("Seeding credit sales...");
    for (const creditSale of demoCreditSales) {
      const newCreditSale = await CreditSale.create(creditSale);
      console.log(`✅ Created credit sale: ${newCreditSale.customer} - UGX ${newCreditSale.totalAmount}`);
    }

    console.log("\n🎉 Demo data seeded successfully!");
    console.log("\nDemo data includes:");
    console.log(`- ${demoInventory.length} inventory items`);
    console.log(`- ${demoSales.length} cash sales`);
    console.log(`- ${demoCreditSales.length} credit sales`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding demo data:", error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData };