const prisma = require('../db');

/**
 * Runs 6 specific statutory checks against mock portal databases:
 * 1. UDYAM_STATUS
 * 2. GST_STATUS
 * 3. GST_RETURNS
 * 4. PAN_COMPLIANCE
 * 5. BLACKLIST_CHECK
 * 6. NAME_MATCH
 * Writes results to VerificationResult table and creates AuditLog entry.
 */
async function runVerification(bidder_id) {
  // 1. Fetch bidder record
  const bidder = await prisma.bidder.findUnique({
    where: { bidder_id }
  });

  if (!bidder) {
    throw new Error(`Bidder not found for ID: ${bidder_id}`);
  }

  // 2. Query mock portals internally directly via Prisma
  const [udyamRecord, gstnRecord, panRecord, blacklistRecord] = await Promise.all([
    prisma.udyamRegistry.findUnique({
      where: { udyam_number: bidder.udyam_number.trim() }
    }),
    prisma.gstnRegistry.findUnique({
      where: { gstin: bidder.gstin.trim() }
    }),
    prisma.panRegistry.findUnique({
      where: { pan_number: bidder.pan_number.trim() }
    }),
    prisma.blacklistRegistry.findFirst({
      where: {
        pan_or_gstin: bidder.gstin.trim(),
        blacklisted: true
      }
    })
  ]);

  const checks = [];

  // Check 1: UDYAM_STATUS -> Match if UdyamRegistry.status === "Active", else Mismatch. severity: "Critical"
  const isUdyamActive = udyamRecord && udyamRecord.status === 'Active';
  checks.push({
    bidder_id,
    check_type: 'UDYAM_STATUS',
    document_value: bidder.udyam_number,
    portal_value: udyamRecord ? `${udyamRecord.status} (${udyamRecord.category} Enterprise)` : 'Not Found',
    match_status: isUdyamActive ? 'Match' : 'Mismatch',
    severity: 'Critical'
  });

  // Check 2: GST_STATUS -> Match if GstnRegistry.status === "Active", else Mismatch. severity: "Critical"
  const isGstActive = gstnRecord && gstnRecord.status === 'Active';
  checks.push({
    bidder_id,
    check_type: 'GST_STATUS',
    document_value: bidder.gstin,
    portal_value: gstnRecord ? gstnRecord.status : 'Not Found',
    match_status: isGstActive ? 'Match' : 'Mismatch',
    severity: 'Critical'
  });

  // Check 3: GST_RETURNS -> Match if GstnRegistry.returns_pending === 0, else Mismatch. severity: "Major"
  const areReturnsFiled = gstnRecord && gstnRecord.returns_pending === 0;
  checks.push({
    bidder_id,
    check_type: 'GST_RETURNS',
    document_value: '0 Pending Returns Expected',
    portal_value: gstnRecord ? `${gstnRecord.returns_pending} Pending Returns` : 'Not Found',
    match_status: areReturnsFiled ? 'Match' : 'Mismatch',
    severity: 'Major'
  });

  // Check 4: PAN_COMPLIANCE -> Match if PanRegistry.itr_filed_last_year === true, else Mismatch. severity: "Minor"
  const isItrFiled = panRecord && panRecord.itr_filed_last_year === true;
  checks.push({
    bidder_id,
    check_type: 'PAN_COMPLIANCE',
    document_value: bidder.pan_number,
    portal_value: panRecord ? `ITR Filed: ${panRecord.itr_filed_last_year} (Compliance: ${panRecord.compliance_status})` : 'Not Found',
    match_status: isItrFiled ? 'Match' : 'Mismatch',
    severity: 'Minor'
  });

  // Check 5: BLACKLIST_CHECK -> Match if blacklisted === false, else Mismatch. severity: "Critical"
  const isBlacklisted = Boolean(blacklistRecord);
  checks.push({
    bidder_id,
    check_type: 'BLACKLIST_CHECK',
    document_value: bidder.company_name,
    portal_value: isBlacklisted ? `Debarred: ${blacklistRecord.reason}` : 'Clean (Not Blacklisted)',
    match_status: !isBlacklisted ? 'Match' : 'Mismatch',
    severity: 'Critical'
  });

  // Check 6: NAME_MATCH -> Compare Bidder.company_name against GstnRegistry.legal_name (case-insensitive, trimmed). Match if equal, else Mismatch. severity: "Major"
  const bidderName = bidder.company_name.trim().toLowerCase();
  const gstnName = gstnRecord ? gstnRecord.legal_name.trim().toLowerCase() : '';
  const isNameMatch = gstnRecord && bidderName === gstnName;
  checks.push({
    bidder_id,
    check_type: 'NAME_MATCH',
    document_value: bidder.company_name,
    portal_value: gstnRecord ? gstnRecord.legal_name : 'Not Found',
    match_status: isNameMatch ? 'Match' : 'Mismatch',
    severity: 'Major'
  });

  // 3. Write results to VerificationResult
  const createdResults = [];
  for (const c of checks) {
    const res = await prisma.verificationResult.create({
      data: c
    });
    createdResults.push(res);
  }

  // 4. Write an AuditLog entry
  await prisma.auditLog.create({
    data: {
      bidder_id,
      action: 'VERIFICATION_RUN',
      performed_by: 'System',
      details: `Ran 6 compliance checks for bidder ${bidder.company_name}`
    }
  });

  // 5. Return array of all 6 verification_results
  return createdResults;
}

module.exports = { runVerification };
