function parseIndianStatutoryDocument(rawText, docTypeHint = 'GST_CERT') {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = rawText.replace(/\s+/g, ' ');

  // 1. Regex patterns for statutory numbers
  const gstinLabelMatch = fullText.match(/(?:GSTIN(?:\/UIN)?|Registration\s*Number)\s*[:\-]?\s*([0-3][0-9][A-Z0-9]{13})/i);
  const gstinRegexMatch = fullText.match(/\b([0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i);

  const panLabelMatch = fullText.match(/(?:PAN|Permanent\s*Account\s*(?:Number)?)\s*[:\-]?\s*([A-Z0-9]{10})/i);
  const panRegexMatch = fullText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/i);

  const udyamLabelMatch = fullText.match(/(?:Udyam\s*(?:Reg\.?|Registration)?\s*(?:No\.?|Number)?)\s*[:\-]?\s*(UDYAM\s*[-/]\s*[A-Z]{2}\s*[-/]\s*[0-9]{2}\s*[-/]\s*[0-9]{7})/i);
  const udyamRegexMatch = fullText.match(/\b(UDYAM\s*[-/]\s*[A-Z]{2}\s*[-/]\s*[0-9]{2}\s*[-/]\s*[0-9]{7})\b/i);

  let registrationNumber = null;
  let detectedDocType = docTypeHint;
  let issuingAuthority = 'Government of India';

  // Determine doc type and number
  if (udyamLabelMatch || udyamRegexMatch || /\b(udyam|msme)\b/i.test(fullText)) {
    detectedDocType = 'Udyam Registration Certificate';
    const rawNum = (udyamLabelMatch ? udyamLabelMatch[1] : (udyamRegexMatch ? udyamRegexMatch[1] : ''));
    registrationNumber = rawNum ? rawNum.replace(/\s+/g, '').replace(/\//g, '-').toUpperCase() : null;
    issuingAuthority = 'Ministry of Micro, Small and Medium Enterprises, Government of India';
  } else if (panLabelMatch || panRegexMatch || /\b(income\s*tax|permanent\s*account)\b/i.test(fullText)) {
    detectedDocType = 'Permanent Account Number Card';
    registrationNumber = panLabelMatch ? panLabelMatch[1].toUpperCase() : (panRegexMatch ? panRegexMatch[1].toUpperCase() : null);
    issuingAuthority = 'Income Tax Department, Government of India';
  } else if (gstinLabelMatch || gstinRegexMatch || /\b(gst\s*reg|goods\s*and\s*services\s*tax|gstin)\b/i.test(fullText)) {
    detectedDocType = 'Form GST REG-06 Certificate of Registration';
    registrationNumber = gstinLabelMatch ? gstinLabelMatch[1].toUpperCase() : (gstinRegexMatch ? gstinRegexMatch[1].toUpperCase() : null);
    issuingAuthority = 'Goods and Services Tax Network (GSTN), Government of India';
  }

  // 2. Extract Entity Name
  let entityName = null;
  const legalNameMatch = fullText.match(/(?:Legal\s*Name|Trade\s*Name|Name\s*of\s*Enterprise|Enterprise\s*Name)\s*[:\-]?\s*([A-Za-z0-9\s&.,()'-]+?)(?=(?:\s+Trade\s*Name|\s+GSTIN|\s+PAN|\s+Date|\s+Constitution|\s+Address|\s+Father|$))/i);
  if (legalNameMatch && legalNameMatch[1].trim().length > 3) {
    entityName = legalNameMatch[1].trim();
  }

  if (!entityName) {
    const skipHeaders = /\b(government|ministry|income\s*tax|form\s*gst|reg-06|republic|department|permanent\s*account|certificate|date|gstin|pan|udyam)\b/i;
    for (const line of lines) {
      if (!skipHeaders.test(line) && line.length >= 4) {
        if (/(?:Ltd|Limited|Pvt|Private|Works|Components|Industries|Engineering|Services|Spares|Enterprises|Corporation|Alloy)/i.test(line)) {
          entityName = line.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9)]+$/, '').trim();
          break;
        }
      }
    }
  }

  if (!entityName) {
    const skipHeaders = /\b(government|ministry|income\s*tax|form\s*gst|reg-06|republic|department|permanent\s*account|certificate|date|gstin|pan|udyam)\b/i;
    for (const line of lines) {
      if (!skipHeaders.test(line) && line.length >= 4 && !/^\d+$/.test(line)) {
        entityName = line.trim();
        break;
      }
    }
  }

  // 3. Extract Registration Date
  let registrationDate = null;
  const dateMatch = fullText.match(/(?:Date\s*of\s*(?:Issue|Registration|Incorporation)|Registration\s*Date|Valid\s*From)\s*[:\-]?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i);
  if (dateMatch) {
    registrationDate = dateMatch[1].trim();
  } else {
    const anyDate = fullText.match(/\b(\d{2}[-/.]\d{2}[-/.]\d{4})\b/);
    if (anyDate) registrationDate = anyDate[1];
  }

  return {
    document_type: detectedDocType,
    entity_name: entityName,
    registration_number: registrationNumber,
    registration_date: registrationDate,
    expiry_date: null,
    issuing_authority: issuingAuthority
  };
}

const apexOcrText = `GOVERNMENT OF INDIA - FORM GST REG-06
Apex Petrochem Engineering Pvt Ltd

GSTIN: 33AAACA1234A1Z5

Date of Issue: 01/07/2017`;

console.log('Apex OCR Parsed:');
console.log(JSON.stringify(parseIndianStatutoryDocument(apexOcrText, 'GST_CERT'), null, 2));

const panOcrText = `INCOME TAX DEPARTMENT - GOVT OF INDIA
Global Trans-National Components Ltd (Discrepant)
PAN: CCCC09876C`;

console.log('\nPAN Mismatch OCR Parsed:');
console.log(JSON.stringify(parseIndianStatutoryDocument(panOcrText, 'PAN_CARD'), null, 2));