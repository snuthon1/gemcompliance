const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.bid.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.verificationResult.deleteMany();
  await prisma.document.deleteMany();
  await prisma.blacklistRegistry.deleteMany();
  await prisma.panRegistry.deleteMany();
  await prisma.gstnRegistry.deleteMany();
  await prisma.udyamRegistry.deleteMany();
  await prisma.bidder.deleteMany();

  console.log('Seeding 5 Calibrated Bidders and Mock Portal Registries...');

  // =========================================================================
  // 1. "Compliant" Bidder
  // Active GSTIN, active Udyam, PAN compliant, not blacklisted, 0 returns pending
  // =========================================================================
  const compliantBidder = await prisma.bidder.create({
    data: {
      company_name: 'Apex Petrochem Engineering Pvt Ltd',
      pan_number: 'AAACA1234A',
      gstin: '33AAACA1234A1Z5',
      udyam_number: 'UDYAM-TN-02-0012345',
      email: 'tenders@apexpetrochem.in',
      phone: '+91 44 2250 1122',
      registered_address: 'Plot 42, SIDCO Industrial Estate, Guindy, Chennai, TN - 600032'
    }
  });

  await prisma.udyamRegistry.create({
    data: {
      udyam_number: 'UDYAM-TN-02-0012345',
      company_name: 'Apex Petrochem Engineering Pvt Ltd',
      category: 'Medium',
      registration_date: new Date('2020-05-15'),
      status: 'Active',
      nic_code: '28121'
    }
  });

  await prisma.gstnRegistry.create({
    data: {
      gstin: '33AAACA1234A1Z5',
      legal_name: 'Apex Petrochem Engineering Pvt Ltd',
      registration_date: new Date('2017-07-01'),
      status: 'Active',
      last_return_filed_date: new Date('2026-08-20'),
      filing_frequency: 'Monthly',
      returns_pending: 0,
      taxpayer_type: 'Regular'
    }
  });

  await prisma.panRegistry.create({
    data: {
      pan_number: 'AAACA1234A',
      name: 'Apex Petrochem Engineering Pvt Ltd',
      itr_filed_last_year: true,
      compliance_status: 'Compliant',
      aadhaar_linked: true
    }
  });

  // =========================================================================
  // 2. "Blacklisted" Bidder
  // blacklisted = true in BlacklistRegistry, everything else looks fine
  // =========================================================================
  const blacklistedBidder = await prisma.bidder.create({
    data: {
      company_name: 'Coromandel Heavy Valves & Alloy Works Ltd',
      pan_number: 'BBBCB5678B',
      gstin: '33BBBCB5678B1Z2',
      udyam_number: 'UDYAM-TN-03-0054321',
      email: 'sales@coromandelvalves.com',
      phone: '+91 44 2594 3344',
      registered_address: 'Survey 108, Manali Petro-Corridor, Chennai, TN - 600068'
    }
  });

  await prisma.udyamRegistry.create({
    data: {
      udyam_number: 'UDYAM-TN-03-0054321',
      company_name: 'Coromandel Heavy Valves & Alloy Works Ltd',
      category: 'Medium',
      registration_date: new Date('2019-11-20'),
      status: 'Active',
      nic_code: '28121'
    }
  });

  await prisma.gstnRegistry.create({
    data: {
      gstin: '33BBBCB5678B1Z2',
      legal_name: 'Coromandel Heavy Valves & Alloy Works Ltd',
      registration_date: new Date('2018-03-15'),
      status: 'Active',
      last_return_filed_date: new Date('2026-08-18'),
      filing_frequency: 'Monthly',
      returns_pending: 0,
      taxpayer_type: 'Regular'
    }
  });

  await prisma.panRegistry.create({
    data: {
      pan_number: 'BBBCB5678B',
      name: 'Coromandel Heavy Valves & Alloy Works Ltd',
      itr_filed_last_year: true,
      compliance_status: 'Compliant',
      aadhaar_linked: true
    }
  });

  await prisma.blacklistRegistry.create({
    data: {
      entity_name: 'Coromandel Heavy Valves & Alloy Works Ltd',
      pan_or_gstin: '33BBBCB5678B1Z2',
      blacklisted: true,
      reason: 'Debarred by CVO CPCL / MoPNG under Order CVO-2025/119 for fraudulent mill test certificates in crude pipeline tender.',
      debarment_start: new Date('2025-06-01'),
      debarment_end: new Date('2027-05-31')
    }
  });

  // =========================================================================
  // 3. "Document mismatch" Bidder
  // Company name in GstnRegistry does NOT match the name in Bidder table
  // =========================================================================
  const mismatchBidder = await prisma.bidder.create({
    data: {
      company_name: 'Bharat High-Pressure Seamless Pipes Pvt Ltd',
      pan_number: 'CCCC09876C',
      gstin: '33CCCC09876C1Z9',
      udyam_number: 'UDYAM-TN-01-0078901',
      email: 'contact@bharatseamlesspipes.in',
      phone: '+91 44 2625 7788',
      registered_address: '24 Industrial Bypass, Ambattur, Chennai, TN - 600058'
    }
  });

  await prisma.gstnRegistry.create({
    data: {
      gstin: '33CCCC09876C1Z9',
      legal_name: 'Hindustan Pipe & Tube Fabricators (Unregistered Alias)',
      registration_date: new Date('2019-09-12'),
      status: 'Active',
      last_return_filed_date: new Date('2026-08-15'),
      filing_frequency: 'Monthly',
      returns_pending: 0,
      taxpayer_type: 'Regular'
    }
  });

  await prisma.udyamRegistry.create({
    data: {
      udyam_number: 'UDYAM-TN-01-0078901',
      company_name: 'Bharat High-Pressure Seamless Pipes Pvt Ltd',
      category: 'Small',
      registration_date: new Date('2021-02-10'),
      status: 'Active',
      nic_code: '24102'
    }
  });

  await prisma.panRegistry.create({
    data: {
      pan_number: 'CCCC09876C',
      name: 'Bharat High-Pressure Seamless Pipes Pvt Ltd',
      itr_filed_last_year: true,
      compliance_status: 'Compliant',
      aadhaar_linked: true
    }
  });

  // =========================================================================
  // 4. "Non-compliant" Bidder
  // Udyam status = "Cancelled", GstnRegistry returns_pending = 3
  // =========================================================================
  const nonCompliantBidder = await prisma.bidder.create({
    data: {
      company_name: 'Kaveri Refining Spares & Services Ltd',
      pan_number: 'DDDCD4321D',
      gstin: '33DDDCD4321D1Z4',
      udyam_number: 'UDYAM-TN-04-0099887',
      email: 'admin@kaverispares.com',
      phone: '+91 4365 242100',
      registered_address: '12 Nagapattinam High Road, CPCL Refinery Area, Nagapattinam, TN - 611002'
    }
  });

  await prisma.udyamRegistry.create({
    data: {
      udyam_number: 'UDYAM-TN-04-0099887',
      company_name: 'Kaveri Refining Spares & Services Ltd',
      category: 'Micro',
      registration_date: new Date('2018-06-05'),
      status: 'Cancelled',
      nic_code: '33129'
    }
  });

  await prisma.gstnRegistry.create({
    data: {
      gstin: '33DDDCD4321D1Z4',
      legal_name: 'Kaveri Refining Spares & Services Ltd',
      registration_date: new Date('2017-08-10'),
      status: 'Suspended',
      last_return_filed_date: new Date('2026-05-10'),
      filing_frequency: 'Monthly',
      returns_pending: 3,
      taxpayer_type: 'Regular'
    }
  });

  await prisma.panRegistry.create({
    data: {
      pan_number: 'DDDCD4321D',
      name: 'Kaveri Refining Spares & Services Ltd',
      itr_filed_last_year: false,
      compliance_status: 'Non-Filer',
      aadhaar_linked: false
    }
  });

  // =========================================================================
  // 5. "Borderline" Bidder
  // One minor issue only: PAN itr_filed_last_year = false, Non-Filer
  // =========================================================================
  const borderlineBidder = await prisma.bidder.create({
    data: {
      company_name: 'Deccan Petro Instrumentation & Flow Systems',
      pan_number: 'EEECE8765E',
      gstin: '33EEECE8765E1Z6',
      udyam_number: 'UDYAM-TN-02-0033221',
      email: 'info@deccanpetro.com',
      phone: '+91 44 4390 5566',
      registered_address: '77 OMR IT Highway, Sholinganallur, Chennai, TN - 600119'
    }
  });

  await prisma.udyamRegistry.create({
    data: {
      udyam_number: 'UDYAM-TN-02-0033221',
      company_name: 'Deccan Petro Instrumentation & Flow Systems',
      category: 'Small',
      registration_date: new Date('2022-03-18'),
      status: 'Active',
      nic_code: '26519'
    }
  });

  await prisma.gstnRegistry.create({
    data: {
      gstin: '33EEECE8765E1Z6',
      legal_name: 'Deccan Petro Instrumentation & Flow Systems',
      registration_date: new Date('2021-02-28'),
      status: 'Active',
      last_return_filed_date: new Date('2026-08-20'),
      filing_frequency: 'Monthly',
      returns_pending: 0,
      taxpayer_type: 'Regular'
    }
  });

  await prisma.panRegistry.create({
    data: {
      pan_number: 'EEECE8765E',
      name: 'Deccan Petro Instrumentation & Flow Systems',
      itr_filed_last_year: false, // <-- ONLY MINOR ISSUE
      compliance_status: 'Non-Filer',
      aadhaar_linked: true
    }
  });

  // =========================================================================
  // 6. SEED TENDERS
  // Tender 1: estimated_value 4500000, status "Open"
  // Tender 2: estimated_value 2200000, status "Open"
  // =========================================================================
  console.log('Seeding Tenders...');
  const tender1 = await prisma.tender.create({
    data: {
      title: 'Supply of Industrial Valves & Pipe Fittings',
      description: 'Procurement of API 6D Forged Steel Gate, Globe and Check Valves and Seamless High-Pressure Fittings for CPCL Manali Refinery Crude Distillation Unit.',
      department: 'CPCL - Chennai Petroleum Corporation Limited',
      estimated_value: 4500000.0,
      submission_deadline: new Date('2026-10-15T17:00:00Z'),
      status: 'Open'
    }
  });

  const tender2 = await prisma.tender.create({
    data: {
      title: 'AMC for Refinery Instrumentation Systems',
      description: 'Annual Maintenance Contract for Process Automation, Flow Sensors, and Gas Monitoring Assemblies across CPCL Offsite and Utilities Area.',
      department: 'CPCL - Chennai Petroleum Corporation Limited',
      estimated_value: 2200000.0,
      submission_deadline: new Date('2026-10-25T17:00:00Z'),
      status: 'Open'
    }
  });

  // =========================================================================
  // 7. SEED BIDS
  // All 5 submit bids on Tender 1 (realistic prices around 4,500,000)
  // 3 bidders submit bids on Tender 2 (realistic prices around 2,200,000)
  // =========================================================================
  console.log('Seeding Bids on Tenders...');

  // Tender 1 Bids (All 5 bidders)
  await prisma.bid.createMany({
    data: [
      {
        tender_id: tender1.tender_id,
        bidder_id: compliantBidder.bidder_id,
        bid_amount: 4420000.0, // Competitive compliant bid
        status: 'Submitted'
      },
      {
        tender_id: tender1.tender_id,
        bidder_id: blacklistedBidder.bidder_id,
        bid_amount: 3950000.0, // Aggressively low price (L1) but blacklisted!
        status: 'Submitted'
      },
      {
        tender_id: tender1.tender_id,
        bidder_id: mismatchBidder.bidder_id,
        bid_amount: 4310000.0,
        status: 'Submitted'
      },
      {
        tender_id: tender1.tender_id,
        bidder_id: nonCompliantBidder.bidder_id,
        bid_amount: 4180000.0,
        status: 'Submitted'
      },
      {
        tender_id: tender1.tender_id,
        bidder_id: borderlineBidder.bidder_id,
        bid_amount: 4620000.0,
        status: 'Submitted'
      }
    ]
  });

  // Tender 2 Bids (3 of 5 bidders: Compliant, Non-compliant Kaveri, Borderline Deccan)
  await prisma.bid.createMany({
    data: [
      {
        tender_id: tender2.tender_id,
        bidder_id: compliantBidder.bidder_id,
        bid_amount: 2150000.0,
        status: 'Submitted'
      },
      {
        tender_id: tender2.tender_id,
        bidder_id: nonCompliantBidder.bidder_id,
        bid_amount: 1980000.0, // Low bid price but Non-Compliant!
        status: 'Submitted'
      },
      {
        tender_id: tender2.tender_id,
        bidder_id: borderlineBidder.bidder_id,
        bid_amount: 2280000.0,
        status: 'Submitted'
      }
    ]
  });

  console.log('Seed completed successfully for Bidders, Portals, Tenders, and Bids!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
