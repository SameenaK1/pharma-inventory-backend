const db = require("../database");
const BillingItem = require("./billingItem");

// Table: pharma.billing_invoice — the invoice header
class BillingInvoice {
  static async ensureTableExists(client = db) {
    await client.query("CREATE SCHEMA IF NOT EXISTS pharma;");
    await client.query("CREATE SEQUENCE IF NOT EXISTS pharma.billing_invoice_seq START 1;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS pharma.billing_invoice (
        invoice_number VARCHAR(50) PRIMARY KEY DEFAULT (
          'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pharma.billing_invoice_seq')::TEXT, 5, '0')
        ),
        invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
        doctor_name VARCHAR(150),
        payment_type VARCHAR(50) NOT NULL DEFAULT 'Cash',
        customer_name VARCHAR(150),
        phone_number VARCHAR(15),
        patient_age INT,
        patient_gender VARCHAR(20),
        address TEXT,
        gstin VARCHAR(15),
        tax_breakdown JSONB DEFAULT '[]'::jsonb,
        total_quantity INT NOT NULL DEFAULT 1,
        gross_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        discount_amount DECIMAL(12, 2) DEFAULT 0.00,
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        flat_discount DECIMAL(12, 2) DEFAULT 0.00,
        final_payable DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        created_by VARCHAR(150),
        updated_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await BillingInvoice.ensureUpdatedAtTrigger();
  }

  // Keeps updated_at in sync whenever a row is modified without an explicit UPDATE statement setting it.
  static async ensureUpdatedAtTrigger(client = db) {
    await client.query(`
      CREATE OR REPLACE FUNCTION pharma.set_billing_invoice_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS trg_billing_invoice_updated_at ON pharma.billing_invoice;`);
    await client.query(`
      CREATE TRIGGER trg_billing_invoice_updated_at
      BEFORE UPDATE ON pharma.billing_invoice
      FOR EACH ROW
      EXECUTE FUNCTION pharma.set_billing_invoice_updated_at();
    `);
  }

  static async ensureTablesExist() {
    await BillingInvoice.ensureTableExists();
    await BillingItem.ensureTableExists();
  }

  static async create(client, invoice) {
    const query = `
      INSERT INTO pharma.billing_invoice (
        doctor_name, payment_type, customer_name, phone_number, patient_age, patient_gender,
        address, gstin, tax_breakdown, total_quantity, gross_amount, discount_amount,
        subtotal, flat_discount, final_payable, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16
      )
      RETURNING *;
    `;

    const values = [
      invoice.doctorName || null,
      invoice.paymentType || "Cash",
      invoice.customerName || null,
      invoice.phoneNumber || null,
      invoice.patientAge ?? null,
      invoice.patientGender || null,
      invoice.address || null,
      invoice.gstin || null,
      JSON.stringify(invoice.taxBreakdown || []),
      invoice.totalQuantity,
      invoice.grossAmount,
      invoice.discountAmount ?? 0,
      invoice.subtotal,
      invoice.flatDiscount ?? 0,
      invoice.finalPayable,
      invoice.createdBy || null,
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async createInvoiceWithItems(invoiceData, items) {
    await BillingInvoice.ensureTablesExist();

    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const invoice = await BillingInvoice.create(client, invoiceData);
      const savedItems = await BillingItem.bulkCreate(client, invoice.invoice_number, items);

      await client.query("COMMIT");
      return { invoice, items: savedItems };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async findByInvoiceNumber(invoiceNumber) {
    const result = await db.query(`SELECT * FROM pharma.billing_invoice WHERE invoice_number = $1;`, [invoiceNumber]);
    return result.rows[0] || null;
  }

  static async getInvoiceByNumber(invoiceNumber) {
    await BillingInvoice.ensureTablesExist();
    const invoice = await BillingInvoice.findByInvoiceNumber(invoiceNumber);
    if (!invoice) return null;

    const items = await BillingItem.findByInvoiceNumber(invoiceNumber);
    return { invoice, items };
  }

  static async list(page = 1, limit = 50) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [rowsResult, countResult] = await Promise.all([
      db.query(`SELECT * FROM pharma.billing_invoice ORDER BY created_at DESC LIMIT $1 OFFSET $2;`, [safeLimit, offset]),
      db.query(`SELECT COUNT(*)::int AS total FROM pharma.billing_invoice;`),
    ]);

    return {
      data: rowsResult.rows,
      pagination: { page: safePage, limit: safeLimit, total: countResult.rows[0].total },
    };
  }

  static async listInvoices(page, limit) {
    await BillingInvoice.ensureTablesExist();
    return BillingInvoice.list(page, limit);
  }
}

module.exports = BillingInvoice;
