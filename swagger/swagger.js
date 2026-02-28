const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KGL Groceries LTD – API",
      version: "2.0.0",
      description:
        "REST API for Karibu Groceries LTD wholesale produce management system. " +
        "Handles procurement, cash sales, credit sales, inventory, and user management.",
      contact: { name: "KGL IT Team", email: "it@kgl.co.ug" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // User
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "John Mugisha" },
            username: { type: "string", example: "john.mugisha" },
            role: { type: "string", enum: ["manager", "agent", "director"] },
            branch: { type: "string", enum: ["Maganjo", "Matugga"] },
            contact: { type: "string", example: "+256701234567" },
            active: { type: "boolean" },
          },
        },
        LoginBody: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "john.mugisha" },
            password: { type: "string", example: "MyPassword123" },
            role: {
              type: "string",
              description:
                "Optional. manager | agent | director – must match stored role if provided.",
              example: "manager",
            },
            branch: {
              type: "string",
              description:
                "Required for managers and sales agents. Must match the staff branch.",
              example: "Maganjo",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        // Procurement
        ProcurementBody: {
          type: "object",
          required: [
            "produceName",
            "produceType",
            "date",
            "time",
            "tonnage",
            "cost",
            "dealerName",
            "branch",
            "contact",
            "sellingPrice",
          ],
          properties: {
            produceName: { type: "string", example: "Maize" },
            produceType: { type: "string", example: "Cereal", minLength: 2 },
            date: { type: "string", format: "date", example: "2026-02-26" },
            time: { type: "string", example: "08:30" },
            tonnage: { type: "number", minimum: 100, example: 5000 },
            cost: { type: "number", minimum: 10000, example: 8000000 },
            dealerName: { type: "string", example: "Nile Farms Ltd" },
            branch: { type: "string", enum: ["Maganjo", "Matugga"] },
            contact: { type: "string", example: "+256711234567" },
            sellingPrice: { type: "number", example: 950 },
          },
        },
        // Cash Sale
        CashSaleBody: {
          type: "object",
          required: [
            "produceName",
            "tonnage",
            "amountPaid",
            "buyerName",
            "salesAgent",
            "date",
            "time",
          ],
          properties: {
            produceName: { type: "string", example: "Maize" },
            procurementId: {
              type: "string",
              description: "Optional – link to a procurement record",
            },
            tonnage: { type: "number", example: 200 },
            amountPaid: { type: "number", minimum: 10000, example: 190000 },
            buyerName: {
              type: "string",
              minLength: 2,
              example: "Kampala Millers",
            },
            salesAgent: {
              type: "string",
              minLength: 2,
              example: "Sarah Nabirye",
            },
            date: { type: "string", format: "date", example: "2026-02-26" },
            time: { type: "string", example: "10:00" },
          },
        },
        // Credit Sale
        CreditSaleBody: {
          type: "object",
          required: [
            "buyerName",
            "nin",
            "location",
            "contact",
            "amountDue",
            "salesAgent",
            "dueDate",
            "produceName",
            "produceType",
            "tonnage",
            "dispatchDate",
          ],
          properties: {
            buyerName: {
              type: "string",
              minLength: 2,
              example: "Masaka Wholesale",
            },
            nin: { type: "string", example: "CM0012345678ABCD" },
            location: { type: "string", minLength: 2, example: "Masaka Town" },
            contact: { type: "string", example: "+256751234567" },
            amountDue: { type: "number", minimum: 10000, example: 950000 },
            salesAgent: {
              type: "string",
              minLength: 2,
              example: "Sarah Nabirye",
            },
            dueDate: { type: "string", format: "date", example: "2026-03-26" },
            produceName: { type: "string", example: "Maize" },
            produceType: { type: "string", example: "Cereal" },
            tonnage: { type: "number", example: 1000 },
            dispatchDate: {
              type: "string",
              format: "date",
              example: "2026-02-26",
            },
          },
        },
        //Error
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation error" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // JSDoc annotations live in route files
};

module.exports = swaggerJsdoc(options);
