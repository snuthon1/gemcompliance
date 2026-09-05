/**
 * Weights:
 * UDYAM_STATUS: 15
 * GST_STATUS: 15
 * GST_RETURNS: 15
 * PAN_COMPLIANCE: 10
 * BLACKLIST_CHECK: 20
 * NAME_MATCH: 15
 */
const CHECK_WEIGHTS = {
  UDYAM_STATUS: 15,
  GST_STATUS: 15,
  GST_RETURNS: 15,
  PAN_COMPLIANCE: 10,
  BLACKLIST_CHECK: 20,
  NAME_MATCH: 10,
  EPFO_ESIC_COMPLIANCE: 10,
  LOCAL_CONTENT_MII: 5
};

/**
 * Calculates explainable compliance score from verification results.
 * Logic order:
 * 1. If BLACKLIST_CHECK mismatch -> score = 0 immediately, risk = "High", recommendation = "Non-Compliant"
 * 2. Else calculate score normally (100 - sum(weights of all Mismatch checks))
 * 3. Else if NAME_MATCH mismatch AND resulting risk would be "Low" -> downgrade to "Medium" / "Needs Clarification"
 * 4. Else use normal score/risk/recommendation mapping
 *
 * @param {Array} verificationResults Array of VerificationResult records
 * @returns {Object} { score, risk, recommendation, flags }
 */
function calculateScore(verificationResults, documents = []) {
  const flags = [];
  let failedWeightsSum = 0;
  let isBlacklisted = false;
  let isNameMismatch = false;

  // 1. Process statutory checks from central registries
  for (const check of verificationResults) {
    if (check.match_status === 'Mismatch') {
      const weight = CHECK_WEIGHTS[check.check_type] || 0;
      failedWeightsSum += weight;

      if (check.check_type === 'BLACKLIST_CHECK') {
        isBlacklisted = true;
      }
      if (check.check_type === 'NAME_MATCH') {
        isNameMismatch = true;
      }

      // Plain-English flag generator
      switch (check.check_type) {
        case 'BLACKLIST_CHECK':
          flags.push('Bidder is currently blacklisted/debarred — see audit trail for order details');
          break;
        case 'GST_RETURNS':
          flags.push('GST returns pending — bidder has not filed required returns');
          break;
        case 'NAME_MATCH':
          flags.push('Document name does not match GST portal records — possible identity mismatch');
          break;
        case 'UDYAM_STATUS':
          flags.push('Udyam registration is inactive or cancelled on MSME databank');
          break;
        case 'GST_STATUS':
          flags.push('GST registration is not in Active status on GSTN portal');
          break;
        case 'PAN_COMPLIANCE':
          flags.push('PAN compliance issue — Income Tax Return (ITR) was not filed for previous assessment year');
          break;
        case 'EPFO_ESIC_COMPLIANCE':
          flags.push('EPFO / ESIC non-compliance — pending electronic challans on Shram Suvidha portal');
          break;
        case 'LOCAL_CONTENT_MII':
          flags.push('Make in India (PPP-MII) failure — local content declaration below mandatory PSU tender threshold');
          break;
        default:
          flags.push(`Check ${check.check_type} failed verification`);
      }
    }
  }

  // 2. Process uploaded statutory documents discrepancies from the vault
  const flaggedDocs = (documents || []).filter(
    d => d && (d.flagged === 1 || d.flagged === '1' || d.flagged === true || (d.flag_reason && d.flag_reason.trim().length > 0))
  );

  for (const doc of flaggedDocs) {
    const reason = doc.flag_reason || `Discrepancy detected in uploaded ${doc.doc_type || 'statutory'} certificate`;
    flags.push(`Statutory Document Discrepancy (${doc.doc_type || 'Document'}): ${reason}`);
    failedWeightsSum += 25; // Significant penalty per flagged document
  }

  // 1. Hard Override: If BLACKLIST_CHECK is Mismatch -> score = 0, High, Non-Compliant
  if (isBlacklisted) {
    return {
      score: 0,
      risk: 'High',
      recommendation: 'Non-Compliant',
      flags,
      flaggedDocuments: flaggedDocs
    };
  }

  // 2. Calculate score
  let score = Math.max(0, 100 - failedWeightsSum);

  // If ANY document is flagged, score cannot exceed 75 and risk CANNOT be Low!
  if (flaggedDocs.length > 0) {
    score = Math.min(score, 75);
  }

  // Normal risk & recommendation mapping
  let risk = 'Low';
  let recommendation = 'Compliant';

  if (score >= 85) {
    risk = 'Low';
    recommendation = 'Compliant';
  } else if (score >= 60) {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  } else {
    risk = 'High';
    recommendation = 'Non-Compliant';
  }

  // Rule: If NAME_MATCH mismatch AND resulting risk would be "Low" -> downgrade to "Medium"
  if (isNameMismatch && risk === 'Low') {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  }

  // Rule: If ANY document has a discrepancy, risk CANNOT be Low
  if (flaggedDocs.length > 0 && risk === 'Low') {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  }

  // Rule: If 2 or more documents are flagged, escalate to High Risk
  if (flaggedDocs.length >= 2) {
    risk = 'High';
    recommendation = 'Non-Compliant';
    score = Math.min(score, 50);
  }

  return {
    score,
    risk,
    recommendation,
    flags,
    flaggedDocuments: flaggedDocs
  };
}

module.exports = { calculateScore, CHECK_WEIGHTS };
