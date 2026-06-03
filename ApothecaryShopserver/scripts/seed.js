const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import models
const User = require('../models/user');
const Product = require('../models/Product');
const Supplier = require('../models/supplier');
const PurchaseOrder = require('../models/purchaseOrder');
const PurchaseReceipt = require('../models/purchaseReceipt');
const Distribution = require('../models/distribution');
const StockMovement = require('../models/StockMovement');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aether-rx';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Database connection established.');

    // 1. Clean up existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await PurchaseReceipt.deleteMany({});
    await Distribution.deleteMany({});
    await StockMovement.deleteMany({});
    console.log('Database cleared.');

    // 2. Seed Users
    console.log('Seeding users for each system role...');
    const usersData = [
      {
        name: 'Chief Administrator',
        email: 'admin@apothecary.com',
        password: 'Password123!',
        role: 'admin'
      },
      {
        name: 'Jane Inventory Manager',
        email: 'manager@apothecary.com',
        password: 'Password123!',
        role: 'inventory_manager'
      },
      {
        name: 'Peter Procurement Staff',
        email: 'procurement@apothecary.com',
        password: 'Password123!',
        role: 'procurement_staff'
      },
      {
        name: 'David Distribution Staff',
        email: 'distribution@apothecary.com',
        password: 'Password123!',
        role: 'distribution_staff'
      },
      {
        name: 'Sam Staff',
        email: 'staff@apothecary.com',
        password: 'Password123!',
        role: 'staff'
      }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      console.log(`User created: ${user.name} (${user.role})`);
      createdUsers.push(user);
    }

    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.role] = u._id;
    });

    // 3. Seed Products
    console.log('Seeding products/medicines...');
    const productsData = [
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Analgesics',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'BT-PAR-001',
        expiryDate: new Date('2028-12-31'),
        stockQuantity: 1500,
        unitPrice: 1.5,
        reorderLevel: 200,
        description: 'Common pain reliever and fever reducer.'
      },
      {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        manufacturer: 'Reddy\'s Laboratories',
        batchNumber: 'BT-AMO-002',
        expiryDate: new Date('2027-06-30'),
        stockQuantity: 80, // Low stock, reorder level is 150
        unitPrice: 3.2,
        reorderLevel: 150,
        description: 'Penicillin-class antibiotic used to treat bacterial infections.'
      },
      {
        name: 'Metformin 850mg',
        genericName: 'Metformin Hydrochloride',
        category: 'Antidiabetics',
        manufacturer: 'Abbott Healthcare',
        batchNumber: 'BT-MET-003',
        expiryDate: new Date('2027-09-15'),
        stockQuantity: 2000,
        unitPrice: 2.0,
        reorderLevel: 300,
        description: 'First-line medication for the treatment of type 2 diabetes.'
      },
      {
        name: 'Atorvastatin 20mg',
        genericName: 'Atorvastatin',
        category: 'Cardiovascular',
        manufacturer: 'Sun Pharmaceutical',
        batchNumber: 'BT-ATO-004',
        expiryDate: new Date('2028-03-20'),
        stockQuantity: 50, // Low stock, reorder level is 100
        unitPrice: 4.5,
        reorderLevel: 100,
        description: 'Statin medication used to prevent cardiovascular disease.'
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine Dihydrochloride',
        category: 'Antihistamines',
        manufacturer: 'Alkem Laboratories',
        batchNumber: 'BT-CET-005',
        expiryDate: new Date('2027-11-30'),
        stockQuantity: 500,
        unitPrice: 0.8,
        reorderLevel: 100,
        description: 'Second-generation antihistamine used to treat allergies.'
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'Analgesics',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'BT-IBU-006',
        expiryDate: new Date('2028-05-10'),
        stockQuantity: 1200,
        unitPrice: 1.2,
        reorderLevel: 250,
        description: 'Nonsteroidal anti-inflammatory drug (NSAID).'
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Gastrointestinal',
        manufacturer: 'Lupin Ltd',
        batchNumber: 'BT-OME-007',
        expiryDate: new Date('2027-04-18'),
        stockQuantity: 30, // Low stock, reorder level is 200
        unitPrice: 2.5,
        reorderLevel: 200,
        description: 'Proton-pump inhibitor used to treat gastroesophageal reflux disease (GERD).'
      },
      {
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        category: 'Antibiotics',
        manufacturer: 'Reddy\'s Laboratories',
        batchNumber: 'BT-AZI-008',
        expiryDate: new Date('2027-08-25'),
        stockQuantity: 600,
        unitPrice: 5.0,
        reorderLevel: 100,
        description: 'Macrolide antibiotic used to treat various bacterial infections.'
      },
      {
        name: 'Amlodipine 5mg',
        genericName: 'Amlodipine Besylate',
        category: 'Cardiovascular',
        manufacturer: 'Pfizer Ltd',
        batchNumber: 'BT-AML-009',
        expiryDate: new Date('2028-01-15'),
        stockQuantity: 150, // Low stock, reorder level is 300
        unitPrice: 1.8,
        reorderLevel: 300,
        description: 'Calcium channel blocker used to treat high blood pressure and chest pain.'
      },
      {
        name: 'Pantoprazole 40mg',
        genericName: 'Pantoprazole Sodium',
        category: 'Gastrointestinal',
        manufacturer: 'Sun Pharmaceutical',
        batchNumber: 'BT-PAN-010',
        expiryDate: new Date('2027-10-10'),
        stockQuantity: 800,
        unitPrice: 2.2,
        reorderLevel: 150,
        description: 'Medication used for treatment of erosive esophagitis.'
      }
    ];

    const createdProducts = [];
    for (const p of productsData) {
      const prod = new Product(p);
      await prod.save();
      console.log(`Product created: ${prod.name} (SKU: ${prod.sku})`);
      createdProducts.push(prod);
    }

    // 4. Seed Suppliers
    console.log('Seeding suppliers...');
    const suppliersData = [
      {
        name: 'Cipla Ltd',
        contactPerson: 'Amit Sharma',
        email: 'contact@cipla.com',
        phone: '+919876543210',
        address: {
          street: '123 Cipla Road, Peninsula Chambers',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400013',
          country: 'India'
        },
        taxId: 'TX-CIP-998877',
        isJanAushadhi: false,
        paymentTerms: 'Net 30',
        rating: 5,
        status: 'active'
      },
      {
        name: 'Reddy\'s Laboratories',
        contactPerson: 'Srinivas Rao',
        email: 'info@drreddys.com',
        phone: '+919988776655',
        address: {
          street: '8-2-337, Road No 3, Banjara Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500034',
          country: 'India'
        },
        taxId: 'TX-DRR-112233',
        isJanAushadhi: false,
        paymentTerms: 'Net 45',
        rating: 4,
        status: 'active'
      },
      {
        name: 'Jan Aushadhi Kendra (Govt. Initiative)',
        contactPerson: 'Rajesh Patel',
        email: 'support@janaushadhi.gov.in',
        phone: '+911123456789',
        address: {
          street: 'Videocon Tower, Block E1, Jhandewalan Extension',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110055',
          country: 'India'
        },
        taxId: 'TX-JAK-776655',
        isJanAushadhi: true,
        paymentTerms: 'Net 15',
        rating: 5,
        status: 'active'
      },
      {
        name: 'Sun Pharmaceutical Industries',
        contactPerson: 'Vikram Mehta',
        email: 'sales@sunpharma.com',
        phone: '+919000111222',
        address: {
          street: 'Acme Plaza, Andheri Kurla Road, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400059',
          country: 'India'
        },
        taxId: 'TX-SUN-443322',
        isJanAushadhi: false,
        paymentTerms: 'Net 30',
        rating: 4,
        status: 'active'
      }
    ];

    const createdSuppliers = [];
    for (const s of suppliersData) {
      const sup = new Supplier(s);
      await sup.save();
      console.log(`Supplier created: ${sup.name}`);
      createdSuppliers.push(sup);
    }

    // 5. Seed Purchase Orders
    console.log('Seeding purchase orders...');
    const getPOItems = (items) => {
      let subtotal = 0;
      const poItems = items.map(item => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {
          product: item.product._id,
          genericName: item.product.genericName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: total,
          receivedQuantity: item.receivedQuantity || 0
        };
      });
      return { items: poItems, subtotal };
    };

    const po1Details = getPOItems([
      { product: createdProducts[1], quantity: 200, unitPrice: 3.0 }, // Amoxicillin
      { product: createdProducts[7], quantity: 100, unitPrice: 4.8 }  // Azithromycin
    ]);

    const po2Details = getPOItems([
      { product: createdProducts[3], quantity: 500, unitPrice: 4.2 }, // Atorvastatin
      { product: createdProducts[8], quantity: 300, unitPrice: 1.6 }  // Amlodipine
    ]);

    const po3Details = getPOItems([
      { product: createdProducts[6], quantity: 1000, unitPrice: 2.3 } // Omeprazole
    ]);

    const po4Details = getPOItems([
      { product: createdProducts[0], quantity: 5000, unitPrice: 1.4 }, // Paracetamol
      { product: createdProducts[5], quantity: 2000, unitPrice: 1.1 }  // Ibuprofen
    ]);

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    const poData = [
      {
        poNumber: `PO-${year}${month}-0001`,
        supplier: createdSuppliers[1]._id,
        status: 'received',
        orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        items: po1Details.items.map(it => ({ ...it, receivedQuantity: it.quantity })),
        subtotal: po1Details.subtotal,
        taxAmount: po1Details.subtotal * 0.12,
        totalAmount: po1Details.subtotal * 1.12,
        createdBy: userMap['procurement_staff'],
        approvedBy: userMap['admin'],
        approvalDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Net 45',
        paymentStatus: 'paid',
        invoiceNumber: 'INV-DRR-8877'
      },
      {
        poNumber: `PO-${year}${month}-0002`,
        supplier: createdSuppliers[3]._id,
        status: 'approved',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        items: po2Details.items,
        subtotal: po2Details.subtotal,
        taxAmount: po2Details.subtotal * 0.12,
        totalAmount: po2Details.subtotal * 1.12,
        createdBy: userMap['procurement_staff'],
        approvedBy: userMap['admin'],
        approvalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Net 30',
        paymentStatus: 'unpaid'
      },
      {
        poNumber: `PO-${year}${month}-0003`,
        supplier: createdSuppliers[0]._id,
        status: 'submitted',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: po3Details.items,
        subtotal: po3Details.subtotal,
        taxAmount: po3Details.subtotal * 0.12,
        totalAmount: po3Details.subtotal * 1.12,
        createdBy: userMap['procurement_staff'],
        paymentTerms: 'Net 30',
        paymentStatus: 'unpaid'
      },
      {
        poNumber: `PO-${year}${month}-0004`,
        supplier: createdSuppliers[2]._id,
        status: 'draft',
        orderDate: new Date(),
        items: po4Details.items,
        subtotal: po4Details.subtotal,
        taxAmount: po4Details.subtotal * 0.12,
        totalAmount: po4Details.subtotal * 1.12,
        createdBy: userMap['procurement_staff'],
        paymentTerms: 'Net 15',
        paymentStatus: 'unpaid'
      }
    ];

    const createdPOs = [];
    for (const po of poData) {
      const pOrder = new PurchaseOrder(po);
      await pOrder.save();
      console.log(`Purchase Order created: ${pOrder.poNumber} (${pOrder.status})`);
      createdPOs.push(pOrder);
    }

    // 6. Seed Purchase Receipts
    console.log('Seeding purchase receipts...');
    const receivedPO = createdPOs[0];
    const prItems = receivedPO.items.map(item => {
      return {
        product: item.product,
        genericName: item.genericName,
        expectedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        batchNumber: 'BAT-RECV-001',
        expiryDate: new Date('2028-06-30'),
        unitPrice: item.unitPrice,
        comments: 'Received in good condition'
      };
    });

    const pr = new PurchaseReceipt({
      receiptNumber: `GRN-${year}${month}-0001`,
      purchaseOrder: receivedPO._id,
      receiptDate: receivedPO.actualDeliveryDate,
      receivedBy: userMap['procurement_staff'],
      items: prItems,
      qualityCheck: {
        passed: true,
        notes: 'Visual and packaging checks passed',
        checkedBy: userMap['admin']
      },
      notes: 'Standard receipt of scheduled procurement order',
      status: 'complete'
    });
    await pr.save();
    console.log(`Purchase Receipt created: ${pr.receiptNumber}`);

    // 7. Seed Distribution Orders
    console.log('Seeding distribution orders...');
    const dateStr = currentDate.getFullYear().toString() + 
                  (currentDate.getMonth() + 1).toString().padStart(2, '0') + 
                  currentDate.getDate().toString().padStart(2, '0');

    const distData = [
      {
        orderNumber: `DO-${dateStr}-0001`,
        recipient: 'General Hospital Ward A',
        recipientType: 'department',
        items: [
          {
            product: createdProducts[0]._id,
            quantity: 200,
            batchNumber: 'BT-PAR-001',
            expiryDate: createdProducts[0].expiryDate
          },
          {
            product: createdProducts[5]._id,
            quantity: 100,
            batchNumber: 'BT-IBU-006',
            expiryDate: createdProducts[5].expiryDate
          }
        ],
        status: 'delivered',
        shippingInfo: {
          address: 'First Floor, Building B, General Hospital',
          contactPerson: 'Nurse Jenkins',
          contactNumber: '+919911223344'
        },
        createdBy: userMap['distribution_staff'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: `DO-${dateStr}-0002`,
        recipient: 'City Heart Pharmacy',
        recipientType: 'pharmacy',
        items: [
          {
            product: createdProducts[2]._id,
            quantity: 500,
            batchNumber: 'BT-MET-003',
            expiryDate: createdProducts[2].expiryDate
          },
          {
            product: createdProducts[4]._id,
            quantity: 200,
            batchNumber: 'BT-CET-005',
            expiryDate: createdProducts[4].expiryDate
          }
        ],
        status: 'shipped',
        shippingInfo: {
          address: '45 Commercial Avenue, Sector 12',
          contactPerson: 'Dr. Ramesh Kumar',
          contactNumber: '+919818283848'
        },
        createdBy: userMap['distribution_staff'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: `DO-${dateStr}-0003`,
        recipient: 'John Doe (Outpatient)',
        recipientType: 'patient',
        items: [
          {
            product: createdProducts[0]._id,
            quantity: 20,
            batchNumber: 'BT-PAR-001',
            expiryDate: createdProducts[0].expiryDate
          }
        ],
        status: 'pending',
        shippingInfo: {
          address: 'House 78B, Lane 4, Green Park',
          contactPerson: 'John Doe',
          contactNumber: '+919717071707'
        },
        createdBy: userMap['distribution_staff'],
        createdAt: new Date()
      }
    ];

    for (const d of distData) {
      const dist = new Distribution(d);
      await dist.save();
      console.log(`Distribution Order created: ${dist.orderNumber} to ${dist.recipient}`);
    }

    // 8. Seed Stock Movements
    console.log('Seeding stock movements...');
    const movementData = [
      {
        product: createdProducts[0]._id,
        type: 'in',
        quantity: 1700,
        reason: 'Initial Inventory Import',
        previousStock: 0,
        newStock: 1700,
        batchNumber: 'BT-PAR-001',
        expiryDate: createdProducts[0].expiryDate,
        createdBy: userMap['inventory_manager']
      },
      {
        product: createdProducts[0]._id,
        type: 'out',
        quantity: 200,
        reason: 'Distribution Order (Ward A)',
        previousStock: 1700,
        newStock: 1500,
        batchNumber: 'BT-PAR-001',
        expiryDate: createdProducts[0].expiryDate,
        createdBy: userMap['distribution_staff']
      },
      {
        product: createdProducts[1]._id,
        type: 'in',
        quantity: 80,
        reason: 'Procurement Receipt GRN',
        previousStock: 0,
        newStock: 80,
        batchNumber: 'BAT-RECV-001',
        expiryDate: new Date('2028-06-30'),
        createdBy: userMap['inventory_manager']
      }
    ];

    for (const m of movementData) {
      const move = new StockMovement(m);
      await move.save();
      console.log(`Stock Movement created: ${move.product} - type: ${move.type}, quantity: ${move.quantity}`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
