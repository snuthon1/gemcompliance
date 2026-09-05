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
  NAME_MATCH: 15
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
function calculateScore(verificationResults) {
  const flags = [];
  let failedWeightsSum = 0;
  let isBlacklisted = false;
  let isNameMismatch = false;

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
          flags.push('PAN compliance issue — Income Tax Return (ITR) was not filed for the previous assessment year');
          break;
        default:
          flags.push(`Check ${check.check_type} failed verification`);
      }
    }
  }

  // 1. Hard Override: If BLACKLIST_CHECK is Mismatch -> score = 0, High, Non-Compliant
  if (isBlacklisted) {
    return {
      score: 0,
      risk: 'High',
      recommendation: 'Non-Compliant',
      flags
    };
  }

  // 2. Calculate score normally
  const score = Math.max(0, 100 - failedWeightsSum);

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

  // 3. Rule: If NAME_MATCH mismatch AND resulting risk would be "Low"
  // Downgrade to "Medium" / "Needs Clarification" regardless of score
  if (isNameMismatch && risk === 'Low') {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  }

  return {
    score,
    risk,
    recommendation,
    flags
  };
}

module.exports = { calculateScore, CHECK_WEIGHTS };
