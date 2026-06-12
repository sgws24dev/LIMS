import type { TestCategory, Test, TestPackage } from "@/types"

export const testCategories: TestCategory[] = [
  { id: "CAT001", name: "Biochemistry", description: "Clinical biochemistry tests for metabolic and organ function assessment", testCount: 22, isActive: true },
  { id: "CAT002", name: "Hematology", description: "Complete blood count and coagulation studies", testCount: 14, isActive: true },
  { id: "CAT003", name: "Microbiology", description: "Microbiological culture, sensitivity and serological tests", testCount: 12, isActive: true },
  { id: "CAT004", name: "Immunology", description: "Immunoassay and autoimmune disorder diagnostics", testCount: 10, isActive: true },
  { id: "CAT005", name: "Endocrinology", description: "Hormonal assays and thyroid function tests", testCount: 8, isActive: true },
  { id: "CAT006", name: "Molecular Biology", description: "PCR-based and molecular diagnostic tests", testCount: 6, isActive: true },
  { id: "CAT007", name: "Histopathology", description: "Tissue biopsy and cytopathology examinations", testCount: 5, isActive: true },
  { id: "CAT008", name: "Clinical Pathology", description: "Urine, stool and body fluid analysis", testCount: 8, isActive: true },
]

export const tests: Test[] = [
  // Biochemistry
  {
    id: "TST001", name: "Fasting Blood Sugar (FBS)", code: "FBS", category: "Biochemistry", department: "Biochemistry",
    price: 150, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR001", name: "Glucose (Fasting)", unit: "mg/dL", referenceRange: "70 - 110", method: "GOD-POD" },
    ], isActive: true, preparation: "Fasting for 8-10 hours required",
  },
  {
    id: "TST002", name: "Post Prandial Blood Sugar (PPBS)", code: "PPBS", category: "Biochemistry", department: "Biochemistry",
    price: 150, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR002", name: "Glucose (2hr Post Meal)", unit: "mg/dL", referenceRange: "< 140", method: "GOD-POD" },
    ], isActive: true, preparation: "2 hours after meal",
  },
  {
    id: "TST003", name: "HbA1c (Glycated Hemoglobin)", code: "HBA1C", category: "Biochemistry", department: "Biochemistry",
    price: 600, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR003", name: "HbA1c", unit: "%", referenceRange: "< 5.7", method: "HPLC" },
      { id: "PAR004", name: "eAG", unit: "mg/dL", referenceRange: "< 117", method: "Calculated" },
    ], isActive: true,
  },
  {
    id: "TST004", name: "Lipid Profile", code: "LIPID", category: "Biochemistry", department: "Biochemistry",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR005", name: "Total Cholesterol", unit: "mg/dL", referenceRange: "< 200", method: "CHOD-PAP" },
      { id: "PAR006", name: "Triglycerides", unit: "mg/dL", referenceRange: "< 150", method: "GPO-PAP" },
      { id: "PAR007", name: "HDL Cholesterol", unit: "mg/dL", referenceRange: "> 40", method: "Direct" },
      { id: "PAR008", name: "LDL Cholesterol", unit: "mg/dL", referenceRange: "< 130", method: "Calculated" },
      { id: "PAR009", name: "VLDL Cholesterol", unit: "mg/dL", referenceRange: "< 30", method: "Calculated" },
    ], isActive: true, preparation: "Fasting for 10-12 hours required",
  },
  {
    id: "TST005", name: "Liver Function Test (LFT)", code: "LFT", category: "Biochemistry", department: "Biochemistry",
    price: 450, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR010", name: "Total Bilirubin", unit: "mg/dL", referenceRange: "0.3 - 1.2", method: "Diazo" },
      { id: "PAR011", name: "Direct Bilirubin", unit: "mg/dL", referenceRange: "0.0 - 0.3", method: "Diazo" },
      { id: "PAR012", name: "ALT (SGPT)", unit: "U/L", referenceRange: "10 - 40", method: "IFCC" },
      { id: "PAR013", name: "AST (SGOT)", unit: "U/L", referenceRange: "10 - 40", method: "IFCC" },
      { id: "PAR014", name: "ALP", unit: "U/L", referenceRange: "44 - 147", method: "DGKC" },
      { id: "PAR015", name: "Total Protein", unit: "g/dL", referenceRange: "6.4 - 8.3", method: "Biuret" },
      { id: "PAR016", name: "Albumin", unit: "g/dL", referenceRange: "3.5 - 5.0", method: "BCG" },
      { id: "PAR017", name: "Globulin", unit: "g/dL", referenceRange: "2.0 - 3.5", method: "Calculated" },
    ], isActive: true,
  },
  {
    id: "TST006", name: "Kidney Function Test (KFT)", code: "KFT", category: "Biochemistry", department: "Biochemistry",
    price: 400, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR018", name: "Blood Urea", unit: "mg/dL", referenceRange: "15 - 45", method: "GLDH" },
      { id: "PAR019", name: "BUN", unit: "mg/dL", referenceRange: "7 - 20", method: "Calculated" },
      { id: "PAR020", name: "Serum Creatinine", unit: "mg/dL", referenceRange: "0.6 - 1.2", method: "Jaffe" },
      { id: "PAR021", name: "Uric Acid", unit: "mg/dL", referenceRange: "3.5 - 7.2", method: "Uricase" },
      { id: "PAR022", name: "eGFR", unit: "mL/min/1.73m²", referenceRange: "> 90", method: "CKD-EPI" },
    ], isActive: true,
  },
  {
    id: "TST007", name: "Serum Electrolytes", code: "ELECT", category: "Biochemistry", department: "Biochemistry",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR023", name: "Sodium (Na)", unit: "mEq/L", referenceRange: "136 - 145", method: "ISE" },
      { id: "PAR024", name: "Potassium (K)", unit: "mEq/L", referenceRange: "3.5 - 5.1", method: "ISE" },
      { id: "PAR025", name: "Chloride (Cl)", unit: "mEq/L", referenceRange: "98 - 106", method: "ISE" },
    ], isActive: true,
  },
  {
    id: "TST008", name: "Calcium (Serum)", code: "CALCIUM", category: "Biochemistry", department: "Biochemistry",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR026", name: "Total Calcium", unit: "mg/dL", referenceRange: "8.5 - 10.5", method: "Arsenazo" },
    ], isActive: true,
  },
  {
    id: "TST009", name: "Phosphorus (Serum)", code: "PHOS", category: "Biochemistry", department: "Biochemistry",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR027", name: "Inorganic Phosphorus", unit: "mg/dL", referenceRange: "2.5 - 4.5", method: "Phosphomolybdate" },
    ], isActive: true,
  },
  {
    id: "TST010", name: "Iron Studies", code: "IRON", category: "Biochemistry", department: "Biochemistry",
    price: 550, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR028", name: "Serum Iron", unit: "µg/dL", referenceRange: "60 - 170", method: "Ferrozine" },
      { id: "PAR029", name: "TIBC", unit: "µg/dL", referenceRange: "250 - 450", method: "Calculated" },
      { id: "PAR030", name: "Transferrin Saturation", unit: "%", referenceRange: "20 - 50", method: "Calculated" },
    ], isActive: true,
  },
  {
    id: "TST011", name: "Ferritin", code: "FERRITIN", category: "Biochemistry", department: "Biochemistry",
    price: 600, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR031", name: "Ferritin", unit: "ng/mL", referenceRange: "30 - 300", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST012", name: "Serum Protein Electrophoresis", code: "SPEP", category: "Biochemistry", department: "Biochemistry",
    price: 1200, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR032", name: "Total Protein", unit: "g/dL", referenceRange: "6.4 - 8.3", method: "Biuret" },
      { id: "PAR033", name: "Albumin", unit: "g/dL", referenceRange: "3.5 - 5.0", method: "Electrophoresis" },
      { id: "PAR034", name: "Alpha 1 Globulin", unit: "g/dL", referenceRange: "0.1 - 0.3", method: "Electrophoresis" },
      { id: "PAR035", name: "Alpha 2 Globulin", unit: "g/dL", referenceRange: "0.6 - 1.0", method: "Electrophoresis" },
      { id: "PAR036", name: "Beta Globulin", unit: "g/dL", referenceRange: "0.7 - 1.2", method: "Electrophoresis" },
      { id: "PAR037", name: "Gamma Globulin", unit: "g/dL", referenceRange: "0.7 - 1.6", method: "Electrophoresis" },
    ], isActive: true,
  },
  {
    id: "TST013", name: "C-Reactive Protein (CRP)", code: "CRP", category: "Biochemistry", department: "Biochemistry",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR038", name: "CRP", unit: "mg/L", referenceRange: "< 6", method: "Immunoturbidimetry" },
    ], isActive: true,
  },
  {
    id: "TST014", name: "Amylase (Serum)", code: "AMYLASE", category: "Biochemistry", department: "Biochemistry",
    price: 300, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR039", name: "Amylase", unit: "U/L", referenceRange: "28 - 100", method: "CNPG3" },
    ], isActive: true,
  },
  // Hematology
  {
    id: "TST015", name: "Complete Blood Count (CBC)", code: "CBC", category: "Hematology", department: "Hematology",
    price: 300, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR040", name: "Hemoglobin", unit: "g/dL", referenceRange: "13 - 17", method: "SLS" },
      { id: "PAR041", name: "Total WBC Count", unit: "cells/µL", referenceRange: "4000 - 11000", method: "Impedance" },
      { id: "PAR042", name: "RBC Count", unit: "million/µL", referenceRange: "4.5 - 5.5", method: "Impedance" },
      { id: "PAR043", name: "Hematocrit (HCT)", unit: "%", referenceRange: "40 - 50", method: "Calculated" },
      { id: "PAR044", name: "MCV", unit: "fL", referenceRange: "80 - 100", method: "Calculated" },
      { id: "PAR045", name: "MCH", unit: "pg", referenceRange: "27 - 32", method: "Calculated" },
      { id: "PAR046", name: "MCHC", unit: "g/dL", referenceRange: "32 - 36", method: "Calculated" },
      { id: "PAR047", name: "Platelet Count", unit: "/µL", referenceRange: "150000 - 400000", method: "Impedance" },
      { id: "PAR048", name: "Neutrophils", unit: "%", referenceRange: "40 - 80", method: "Flow Cytometry" },
      { id: "PAR049", name: "Lymphocytes", unit: "%", referenceRange: "20 - 40", method: "Flow Cytometry" },
      { id: "PAR050", name: "Monocytes", unit: "%", referenceRange: "2 - 10", method: "Flow Cytometry" },
      { id: "PAR051", name: "Eosinophils", unit: "%", referenceRange: "1 - 6", method: "Flow Cytometry" },
      { id: "PAR052", name: "Basophils", unit: "%", referenceRange: "0 - 2", method: "Flow Cytometry" },
    ], isActive: true,
  },
  {
    id: "TST016", name: "Peripheral Blood Smear", code: "PBS", category: "Hematology", department: "Hematology",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR053", name: "RBC Morphology", unit: "", referenceRange: "Normocytic Normochromic", method: "Microscopy" },
      { id: "PAR054", name: "WBC Morphology", unit: "", referenceRange: "Normal", method: "Microscopy" },
      { id: "PAR055", name: "Platelet Morphology", unit: "", referenceRange: "Adequate", method: "Microscopy" },
    ], isActive: true,
  },
  {
    id: "TST017", name: "ESR (Erythrocyte Sedimentation Rate)", code: "ESR", category: "Hematology", department: "Hematology",
    price: 150, turnaroundTime: "2 hours",
    parameters: [
      { id: "PAR056", name: "ESR", unit: "mm/hr", referenceRange: "0 - 20", method: "Westergren" },
    ], isActive: true,
  },
  {
    id: "TST018", name: "PT/INR (Prothrombin Time)", code: "PTINR", category: "Hematology", department: "Hematology",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR057", name: "Prothrombin Time", unit: "sec", referenceRange: "11 - 15", method: "Turbidimetric" },
      { id: "PAR058", name: "INR", unit: "", referenceRange: "0.8 - 1.2", method: "Calculated" },
    ], isActive: true,
  },
  {
    id: "TST019", name: "APTT (Activated Partial Thromboplastin Time)", code: "APTT", category: "Hematology", department: "Hematology",
    price: 400, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR059", name: "APTT", unit: "sec", referenceRange: "25 - 35", method: "Turbidimetric" },
    ], isActive: true,
  },
  // Microbiology
  {
    id: "TST020", name: "Urine Routine & Microscopy", code: "URINE", category: "Clinical Pathology", department: "Microbiology",
    price: 150, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR060", name: "Color", unit: "", referenceRange: "Pale Yellow", method: "Visual" },
      { id: "PAR061", name: "Appearance", unit: "", referenceRange: "Clear", method: "Visual" },
      { id: "PAR062", name: "pH", unit: "", referenceRange: "4.5 - 8.0", method: "Dipstick" },
      { id: "PAR063", name: "Specific Gravity", unit: "", referenceRange: "1.005 - 1.030", method: "Refractometer" },
      { id: "PAR064", name: "Protein", unit: "", referenceRange: "Negative", method: "Dipstick" },
      { id: "PAR065", name: "Glucose", unit: "", referenceRange: "Negative", method: "Dipstick" },
      { id: "PAR066", name: "Ketones", unit: "", referenceRange: "Negative", method: "Dipstick" },
      { id: "PAR067", name: "Blood", unit: "", referenceRange: "Negative", method: "Dipstick" },
      { id: "PAR068", name: "Pus Cells", unit: "/HPF", referenceRange: "0 - 5", method: "Microscopy" },
      { id: "PAR069", name: "Epithelial Cells", unit: "/HPF", referenceRange: "0 - 5", method: "Microscopy" },
      { id: "PAR070", name: "RBC", unit: "/HPF", referenceRange: "0 - 2", method: "Microscopy" },
      { id: "PAR071", name: "Crystals", unit: "", referenceRange: "Negative", method: "Microscopy" },
    ], isActive: true,
  },
  {
    id: "TST021", name: "Urine Culture & Sensitivity", code: "UCS", category: "Microbiology", department: "Microbiology",
    price: 450, turnaroundTime: "72 hours",
    parameters: [
      { id: "PAR072", name: "Organism Isolated", unit: "", referenceRange: "No growth", method: "Culture" },
      { id: "PAR073", name: "Colony Count", unit: "CFU/mL", referenceRange: "< 10^4", method: "Culture" },
      { id: "PAR074", name: "Sensitivity Pattern", unit: "", referenceRange: "Sensitive", method: "Kirby-Bauer" },
    ], isActive: true,
  },
  {
    id: "TST022", name: "Widal Test (Typhoid)", code: "WIDAL", category: "Microbiology", department: "Microbiology",
    price: 300, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR075", name: "S. Typhi O", unit: "titer", referenceRange: "< 1:80", method: "Tube Agglutination" },
      { id: "PAR076", name: "S. Typhi H", unit: "titer", referenceRange: "< 1:160", method: "Tube Agglutination" },
      { id: "PAR077", name: "S. Paratyphi AH", unit: "titer", referenceRange: "< 1:80", method: "Tube Agglutination" },
      { id: "PAR078", name: "S. Paratyphi BH", unit: "titer", referenceRange: "< 1:80", method: "Tube Agglutination" },
    ], isActive: true,
  },
  {
    id: "TST023", name: "Malaria Antigen Test", code: "MALARIA", category: "Microbiology", department: "Microbiology",
    price: 350, turnaroundTime: "2 hours",
    parameters: [
      { id: "PAR079", name: "P. falciparum HRP2", unit: "", referenceRange: "Negative", method: "RDT" },
      { id: "PAR080", name: "Pan Malaria Antigen", unit: "", referenceRange: "Negative", method: "RDT" },
    ], isActive: true,
  },
  {
    id: "TST024", name: "Dengue NS1 Antigen", code: "DENGUE", category: "Microbiology", department: "Microbiology",
    price: 500, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR081", name: "NS1 Antigen", unit: "", referenceRange: "Negative", method: "ELISA" },
      { id: "PAR082", name: "IgM Antibodies", unit: "", referenceRange: "Negative", method: "ELISA" },
      { id: "PAR083", name: "IgG Antibodies", unit: "", referenceRange: "Negative", method: "ELISA" },
    ], isActive: true,
  },
  // Immunology
  {
    id: "TST025", name: "Thyroid Profile (T3, T4, TSH)", code: "THYROID", category: "Endocrinology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR084", name: "TSH", unit: "µIU/mL", referenceRange: "0.4 - 4.5", method: "CLIA" },
      { id: "PAR085", name: "T3 (Free)", unit: "pg/mL", referenceRange: "2.3 - 4.2", method: "CLIA" },
      { id: "PAR086", name: "T4 (Free)", unit: "ng/dL", referenceRange: "0.8 - 1.8", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST026", name: "Vitamin D (25-OH)", code: "VITD", category: "Biochemistry", department: "Immunology",
    price: 800, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR087", name: "25-OH Vitamin D", unit: "ng/mL", referenceRange: "30 - 100", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST027", name: "Vitamin B12", code: "VITB12", category: "Biochemistry", department: "Immunology",
    price: 700, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR088", name: "Vitamin B12", unit: "pg/mL", referenceRange: "200 - 900", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST028", name: "HBsAg (Hepatitis B Surface Antigen)", code: "HBSAG", category: "Microbiology", department: "Immunology",
    price: 400, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR089", name: "HBsAg", unit: "", referenceRange: "Non-reactive", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST029", name: "Anti-HCV (Hepatitis C Antibody)", code: "HCV", category: "Microbiology", department: "Immunology",
    price: 500, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR090", name: "Anti-HCV", unit: "", referenceRange: "Non-reactive", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST030", name: "HIV 1&2 Antibody Test", code: "HIV", category: "Microbiology", department: "Immunology",
    price: 450, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR091", name: "HIV 1&2 Antibodies", unit: "", referenceRange: "Non-reactive", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST031", name: "RA Factor", code: "RA", category: "Immunology", department: "Immunology",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR092", name: "Rheumatoid Factor", unit: "IU/mL", referenceRange: "< 15", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST032", name: "Anti-CCP Antibody", code: "ANTICCP", category: "Immunology", department: "Immunology",
    price: 800, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR093", name: "Anti-CCP", unit: "U/mL", referenceRange: "< 5", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST033", name: "ANA (Antinuclear Antibody)", code: "ANA", category: "Immunology", department: "Immunology",
    price: 1000, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR094", name: "ANA", unit: "", referenceRange: "Negative", method: "IFA" },
      { id: "PAR095", name: "Pattern", unit: "", referenceRange: "N/A", method: "IFA" },
    ], isActive: true,
  },
  // Endocrinology
  {
    id: "TST034", name: "Free T3", code: "FT3", category: "Endocrinology", department: "Immunology",
    price: 350, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR096", name: "Free T3", unit: "pg/mL", referenceRange: "2.3 - 4.2", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST035", name: "Free T4", code: "FT4", category: "Endocrinology", department: "Immunology",
    price: 350, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR097", name: "Free T4", unit: "ng/dL", referenceRange: "0.8 - 1.8", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST036", name: "TSH (Ultrasensitive)", code: "TSH", category: "Endocrinology", department: "Immunology",
    price: 300, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR098", name: "TSH", unit: "µIU/mL", referenceRange: "0.4 - 4.5", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST037", name: "Prolactin", code: "PRL", category: "Endocrinology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR099", name: "Prolactin", unit: "ng/mL", referenceRange: "2.5 - 17 (M) / 4.8 - 23 (F)", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST038", name: "LH (Luteinizing Hormone)", code: "LH", category: "Endocrinology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR100", name: "LH", unit: "mIU/mL", referenceRange: "1.5 - 9.3 (M) / Follicular 2-12", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST039", name: "FSH (Follicle Stimulating Hormone)", code: "FSH", category: "Endocrinology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR101", name: "FSH", unit: "mIU/mL", referenceRange: "1.4 - 18 (M) / Follicular 3-12", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST040", name: "Cortisol (Morning)", code: "CORTISOL", category: "Endocrinology", department: "Immunology",
    price: 600, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR102", name: "Cortisol", unit: "µg/dL", referenceRange: "6 - 23", method: "CLIA" },
    ], isActive: true,
  },
  // Molecular Biology
  {
    id: "TST041", name: "COVID-19 RT-PCR", code: "COV19", category: "Molecular Biology", department: "Molecular Biology",
    price: 500, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR103", name: "SARS-CoV-2 (ORF1ab)", unit: "", referenceRange: "Not Detected", method: "RT-PCR" },
      { id: "PAR104", name: "SARS-CoV-2 (N Gene)", unit: "", referenceRange: "Not Detected", method: "RT-PCR" },
    ], isActive: true,
  },
  {
    id: "TST042", name: "Tuberculosis GeneXpert", code: "TBXPRT", category: "Molecular Biology", department: "Molecular Biology",
    price: 1500, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR105", name: "MTB Detected", unit: "", referenceRange: "Not Detected", method: "GeneXpert" },
      { id: "PAR106", name: "Rifampicin Resistance", unit: "", referenceRange: "Not Detected", method: "GeneXpert" },
    ], isActive: true,
  },
  {
    id: "TST043", name: "Hb Electrophoresis", code: "HBELEC", category: "Molecular Biology", department: "Molecular Biology",
    price: 1000, turnaroundTime: "24 hours",
    parameters: [
      { id: "PAR107", name: "HbA", unit: "%", referenceRange: "95 - 98", method: "HPLC" },
      { id: "PAR108", name: "HbA2", unit: "%", referenceRange: "2 - 3.5", method: "HPLC" },
      { id: "PAR109", name: "HbF", unit: "%", referenceRange: "< 1", method: "HPLC" },
    ], isActive: true,
  },
  // Histopathology
  {
    id: "TST044", name: "FNAC (Fine Needle Aspiration Cytology)", code: "FNAC", category: "Histopathology", department: "Histopathology",
    price: 800, turnaroundTime: "48 hours",
    parameters: [
      { id: "PAR110", name: "Cellularity", unit: "", referenceRange: "Adequate", method: "Microscopy" },
      { id: "PAR111", name: "Diagnosis", unit: "", referenceRange: "Negative for malignancy", method: "Microscopy" },
    ], isActive: true,
  },
  {
    id: "TST045", name: "Biopsy (Histopathology)", code: "BIOPSY", category: "Histopathology", department: "Histopathology",
    price: 2000, turnaroundTime: "72 hours",
    parameters: [
      { id: "PAR112", name: "Gross Description", unit: "", referenceRange: "Received in formalin", method: "Gross" },
      { id: "PAR113", name: "Histological Diagnosis", unit: "", referenceRange: "Benign", method: "Microscopy" },
    ], isActive: true,
  },
  {
    id: "TST046", name: "Pap Smear", code: "PAP", category: "Histopathology", department: "Histopathology",
    price: 500, turnaroundTime: "48 hours",
    parameters: [
      { id: "PAR114", name: "Cellular Composition", unit: "", referenceRange: "Satisfactory", method: "Microscopy" },
      { id: "PAR115", name: "Epithelial Abnormalities", unit: "", referenceRange: "Negative", method: "Bethesda" },
    ], isActive: true,
  },
  // More tests to reach 80+
  {
    id: "TST047", name: "Creatine Kinase (CK-MB)", code: "CKMB", category: "Biochemistry", department: "Biochemistry",
    price: 450, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR116", name: "CK-MB", unit: "U/L", referenceRange: "< 25", method: "IFCC" },
    ], isActive: true,
  },
  {
    id: "TST048", name: "Troponin I (High Sensitivity)", code: "TROP", category: "Biochemistry", department: "Biochemistry",
    price: 900, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR117", name: "hs-Troponin I", unit: "ng/L", referenceRange: "< 34", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST049", name: "D-Dimer", code: "DDIMER", category: "Hematology", department: "Hematology",
    price: 600, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR118", name: "D-Dimer", unit: "ng/mL FEU", referenceRange: "< 500", method: "Immunoturbidimetry" },
    ], isActive: true,
  },
  {
    id: "TST050", name: "Blood Culture & Sensitivity", code: "BCS", category: "Microbiology", department: "Microbiology",
    price: 600, turnaroundTime: "96 hours",
    parameters: [
      { id: "PAR119", name: "Organism Isolated", unit: "", referenceRange: "No growth", method: "Culture" },
      { id: "PAR120", name: "Antibiotic Sensitivity", unit: "", referenceRange: "Sensitive", method: "VITEK" },
    ], isActive: true,
  },
  {
    id: "TST051", name: "Sputum Culture & Sensitivity", code: "SPUTUM", category: "Microbiology", department: "Microbiology",
    price: 450, turnaroundTime: "72 hours",
    parameters: [
      { id: "PAR121", name: "Organism Isolated", unit: "", referenceRange: "Normal flora", method: "Culture" },
    ], isActive: true,
  },
  {
    id: "TST052", name: "CA 125 (Cancer Antigen 125)", code: "CA125", category: "Immunology", department: "Immunology",
    price: 900, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR122", name: "CA 125", unit: "U/mL", referenceRange: "< 35", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST053", name: "CA 19-9", code: "CA199", category: "Immunology", department: "Immunology",
    price: 1000, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR123", name: "CA 19-9", unit: "U/mL", referenceRange: "< 37", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST054", name: "CEA (Carcinoembryonic Antigen)", code: "CEA", category: "Immunology", department: "Immunology",
    price: 800, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR124", name: "CEA", unit: "ng/mL", referenceRange: "< 5", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST055", name: "AFP (Alpha Fetoprotein)", code: "AFP", category: "Immunology", department: "Immunology",
    price: 800, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR125", name: "AFP", unit: "ng/mL", referenceRange: "< 10", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST056", name: "PSA (Prostate Specific Antigen) Total", code: "PSA", category: "Immunology", department: "Immunology",
    price: 600, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR126", name: "PSA Total", unit: "ng/mL", referenceRange: "< 4", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST057", name: "Free PSA", code: "FPSA", category: "Immunology", department: "Immunology",
    price: 700, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR127", name: "Free PSA", unit: "ng/mL", referenceRange: "< 1", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST058", name: "Magnesium (Serum)", code: "MG", category: "Biochemistry", department: "Biochemistry",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR128", name: "Magnesium", unit: "mg/dL", referenceRange: "1.7 - 2.4", method: "Xylidyl Blue" },
    ], isActive: true,
  },
  {
    id: "TST059", name: "Lactate Dehydrogenase (LDH)", code: "LDH", category: "Biochemistry", department: "Biochemistry",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR129", name: "LDH", unit: "U/L", referenceRange: "140 - 280", method: "DGKC" },
    ], isActive: true,
  },
  {
    id: "TST060", name: "Gamma-GT (GGT)", code: "GGT", category: "Biochemistry", department: "Biochemistry",
    price: 300, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR130", name: "GGT", unit: "U/L", referenceRange: "10 - 60", method: "Szasz" },
    ], isActive: true,
  },
  {
    id: "TST061", name: "Uric Acid (24 hr Urine)", code: "UA24", category: "Biochemistry", department: "Biochemistry",
    price: 350, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR131", name: "Uric Acid (24h)", unit: "mg/24h", referenceRange: "250 - 750", method: "Uricase" },
    ], isActive: true,
  },
  {
    id: "TST062", name: "Microalbumin (Urine)", code: "MALB", category: "Biochemistry", department: "Biochemistry",
    price: 250, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR132", name: "Microalbumin", unit: "mg/L", referenceRange: "< 30", method: "Immunoturbidimetry" },
    ], isActive: true,
  },
  {
    id: "TST063", name: "Beta-hCG (Quantitative)", code: "BHCG", category: "Endocrinology", department: "Immunology",
    price: 500, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR133", name: "Beta-hCG", unit: "mIU/mL", referenceRange: "< 5 (Non-pregnant)", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST064", name: "Testosterone (Total)", code: "TESTO", category: "Endocrinology", department: "Immunology",
    price: 600, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR134", name: "Testosterone Total", unit: "ng/dL", referenceRange: "250 - 1000 (M) / 15 - 70 (F)", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST065", name: "Progesterone", code: "PROG", category: "Endocrinology", department: "Immunology",
    price: 600, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR135", name: "Progesterone", unit: "ng/mL", referenceRange: "Follicular: < 1.0, Luteal: 3-25", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST066", name: "Estradiol (E2)", code: "E2", category: "Endocrinology", department: "Immunology",
    price: 600, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR136", name: "Estradiol", unit: "pg/mL", referenceRange: "Follicular: 20-120", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST067", name: "IgE (Total)", code: "IGE", category: "Immunology", department: "Immunology",
    price: 500, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR137", name: "IgE Total", unit: "IU/mL", referenceRange: "< 100", method: "CLIA" },
    ], isActive: true,
  },
  {
    id: "TST068", name: "VDRL/RPR (Syphilis)", code: "VDRL", category: "Microbiology", department: "Microbiology",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR138", name: "VDRL", unit: "", referenceRange: "Non-reactive", method: "Flocculation" },
    ], isActive: true,
  },
  {
    id: "TST069", name: "ASO (Anti-Streptolysin O) Titre", code: "ASO", category: "Microbiology", department: "Microbiology",
    price: 350, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR139", name: "ASO Titre", unit: "IU/mL", referenceRange: "< 200", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST070", name: "H. pylori Stool Antigen", code: "HPYLO", category: "Microbiology", department: "Microbiology",
    price: 500, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR140", name: "H. pylori Antigen", unit: "", referenceRange: "Negative", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST071", name: "Reticulocyte Count", code: "RETIC", category: "Hematology", department: "Hematology",
    price: 250, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR141", name: "Reticulocytes", unit: "%", referenceRange: "0.5 - 2.5", method: "Flow Cytometry" },
    ], isActive: true,
  },
  {
    id: "TST072", name: "Fibrinogen", code: "FIB", category: "Hematology", department: "Hematology",
    price: 400, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR142", name: "Fibrinogen", unit: "mg/dL", referenceRange: "200 - 400", method: "Clauss" },
    ], isActive: true,
  },
  {
    id: "TST073", name: "Stool Routine & Microscopy", code: "STOOL", category: "Clinical Pathology", department: "Clinical Pathology",
    price: 150, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR143", name: "Color", unit: "", referenceRange: "Brown", method: "Visual" },
      { id: "PAR144", name: "Consistency", unit: "", referenceRange: "Formed", method: "Visual" },
      { id: "PAR145", name: "Pus Cells", unit: "/HPF", referenceRange: "0 - 2", method: "Microscopy" },
      { id: "PAR146", name: "RBC", unit: "/HPF", referenceRange: "0", method: "Microscopy" },
      { id: "PAR147", name: "Ova/Cysts", unit: "", referenceRange: "Nil", method: "Microscopy" },
    ], isActive: true,
  },
  {
    id: "TST074", name: "Occult Blood (Stool/FIT)", code: "FOB", category: "Clinical Pathology", department: "Clinical Pathology",
    price: 200, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR148", name: "Occult Blood", unit: "", referenceRange: "Negative", method: "Immunochromatography" },
    ], isActive: true,
  },
  {
    id: "TST075", name: "Semen Analysis", code: "SEMEN", category: "Clinical Pathology", department: "Clinical Pathology",
    price: 400, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR149", name: "Volume", unit: "mL", referenceRange: "1.5 - 5.0", method: "WHO" },
      { id: "PAR150", name: "Sperm Count", unit: "million/mL", referenceRange: "15 - 200", method: "Microscopy" },
      { id: "PAR151", name: "Motility (Progressive)", unit: "%", referenceRange: "> 32", method: "Microscopy" },
      { id: "PAR152", name: "Normal Morphology", unit: "%", referenceRange: "> 4", method: "Strict Criteria" },
    ], isActive: true,
  },
  {
    id: "TST076", name: "CRP (High Sensitivity)", code: "HSCRP", category: "Biochemistry", department: "Biochemistry",
    price: 500, turnaroundTime: "4 hours",
    parameters: [
      { id: "PAR153", name: "hs-CRP", unit: "mg/L", referenceRange: "< 2", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST077", name: "Homocysteine", code: "HCY", category: "Biochemistry", department: "Biochemistry",
    price: 900, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR154", name: "Homocysteine", unit: "µmol/L", referenceRange: "5 - 15", method: "Enzymatic" },
    ], isActive: true,
  },
  {
    id: "TST078", name: "Lipoprotein (a)", code: "LPA", category: "Biochemistry", department: "Biochemistry",
    price: 700, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR155", name: "Lipoprotein (a)", unit: "mg/dL", referenceRange: "< 30", method: "Immunoturbidimetry" },
    ], isActive: true,
  },
  {
    id: "TST079", name: "Apolipoprotein A1 & B", code: "APO", category: "Biochemistry", department: "Biochemistry",
    price: 800, turnaroundTime: "8 hours",
    parameters: [
      { id: "PAR156", name: "Apo A1", unit: "mg/dL", referenceRange: "115 - 220", method: "Immunoturbidimetry" },
      { id: "PAR157", name: "Apo B", unit: "mg/dL", referenceRange: "60 - 140", method: "Immunoturbidimetry" },
    ], isActive: true,
  },
  {
    id: "TST080", name: "IgG (Immunoglobulin G)", code: "IGG", category: "Immunology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR158", name: "IgG", unit: "mg/dL", referenceRange: "700 - 1600", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST081", name: "IgA (Immunoglobulin A)", code: "IGA", category: "Immunology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR159", name: "IgA", unit: "mg/dL", referenceRange: "70 - 400", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST082", name: "IgM (Immunoglobulin M)", code: "IGM", category: "Immunology", department: "Immunology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR160", name: "IgM", unit: "mg/dL", referenceRange: "40 - 230", method: "Nephelometry" },
    ], isActive: true,
  },
  {
    id: "TST083", name: "Chikungunya IgM Antibody", code: "CHIKV", category: "Microbiology", department: "Microbiology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR161", name: "Chikungunya IgM", unit: "", referenceRange: "Negative", method: "ELISA" },
    ], isActive: true,
  },
  {
    id: "TST084", name: "Leptospira IgM", code: "LEPTO", category: "Microbiology", department: "Microbiology",
    price: 500, turnaroundTime: "6 hours",
    parameters: [
      { id: "PAR162", name: "Leptospira IgM", unit: "", referenceRange: "Negative", method: "ELISA" },
    ], isActive: true,
  },
]

export const testPackages: TestPackage[] = [
  {
    id: "PKG001",
    name: "Master Health Checkup",
    code: "MHC",
    description: "Comprehensive health screening with 80+ parameters including CBC, LFT, KFT, Lipid Profile, Thyroid, and more",
    tests: ["TST001", "TST002", "TST003", "TST004", "TST005", "TST006", "TST007", "TST015", "TST017", "TST020", "TST025", "TST026"],
    price: 3500,
    discountedPrice: 2499,
    isActive: true,
  },
  {
    id: "PKG002",
    name: "Diabetes Care Package",
    code: "DIACARE",
    description: "Complete diabetes monitoring with FBS, PPBS, HbA1c, Lipid Profile, KFT, Urine Microalbumin",
    tests: ["TST001", "TST002", "TST003", "TST004", "TST006", "TST062"],
    price: 2200,
    discountedPrice: 1599,
    isActive: true,
  },
  {
    id: "PKG003",
    name: "Cardiac Risk Assessment",
    code: "CARDIAC",
    description: "Heart health checkup with Lipid Profile, hs-CRP, Homocysteine, Lp(a), ECG interpretation",
    tests: ["TST004", "TST047", "TST048", "TST076", "TST077", "TST078", "TST079", "TST018"],
    price: 3500,
    discountedPrice: 2799,
    isActive: true,
  },
  {
    id: "PKG004",
    name: "Women's Health Package",
    code: "WOMEN",
    description: "Comprehensive wellness for women including CBC, Thyroid, Iron Studies, Vitamin D, Pap Smear",
    tests: ["TST015", "TST025", "TST010", "TST026", "TST027", "TST046", "TST052", "TST063"],
    price: 4000,
    discountedPrice: 2999,
    isActive: true,
  },
  {
    id: "PKG005",
    name: "Liver Health Package",
    code: "LIVER",
    description: "Complete liver function assessment with LFT, PT/INR, Viral Markers, Ultrasound screening",
    tests: ["TST005", "TST018", "TST028", "TST029", "TST059", "TST060", "TST073"],
    price: 2500,
    discountedPrice: 1999,
    isActive: true,
  },
  {
    id: "PKG006",
    name: "Thyroid Function Package",
    code: "THYROID",
    description: "Full thyroid assessment with TSH, Free T3, Free T4, Anti-TPO Antibodies",
    tests: ["TST025", "TST034", "TST035", "TST036"],
    price: 1500,
    discountedPrice: 999,
    isActive: true,
  },
  {
    id: "PKG007",
    name: "Anemia Profile",
    code: "ANEMIA",
    description: "Complete anemia workup with CBC, Iron Studies, Ferritin, Vitamin B12, Folate",
    tests: ["TST015", "TST010", "TST011", "TST027"],
    price: 2000,
    discountedPrice: 1499,
    isActive: true,
  },
  {
    id: "PKG008",
    name: "Fever Panel (Basic)",
    code: "FEVER",
    description: "Basic fever workup including CBC, Malaria, Typhoid, Dengue, Urinalysis",
    tests: ["TST015", "TST017", "TST022", "TST023", "TST024", "TST020"],
    price: 1800,
    discountedPrice: 1299,
    isActive: true,
  },
  {
    id: "PKG009",
    name: "Senior Citizen Health Checkup",
    code: "SENIOR",
    description: "Health screening for ages 60+ including all major organ function tests, cancer markers",
    tests: ["TST015", "TST001", "TST003", "TST004", "TST005", "TST006", "TST026", "TST027", "TST048", "TST056", "TST052"],
    price: 5000,
    discountedPrice: 3999,
    isActive: true,
  },
  {
    id: "PKG010",
    name: "Wellness Pro Package",
    code: "WELLPRO",
    description: "Executive health checkup for professionals - covers all vital parameters",
    tests: ["TST015", "TST001", "TST004", "TST005", "TST006", "TST007", "TST025", "TST026", "TST027", "TST031", "TST013", "TST020", "TST017"],
    price: 5500,
    discountedPrice: 4499,
    isActive: true,
  },
]
