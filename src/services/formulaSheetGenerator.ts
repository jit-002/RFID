// High-Resolution Educational Formula Sheet Canvas Renderer
// Supports multiple subjects:
// - Mathematics: Class 11 Matrices, Class 12 Integration, Class 12 Differentiation
// - Chemistry: Class 12 Alcohols, Phenols, Ethers & Organic Reactions
// - Physics: Class 12 Electrostatics & Current Electricity
// Supports two visual styles:
// 1. "handwritten": Authentic student notes on ruled notebook paper in fountain pen ink, zero corporate branding
// 2. "digital": Sleek modern high-contrast dark canvas reference sheet

export interface FormulaSection {
  title: string;
  badge?: string;
  formulas: Array<{ label: string; formula: string }>;
}

export type SubjectCategory = 'chemistry' | 'mathematics' | 'physics' | 'general';
export type VisualStyle = 'handwritten' | 'digital';

export interface SubjectDetectionResult {
  subject: SubjectCategory;
  topic: string;
  classLevel: string;
  isHandwritten: boolean;
}

export function detectFormulaSubjectAndStyle(query: string): SubjectDetectionResult {
  const q = query.toLowerCase();

  const isHandwritten = (
    q.includes('handwritten') ||
    q.includes('notebook') ||
    q.includes('student note') ||
    q.includes('student notes') ||
    q.includes('pen and paper') ||
    q.includes('hand written') ||
    q.includes('ruled sheet') ||
    q.includes('handwriting')
  );

  // Extract Class level
  let classLevel = 'Class 12';
  if (q.includes('class 11') || q.includes('11th') || q.includes('class xi') || q.includes('grade 11')) {
    classLevel = 'Class 11';
  } else if (q.includes('class 12') || q.includes('12th') || q.includes('class xii') || q.includes('grade 12')) {
    classLevel = 'Class 12';
  }

  // 1. Chemistry Detection
  if (
    q.includes('alcohol') ||
    q.includes('phenol') ||
    q.includes('ether') ||
    q.includes('organic') ||
    q.includes('aldehyde') ||
    q.includes('ketone') ||
    q.includes('carboxylic') ||
    q.includes('amine') ||
    q.includes('chemistry') ||
    q.includes('lucas') ||
    q.includes('esterification') ||
    q.includes('chemical reaction') ||
    q.includes('grignard')
  ) {
    let topic = 'Alcohols, Phenols & Ethers';
    if (q.includes('alcohol') && !q.includes('phenol')) topic = 'Alcohols & Their Reactions';
    else if (q.includes('organic')) topic = 'Organic Chemistry Reactions';
    return { subject: 'chemistry', topic, classLevel: 'Class 12', isHandwritten };
  }

  // 2. Physics Detection
  if (
    q.includes('physics') ||
    q.includes('electrostatic') ||
    q.includes('electric field') ||
    q.includes('optics') ||
    q.includes('current electricity') ||
    q.includes('capacitance') ||
    q.includes('coulomb')
  ) {
    return { subject: 'physics', topic: 'Electrostatics & Current Electricity', classLevel: 'Class 12', isHandwritten };
  }

  // 3. Mathematics Detection - Specific Topics First!
  if (q.includes('relation') || q.includes('function')) {
    return { subject: 'mathematics', topic: 'Relations and Functions', classLevel: 'Class 12', isHandwritten };
  }

  if (q.includes('determinant')) {
    return { subject: 'mathematics', topic: 'Determinants', classLevel: 'Class 12', isHandwritten };
  }

  if (q.includes('matri')) {
    return { subject: 'mathematics', topic: 'Matrices', classLevel: q.includes('12') ? 'Class 12' : 'Class 11', isHandwritten };
  }

  if (
    q.includes('differentiation') ||
    q.includes('derivative') ||
    q.includes('d/dx')
  ) {
    return { subject: 'mathematics', topic: 'Differentiation', classLevel: 'Class 12', isHandwritten };
  }

  if (
    q.includes('integration') ||
    q.includes('integral') ||
    q.includes('integrate') ||
    q.includes('∫') ||
    q.includes(' dx') ||
    q.includes('calculus')
  ) {
    return { subject: 'mathematics', topic: 'Integration', classLevel: 'Class 12', isHandwritten };
  }

  // Default Mathematics
  return { subject: 'mathematics', topic: 'Mathematics', classLevel, isHandwritten };
}

export function isFormulaSheetQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('formula') ||
    q.includes('formulas') ||
    q.includes('cheat sheet') ||
    q.includes('revision sheet') ||
    q.includes('equations sheet') ||
    q.includes('reaction sheet') ||
    (q.includes('sheet') && (q.includes('alcohol') || q.includes('integration') || q.includes('physics') || q.includes('matri') || q.includes('determinant')))
  );
}

// Data: Class 11 Mathematics — Matrices & Determinants Formulas
export function getMatricesFormulaData(classLevel: string = 'Class 11'): FormulaSection[] {
  return [
    {
      title: "1. Definition, Order & Types of Matrices",
      badge: "Foundations",
      formulas: [
        { label: "Matrix Order (m × n)", formula: "A = [aᵢⱼ]ₘₓₙ  (m rows, n columns; total m·n elements)" },
        { label: "Row & Column Matrix", formula: "Row: [1 × n] e.g. [1 2 3]  |  Column: [m × 1] vertical array" },
        { label: "Square & Diagonal Matrix", formula: "Square: m = n  |  Diagonal: aᵢⱼ = 0 for all i ≠ j" },
        { label: "Scalar & Identity Matrix (I)", formula: "Scalar: diagonal elements equal k  |  Identity: Iₙ has aᵢᵢ = 1, aᵢⱼ = 0" },
        { label: "Zero / Null Matrix (O)", formula: "Oₘₓₙ has all entries equal to 0" }
      ]
    },
    {
      title: "2. Matrix Algebra & Operations",
      badge: "Operations",
      formulas: [
        { label: "Equality of Matrices", formula: "A = B ⟺ Same order m × n and aᵢⱼ = bᵢⱼ for all i, j" },
        { label: "Addition & Subtraction", formula: "A ± B = [aᵢⱼ ± bᵢⱼ]  (Only defined for identical orders)" },
        { label: "Properties of Addition", formula: "Commutative: A + B = B + A  |  Associative: (A + B) + C = A + (B + C)" },
        { label: "Scalar Multiplication", formula: "k·A = [k·aᵢⱼ]  (Every entry is multiplied by scalar k)" },
        { label: "Matrix Product Condition", formula: "Aₘₓₙ × Bₙₓₚ = Cₘₓₚ  (Columns of A must equal Rows of B)" },
        { label: "Non-Commutative Rule", formula: "In general, AB ≠ BA  (Matrix multiplication does NOT commute!)" }
      ]
    },
    {
      title: "3. Transpose of a Matrix & Properties",
      badge: "Transpose",
      formulas: [
        { label: "Transpose Definition", formula: "Aᵀ or A' : Interchanging rows & columns, (aᵢⱼ)ᵀ = aⱼᵢ" },
        { label: "Double Transpose", formula: "(Aᵀ)ᵀ = A" },
        { label: "Scalar & Sum Transpose", formula: "(kA)ᵀ = k·Aᵀ  |  (A + B)ᵀ = Aᵀ + Bᵀ" },
        { label: "Reversal Law for Products", formula: "(AB)ᵀ = Bᵀ Aᵀ   [CRUCIAL CBSE & Competitive Rule]" },
        { label: "Multiple Product Transpose", formula: "(ABC)ᵀ = Cᵀ Bᵀ Aᵀ" }
      ]
    },
    {
      title: "4. Symmetric & Skew-Symmetric Matrices",
      badge: "Core Theorems",
      formulas: [
        { label: "Symmetric Matrix", formula: "A is Symmetric ⟺ Aᵀ = A  (i.e. aᵢⱼ = aⱼᵢ for all i, j)" },
        { label: "Skew-Symmetric Matrix", formula: "A is Skew-Symmetric ⟺ Aᵀ = -A  (i.e. aᵢⱼ = -aⱼᵢ)" },
        { label: "Diagonal of Skew-Symmetric", formula: "All principal diagonal elements are ZERO! (aᵢᵢ = 0)" },
        { label: "Theorem 1 (Sum & Diff)", formula: "For any square matrix A: (A + Aᵀ) is symmetric; (A - Aᵀ) is skew-symmetric" },
        { label: "Decomposition Theorem", formula: "A = ½(A + Aᵀ) + ½(A - Aᵀ)  [Unique sum of Symm & Skew-Symm]" }
      ]
    },
    {
      title: "5. Orthogonal Matrices & Invertibility",
      badge: "Special Types",
      formulas: [
        { label: "Orthogonal Matrix", formula: "A · Aᵀ = Aᵀ · A = Iₙ  (Columns & rows are orthonormal vectors)" },
        { label: "Determinant of Orthogonal", formula: "|A| = ±1  (Orthogonal transformation preserves length and angles)" },
        { label: "Idempotent Matrix", formula: "A² = A   (Eigenvalues can only be 0 or 1)" },
        { label: "Nilpotent Matrix", formula: "Aᵏ = O for some positive integer k (Index of nilpotency)" },
        { label: "Involutory Matrix", formula: "A² = Iₙ  (Self-inverse matrix: A⁻¹ = A)" }
      ]
    },
    {
      title: "6. Elementary Operations & Matrix Rank",
      badge: "Rank & Operations",
      formulas: [
        { label: "Row Interchanges", formula: "Rᵢ ⟷ Rⱼ  (Swapping row i and row j)" },
        { label: "Row Scaling", formula: "Rᵢ → k·Rᵢ   [k ≠ 0]" },
        { label: "Row Addition", formula: "Rᵢ → Rᵢ + k·Rⱼ   (Elementary row operations do not change rank)" },
        { label: "Matrix Rank ρ(A)", formula: "Number of non-zero rows in row-echelon form; ρ(Aₘₓₙ) ≤ min(m, n)" }
      ]
    }
  ];
}

// Data: Class 12 Mathematics — Relations and Functions Formulas
export function getRelationsAndFunctionsFormulaData(classLevel: string = 'Class 12'): FormulaSection[] {
  return [
    {
      title: "1. Types of Relations on a Set A",
      badge: "Core Relations",
      formulas: [
        { label: "Reflexive Relation", formula: "(a, a) ∈ R for every a ∈ A  (Every element relates to itself)" },
        { label: "Symmetric Relation", formula: "(a, b) ∈ R ⟹ (b, a) ∈ R for all a, b ∈ A" },
        { label: "Transitive Relation", formula: "(a, b) ∈ R and (b, c) ∈ R ⟹ (a, c) ∈ R for all a, b, c ∈ A" },
        { label: "Equivalence Relation", formula: "R is Reflexive, Symmetric, AND Transitive simultaneously" },
        { label: "Empty & Universal Relations", formula: "Empty: R = ∅ ⊂ A×A; Universal: R = A×A (Both are trivial relations)" }
      ]
    },
    {
      title: "2. Equivalence Classes & Partitions",
      badge: "Equivalence",
      formulas: [
        { label: "Equivalence Class [a]", formula: "[a] = {x ∈ A : (x, a) ∈ R}  (Set of all elements related to a)" },
        { label: "Disjoint Property", formula: "[a] ∩ [b] = ∅ if a and b are not related; [a] = [b] if (a, b) ∈ R" },
        { label: "Partition of A", formula: "⋃ [a] = A  (Equivalence classes form a mutually disjoint partition of A)" }
      ]
    },
    {
      title: "3. Types of Functions (Mappings)",
      badge: "Function Types",
      formulas: [
        { label: "One-One (Injective)", formula: "f(x₁) = f(x₂) ⟹ x₁ = x₂  (Distinct elements map to distinct images)" },
        { label: "Onto (Surjective)", formula: "Range(f) = Codomain(Y)  (Every y ∈ Y has a pre-image x s.t. f(x) = y)" },
        { label: "Bijective Function", formula: "f is BOTH Injective (One-One) AND Surjective (Onto)" },
        { label: "Invertibility Condition", formula: "A function f: A → B is invertible ⟺ f is Bijective (One-One & Onto)" }
      ]
    },
    {
      title: "4. Composition of Functions & Inverse",
      badge: "Composition",
      formulas: [
        { label: "Composite Function (g ∘ f)", formula: "(g ∘ f)(x) = g(f(x))   [Defined if Range(f) ⊆ Domain(g)]" },
        { label: "Identity Function", formula: "f ∘ f⁻¹ = I_B   and   f⁻¹ ∘ f = I_A   (Where I_A(x) = x)" },
        { label: "Reversal Rule of Inverse", formula: "(g ∘ f)⁻¹ = f⁻¹ ∘ g⁻¹   (Reversal rule of composite inverse)" },
        { label: "Associative Property", formula: "h ∘ (g ∘ f) = (h ∘ g) ∘ f   (Composition is always associative)" }
      ]
    },
    {
      title: "5. Counting Theorems (Combinatorics)",
      badge: "Formulas & Counts",
      formulas: [
        { label: "Total Relations (n(A)=m, n(B)=n)", formula: "Total relations from A to B = 2^(m · n); On set A = 2^(n²)" },
        { label: "Reflexive Relations on Set of size n", formula: "Number of reflexive relations = 2^(n(n - 1))" },
        { label: "Symmetric Relations on Set of size n", formula: "Number of symmetric relations = 2^(n(n + 1) / 2)" },
        { label: "Total Functions from A to B", formula: "Total functions = n^m  [n = |Codomain|, m = |Domain|]" },
        { label: "One-One Functions (n ≥ m)", formula: "Number of injective functions = ⁿPₘ = n! / (n - m)!  [0 if n < m]" },
        { label: "Bijective Functions (m = n)", formula: "Number of bijections on set of size n = n!" }
      ]
    }
  ];
}

// Data: Class 12 Mathematics — Determinants Formulas
export function getDeterminantsFormulaData(classLevel: string = 'Class 12'): FormulaSection[] {
  return [
    {
      title: "1. Definition & Expansion of Determinants",
      badge: "Foundations",
      formulas: [
        { label: "2 × 2 Determinant", formula: "|A| = |a₁₁ a₁₂ / a₂₁ a₂₂| = a₁₁·a₂₂ - a₁₂·a₂₁" },
        { label: "3 × 3 Expansion (Row 1)", formula: "|A| = a₁₁(a₂₂a₃₃ - a₂₃a₃₂) - a₁₂(a₂₁a₃₃ - a₂₃a₃₁) + a₁₃(a₂₁a₃₂ - a₂₂a₃₁)" },
        { label: "Singular Matrix Condition", formula: "Matrix A is Singular ⟺ |A| = 0  (Non-invertible; No inverse exists)" },
        { label: "Non-Singular Matrix", formula: "Matrix A is Non-Singular ⟺ |A| ≠ 0  (Invertible; A⁻¹ uniquely exists)" }
      ]
    },
    {
      title: "2. Crucial Properties of Determinants",
      badge: "CBSE Properties",
      formulas: [
        { label: "Transpose Invariance", formula: "|Aᵀ| = |A|  (Interchanging all rows and columns leaves |A| unchanged)" },
        { label: "Sign Change on Row Swap", formula: "Interchanging any two rows (or cols) reverses sign: |A'| = -|A|" },
        { label: "Identical Rows / Cols", formula: "If any two rows or columns are identical or proportional: |A| = 0" },
        { label: "Scalar Multiplication Rule", formula: "|k·A| = kⁿ · |A|   [where n is the order of square matrix A]" },
        { label: "Product Theorem", formula: "|A · B| = |A| · |B|   and   |Aᵏ| = |A|ᵏ" },
        { label: "Elementary Operations", formula: "Applying Rᵢ → Rᵢ + k·Rⱼ or Cᵢ → Cᵢ + k·Cⱼ does NOT change value of |A|" }
      ]
    },
    {
      title: "3. Minors & Cofactors (Mᵢⱼ & Aᵢⱼ)",
      badge: "Core Theory",
      formulas: [
        { label: "Minor (Mᵢⱼ)", formula: "Mᵢⱼ = Determinant obtained by deleting the i-th row and j-th column" },
        { label: "Cofactor (Aᵢⱼ)", formula: "Aᵢⱼ = (-1)ᶦ⁺ʲ · Mᵢⱼ   (Minor with position-dependent alternating sign)" },
        { label: "Determinant Expansion", formula: "|A| = aᵢ₁Aᵢ₁ + aᵢ₂Aᵢ₂ + aᵢ₃Aᵢ₃   (Sum of elements × their cofactors)" },
        { label: "Orthogonal Sum Theorem", formula: "aᵢ₁Aⱼ₁ + aᵢ₂Aⱼ₂ + aᵢ₃Aⱼ₃ = 0  for i ≠ j  [Elements × cofactors of other row = 0]" }
      ]
    },
    {
      title: "4. Area of Triangle via Determinants",
      badge: "Geometry",
      formulas: [
        { label: "Area Formula", formula: "Δ = ½ | |x₁ y₁ 1 / x₂ y₂ 1 / x₃ y₃ 1| |  (Always take absolute positive value)" },
        { label: "Condition of Collinearity", formula: "Three points (x₁,y₁), (x₂,y₂), (x₃,y₃) are collinear ⟺ Area Δ = 0" },
        { label: "Equation of Line", formula: "Line joining (x₁,y₁) & (x₂,y₂): |x y 1 / x₁ y₁ 1 / x₂ y₂ 1| = 0" }
      ]
    },
    {
      title: "5. Adjoint & Matrix Inverse Formula",
      badge: "Inverse Theory",
      formulas: [
        { label: "Adjoint Definition", formula: "adj(A) = [Aᵢⱼ]ᵀ  (Transpose of cofactor matrix [Aᵢⱼ])" },
        { label: "Fundamental Identity", formula: "A · adj(A) = adj(A) · A = |A| · Iₙ" },
        { label: "Matrix Inverse Formula", formula: "A⁻¹ = (1 / |A|) · adj(A)   [Valid if and only if |A| ≠ 0]" },
        { label: "Determinant of Adjoint", formula: "|adj(A)| = |A|ⁿ⁻¹   [where n is the order of square matrix A]" },
        { label: "Double Adjoint Property", formula: "|adj(adj A)| = |A|⁽ⁿ⁻¹⁾²   and   adj(adj A) = |A|ⁿ⁻² · A" },
        { label: "Inverse Reversal Rule", formula: "(A · B)⁻¹ = B⁻¹ · A⁻¹   and   (Aᵀ)⁻¹ = (A⁻¹)ᵀ" }
      ]
    },
    {
      title: "6. System of Linear Equations (Matrix Method)",
      badge: "Board Long-Ans",
      formulas: [
        { label: "Matrix Equation Form", formula: "A · X = B   ⟹   X = [x y z]ᵀ,  B = [d₁ d₂ d₃]ᵀ" },
        { label: "Unique Solution Case", formula: "If |A| ≠ 0 ⟹ System is Consistent with Unique Solution: X = A⁻¹·B" },
        { label: "Inconsistent Case (No Sol)", formula: "If |A| = 0 and (adj A)·B ≠ O  ⟹  System has NO solution (Inconsistent)" },
        { label: "Infinite Solutions Case", formula: "If |A| = 0 and (adj A)·B = O  ⟹  Consistent with Infinitely many solutions" }
      ]
    }
  ];
}

// Data: Chemistry Class 12 Alcohols, Phenols & Organic Reactions
export function getChemistryAlcoholsData(): FormulaSection[] {
  return [
    {
      title: "1. Classification & Key Compounds",
      badge: "Structure",
      formulas: [
        { label: "General Formula", formula: "CₙH₂ₙ₊₁OH  (Hydroxyl Group -OH bonded to sp³ hybridized C)" },
        { label: "Methanol", formula: "CH₃-OH  (Wood spirit, b.p. 337 K, oxidized to Methanal)" },
        { label: "Ethanol", formula: "CH₃-CH₂-OH  (Grain alcohol, b.p. 351 K, industrial solvent)" },
        { label: "Classes (1°, 2°, 3°)", formula: "Primary: R-CH₂OH  |  Secondary: R₂CH-OH  |  Tertiary: R₃C-OH" }
      ]
    },
    {
      title: "2. Preparation Methods of Alcohols",
      badge: "Synthesis",
      formulas: [
        { label: "From Alkenes (Hydration)", formula: "CH₂=CH₂ + H₂O (dil. H₂SO₄) ⇌ CH₃-CH₂-OH  [Markovnikov Rule]" },
        { label: "Hydroboration-Oxidation", formula: "6 R-CH=CH₂ + B₂H₆ → 2 B(CH₂CH₂R)₃  (H₂O₂, OH⁻) → 3 R-CH₂CH₂OH [Anti-Markovnikov]" },
        { label: "Reduction of Carbonyls", formula: "R-CHO + [H] (NaBH₄ or LiAlH₄) → R-CH₂-OH (1° Alcohol)" },
        { label: "Ketone Reduction", formula: "R-CO-R' + [H] (NaBH₄) → R-CH(OH)-R' (2° Alcohol)" },
        { label: "Grignard Synthesis (HCHO)", formula: "HCHO + R-MgX (H₃O⁺) → R-CH₂OH  (Primary 1°)" },
        { label: "Grignard Synthesis (RCHO)", formula: "R'-CHO + R-MgX (H₃O⁺) → R'-CH(OH)-R  (Secondary 2°)" },
        { label: "Grignard (Ketones)", formula: "R'-CO-R'' + R-MgX (H₃O⁺) → R'R''R-C-OH  (Tertiary 3°)" }
      ]
    },
    {
      title: "3. Acidic Nature & Cleavage of O-H Bond",
      badge: "Reactions",
      formulas: [
        { label: "Reaction with Active Metal", formula: "2 R-OH + 2 Na → 2 R-O⁻Na⁺ (Sodium alkoxide) + H₂ ↑" },
        { label: "Acidity Order", formula: "Water > 1° Alcohol > 2° Alcohol > 3° Alcohol  [+I effect of alkyls reduces acidity]" },
        { label: "Esterification Reaction", formula: "R-OH + R'-COOH (conc. H₂SO₄) ⇌ R'-COOR (Fruity Ester) + H₂O" },
        { label: "Acid Anhydride Reaction", formula: "R-OH + (R'CO)₂O (H⁺) → R'COOR + R'COOH" }
      ]
    },
    {
      title: "4. Cleavage of C-O Bond & Lucas Test",
      badge: "Core CBSE",
      formulas: [
        { label: "Lucas Reagent", formula: "Conc. HCl + Anhydrous ZnCl₂  (Distinguishes 1°, 2°, 3° Alcohols)" },
        { label: "Tertiary (3°) Alcohol", formula: "R₃C-OH + HCl (ZnCl₂) → R₃C-Cl + H₂O  [IMMEDIATE Turbidity]" },
        { label: "Secondary (2°) Alcohol", formula: "R₂CH-OH + HCl (ZnCl₂) → R₂CH-Cl + H₂O  [Turbidity in 5 minutes]" },
        { label: "Primary (1°) Alcohol", formula: "R-CH₂OH + HCl (ZnCl₂) → No turbidity at room temp  [Requires Heating]" },
        { label: "Reaction with PCl₅ / SOCl₂", formula: "R-OH + SOCl₂ (Pyridine) → R-Cl + SO₂ ↑ + HCl ↑  [Purest chloroalkane]" }
      ]
    },
    {
      title: "5. Dehydration & Oxidation Reactions",
      badge: "Mechanisms",
      formulas: [
        { label: "Dehydration to Alkene", formula: "CH₃-CH₂-OH (conc. H₂SO₄, 443 K) → CH₂=CH₂ + H₂O" },
        { label: "Dehydration to Ether", formula: "2 CH₃-CH₂-OH (conc. H₂SO₄, 413 K) → C₂H₅-O-C₂H₅ + H₂O" },
        { label: "Ease of Dehydration", formula: "3° Alcohol > 2° Alcohol > 1° Alcohol  [carbocation intermediate stability]" },
        { label: "1° Alcohol to Aldehyde", formula: "R-CH₂OH + PCC (Pyridinium chlorochromate in CH₂Cl₂) → R-CHO" },
        { label: "1° Alcohol to Acid", formula: "R-CH₂OH + Alkaline KMnO₄ / Jones Reagent (CrO₃, H₂SO₄) → R-COOH" },
        { label: "2° Alcohol to Ketone", formula: "R-CH(OH)-R' + CrO₃ (or heated Cu at 573 K) → R-CO-R'" },
        { label: "3° Alcohol Dehydrogenation", formula: "R₃C-OH + Cu / 573 K → Alkene (Dehydration occurs, resists oxidation!)" }
      ]
    },
    {
      title: "6. Distinguishing Tests & Commercial Uses",
      badge: "Board Tests",
      formulas: [
        { label: "Iodoform Test", formula: "Compounds with CH₃-CH(OH)- group + I₂ + NaOH → CHI₃ ↓ (Yellow ppt) + HCOONa" },
        { label: "Ethanol vs Methanol", formula: "Ethanol gives positive Iodoform Test; Methanol gives NEGATIVE test" },
        { label: "Denatured Alcohol", formula: "Ethanol rendered unfit for drinking by adding CuSO₄ and Pyridine" }
      ]
    }
  ];
}

// Data: Mathematics Class 12 Integration Formulas
export function getIntegrationFormulaData(): FormulaSection[] {
  return [
    {
      title: "1. Basic Algebraic & Power Rules",
      badge: "Fundamental",
      formulas: [
        { label: "Power Rule", formula: "∫ xⁿ dx = (xⁿ⁺¹)/(n + 1) + C   [n ≠ -1]" },
        { label: "Constant", formula: "∫ 1 dx = x + C" },
        { label: "Logarithmic", formula: "∫ (1/x) dx = ln|x| + C" },
        { label: "Linear Shift", formula: "∫ (ax + b)ⁿ dx = (ax + b)ⁿ⁺¹ / [a(n + 1)] + C" }
      ]
    },
    {
      title: "2. Exponential & Logarithmic Functions",
      badge: "Calculus",
      formulas: [
        { label: "Natural Exp", formula: "∫ eˣ dx = eˣ + C" },
        { label: "General Exp", formula: "∫ aˣ dx = (aˣ / ln a) + C   [a > 0, a ≠ 1]" },
        { label: "Linear Exp", formula: "∫ eᵃˣ dx = (1/a) eᵃˣ + C" },
        { label: "Log Function", formula: "∫ ln x dx = x ln x - x + C" }
      ]
    },
    {
      title: "3. Trigonometric Integrals",
      badge: "Standard",
      formulas: [
        { label: "Sine", formula: "∫ sin x dx = -cos x + C" },
        { label: "Cosine", formula: "∫ cos x dx = sin x + C" },
        { label: "Secant Squared", formula: "∫ sec² x dx = tan x + C" },
        { label: "Cosecant Squared", formula: "∫ csc² x dx = -cot x + C" },
        { label: "Secant Tangent", formula: "∫ sec x tan x dx = sec x + C" },
        { label: "Cosecant Cotangent", formula: "∫ csc x cot x dx = -csc x + C" },
        { label: "Tangent", formula: "∫ tan x dx = ln|sec x| + C = -ln|cos x| + C" },
        { label: "Cotangent", formula: "∫ cot x dx = ln|sin x| + C" },
        { label: "Secant", formula: "∫ sec x dx = ln|sec x + tan x| + C" },
        { label: "Cosecant", formula: "∫ csc x dx = ln|csc x - cot x| + C" }
      ]
    },
    {
      title: "4. Inverse Trigonometric Integrals",
      badge: "CBSE Core",
      formulas: [
        { label: "Arcsin Form", formula: "∫ [1 / √(1 - x²)] dx = sin⁻¹(x) + C" },
        { label: "Arctan Form", formula: "∫ [1 / (1 + x²)] dx = tan⁻¹(x) + C" },
        { label: "Arcsec Form", formula: "∫ [1 / (|x|√(x² - 1))] dx = sec⁻¹(x) + C" },
        { label: "Scaled Arcsin", formula: "∫ [1 / √(a² - x²)] dx = sin⁻¹(x/a) + C" },
        { label: "Scaled Arctan", formula: "∫ [1 / (x² + a²)] dx = (1/a) tan⁻¹(x/a) + C" }
      ]
    },
    {
      title: "5. Special Quadratic & Root Integrals",
      badge: "Important",
      formulas: [
        { label: "x² - a²", formula: "∫ [1 / (x² - a²)] dx = (1/2a) ln |(x - a) / (x + a)| + C" },
        { label: "a² - x²", formula: "∫ [1 / (a² - x²)] dx = (1/2a) ln |(a + x) / (a - x)| + C" },
        { label: "√(x² + a²)", formula: "∫ [1 / √(x² + a²)] dx = ln |x + √(x² + a²)| + C" },
        { label: "√(x² - a²)", formula: "∫ [1 / √(x² - a²)] dx = ln |x + √(x² - a²)| + C" },
        { label: "Product Root 1", formula: "∫ √(a² - x²) dx = (x/2)√(a² - x²) + (a²/2) sin⁻¹(x/a) + C" },
        { label: "Product Root 2", formula: "∫ √(x² + a²) dx = (x/2)√(x² + a²) + (a²/2) ln |x + √(x² + a²)| + C" }
      ]
    },
    {
      title: "6. Integration by Parts & Special Forms",
      badge: "Master Rules",
      formulas: [
        { label: "By Parts (ILATE)", formula: "∫ u·v dx = u ∫ v dx - ∫ [ u' (∫ v dx) ] dx" },
        { label: "Exponential Identity", formula: "∫ eˣ [ f(x) + f'(x) ] dx = eˣ f(x) + C" },
        { label: "Substitution Rule", formula: "∫ f(g(x))·g'(x) dx = ∫ f(u) du   [u = g(x)]" },
        { label: "Definite Property", formula: "∫ₐᵇ f(x) dx = ∫ₐᵇ f(a + b - x) dx" }
      ]
    }
  ];
}

// Data: Mathematics Class 12 Differentiation Formulas
export function getDifferentiationFormulaData(): FormulaSection[] {
  return [
    {
      title: "1. Basic Algebraic & Power Derivatives",
      badge: "Fundamentals",
      formulas: [
        { label: "Power Rule", formula: "d/dx (xⁿ) = n·xⁿ⁻¹" },
        { label: "Constant", formula: "d/dx (c) = 0" },
        { label: "Linear", formula: "d/dx (ax + b) = a" },
        { label: "Square Root", formula: "d/dx (√x) = 1 / (2√x)" }
      ]
    },
    {
      title: "2. Product, Quotient & Chain Rules",
      badge: "Master Rules",
      formulas: [
        { label: "Product Rule", formula: "d/dx [u·v] = u·(dv/dx) + v·(du/dx)" },
        { label: "Quotient Rule", formula: "d/dx [u/v] = [v·(du/dx) - u·(dv/dx)] / v²" },
        { label: "Chain Rule", formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)" }
      ]
    },
    {
      title: "3. Trigonometric Derivatives",
      badge: "Calculus",
      formulas: [
        { label: "Sine", formula: "d/dx (sin x) = cos x" },
        { label: "Cosine", formula: "d/dx (cos x) = -sin x" },
        { label: "Tangent", formula: "d/dx (tan x) = sec² x" },
        { label: "Cotangent", formula: "d/dx (cot x) = -csc² x" },
        { label: "Secant", formula: "d/dx (sec x) = sec x · tan x" },
        { label: "Cosecant", formula: "d/dx (csc x) = -csc x · cot x" }
      ]
    },
    {
      title: "4. Exponential & Logarithmic Derivatives",
      badge: "Transcendental",
      formulas: [
        { label: "Natural Exp", formula: "d/dx (eˣ) = eˣ" },
        { label: "General Exp", formula: "d/dx (aˣ) = aˣ · ln(a)" },
        { label: "Natural Log", formula: "d/dx (ln|x|) = 1/x" },
        { label: "General Log", formula: "d/dx (logₐ x) = 1 / (x · ln a)" }
      ]
    }
  ];
}

// Data: Physics Class 12 Electrostatics
export function getPhysicsElectrostaticsData(): FormulaSection[] {
  return [
    {
      title: "1. Electrostatic Forces & Charges",
      badge: "Coulomb's Law",
      formulas: [
        { label: "Quantization of Charge", formula: "q = ±n·e   [e = 1.602 × 10⁻¹⁹ C]" },
        { label: "Coulomb's Law (Vacuum)", formula: "F = (1 / 4πε₀) · (|q₁·q₂| / r²)   [1/4πε₀ = 9 × 10⁹ N·m²/C²]" },
        { label: "Dielectric Constant", formula: "F_medium = F_vacuum / K = F_vacuum / εᵣ" }
      ]
    },
    {
      title: "2. Electric Field & Dipole",
      badge: "Fields",
      formulas: [
        { label: "Electric Field Intensity", formula: "E = F / q₀ = (1 / 4πε₀) · (q / r²) r̂" },
        { label: "Dipole Moment", formula: "p = q · 2a   [Directed from -q to +q]" },
        { label: "Axial Field (r >> a)", formula: "E_axial = (1 / 4πε₀) · (2p / r³)" },
        { label: "Equatorial Field", formula: "E_equatorial = (1 / 4πε₀) · (p / r³)" }
      ]
    },
    {
      title: "3. Gauss's Theorem & Applications",
      badge: "Gauss's Law",
      formulas: [
        { label: "Electric Flux", formula: "Φ = ∮ E · dA = q_enclosed / ε₀" },
        { label: "Infinite Line Charge", formula: "E = λ / (2πε₀·r)   [λ = linear charge density]" },
        { label: "Infinite Plane Sheet", formula: "E = σ / (2ε₀)   [σ = surface charge density]" }
      ]
    },
    {
      title: "4. Capacitance & Energy",
      badge: "Circuits",
      formulas: [
        { label: "Parallel Plate Capacitor", formula: "C = (ε₀·A) / d   [With dielectric: C = K·ε₀·A / d]" },
        { label: "Series Combination", formula: "1/C_eq = 1/C₁ + 1/C₂ + 1/C₃" },
        { label: "Parallel Combination", formula: "C_eq = C₁ + C₂ + C₃" },
        { label: "Stored Energy", formula: "U = ½ C·V² = ½ Q·V = Q² / (2C)" }
      ]
    }
  ];
}

/**
 * Main Generator function for Formula Sheet Canvas
 * Supports subject routing and authentic handwritten notebook style vs digital dark canvas
 */
export function generateFormulaSheetImage(
  subject: SubjectCategory = 'mathematics',
  topic: string = 'Integration',
  style: VisualStyle = 'digital',
  classLevel: string = 'Class 11'
): string {
  if (typeof document === 'undefined') {
    return "";
  }

  const canvas = document.createElement('canvas');
  const width = 1280;
  const height = 1820;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return "";

  // 1. Resolve Data based on Subject, Topic & Class Level
  let sections: FormulaSection[];
  let mainHeading: string;
  let subHeading: string;

  const topicLower = topic.toLowerCase();

  // Specific Mathematics Topics First
  if (topicLower.includes('relation') || topicLower.includes('function')) {
    sections = getRelationsAndFunctionsFormulaData(classLevel);
    mainHeading = `${classLevel.toUpperCase()} MATHEMATICS — RELATIONS & FUNCTIONS`;
    subHeading = 'Types of Relations, Equivalence Classes, Function Types, Bijective, Invertible & Counting Formulas';
  } else if (topicLower.includes('determinant')) {
    sections = getDeterminantsFormulaData(classLevel);
    mainHeading = `${classLevel.toUpperCase()} MATHEMATICS — DETERMINANTS`;
    subHeading = 'CBSE Class 12 Determinants: Expansion, Properties, Minors, Cofactors, Adjoint & Inverse';
  } else if (topicLower.includes('matri')) {
    sections = getMatricesFormulaData(classLevel);
    mainHeading = `${classLevel.toUpperCase()} MATHEMATICS — MATRICES`;
    subHeading = 'Order, Matrix Operations, Transpose, Symmetric & Skew-Symmetric Reference Sheet';
  } else if (subject === 'chemistry' || topicLower.includes('alcohol') || topicLower.includes('phenol') || topicLower.includes('organic')) {
    sections = getChemistryAlcoholsData();
    mainHeading = 'CLASS 12 CHEMISTRY — ALCOHOLS & REACTIONS';
    subHeading = 'Comprehensive CBSE Board & Competitive Reactions, Tests & Mechanisms Reference';
  } else if (subject === 'physics') {
    sections = getPhysicsElectrostaticsData();
    mainHeading = 'CLASS 12 PHYSICS — ELECTROSTATICS';
    subHeading = 'Coulomb Force, Electric Fields, Gauss Law & Capacitance Reference';
  } else if (topicLower.includes('differentiation') || topicLower.includes('derivative') || topicLower.includes('d/dx')) {
    sections = getDifferentiationFormulaData();
    mainHeading = 'CLASS 12 CALCULUS — DIFFERENTIATION';
    subHeading = 'Standard Derivatives, Product/Quotient Rules & Transcendental Functions';
  } else if (topicLower.includes('integration') || topicLower.includes('integral') || topicLower.includes('∫')) {
    sections = getIntegrationFormulaData();
    mainHeading = 'CLASS 12 CALCULUS — INTEGRATION FORMULAS';
    subHeading = 'Indefinite & Definite Integrals, Special Quadratic Forms & Substitution Rules';
  } else {
    // General Mathematics Fallback (Matrices if Class 11, Relations & Functions if Class 12 general)
    if (classLevel.toLowerCase().includes('11')) {
      sections = getMatricesFormulaData(classLevel);
      mainHeading = `${classLevel.toUpperCase()} MATHEMATICS — MATRICES`;
      subHeading = 'Order, Matrix Operations, Transpose, Symmetric & Skew-Symmetric Reference Sheet';
    } else {
      sections = getRelationsAndFunctionsFormulaData(classLevel);
      mainHeading = 'CLASS 12 MATHEMATICS — FORMULA REFERENCE';
      subHeading = 'Core CBSE Mathematical Foundations, Definitions & Important Results';
    }
  }

  // 2. Render Based on Style: Handwritten vs Digital
  if (style === 'handwritten') {
    renderHandwrittenStudentSheet(ctx, width, height, mainHeading, subHeading, sections);
  } else {
    renderDigitalDarkSheet(ctx, width, height, mainHeading, subHeading, sections);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Renders an authentic student notebook handwritten sheet
 * Features:
 * - Cream notebook paper background
 * - Light blue horizontal ruled lines
 * - Red left margin line
 * - Dark fountain pen ink
 * - Authentic student notes layout without corporate or PVM branding
 */
function renderHandwrittenStudentSheet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  sub: string,
  sections: FormulaSection[]
) {
  // 1. Off-white / Cream ruled paper background
  ctx.fillStyle = '#FCFAF2';
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain / warm texture
  const grainGrad = ctx.createLinearGradient(0, 0, width, height);
  grainGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  grainGrad.addColorStop(0.5, 'rgba(247, 243, 232, 0.4)');
  grainGrad.addColorStop(1, 'rgba(238, 232, 218, 0.7)');
  ctx.fillStyle = grainGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Blue Horizontal Ruled Lines (Every 38px)
  ctx.strokeStyle = '#D8E2EC';
  ctx.lineWidth = 1;
  const lineGap = 38;
  const startY = 160;
  for (let y = startY; y < height - 40; y += lineGap) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 30, y);
    ctx.stroke();
  }

  // 3. Red Left Margin Line
  const marginX = 140;
  ctx.strokeStyle = '#F87171';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, 30);
  ctx.lineTo(marginX, height - 30);
  ctx.stroke();

  // Secondary faint margin line for authentic notebook look
  ctx.strokeStyle = '#FCA5A5';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(marginX + 4, 30);
  ctx.lineTo(marginX + 4, height - 30);
  ctx.stroke();

  // 4. Date & Page handwritten in top-right corner
  ctx.fillStyle = '#1E3A8A'; // Classic blue fountain pen ink
  ctx.font = 'italic 16px "Comic Sans MS", "Segoe Print", "Caveat", cursive, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Date: __/__/____', width - 80, 55);
  ctx.fillText('Page: 01 / Notes', width - 80, 80);

  // 5. Handwritten Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = '#172554'; // Dark navy ink
  ctx.font = 'bold 30px "Comic Sans MS", "Segoe Print", "Caveat", cursive, sans-serif';
  ctx.fillText(`✎ ${title}`, marginX + 30, 85);

  // Hand-drawn double underline under main heading
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX + 30, 98);
  ctx.lineTo(marginX + 620, 98);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX + 35, 103);
  ctx.lineTo(marginX + 590, 103);
  ctx.stroke();

  // Handwritten Subtitle
  ctx.fillStyle = '#3B82F6';
  ctx.font = 'italic 15px "Comic Sans MS", "Segoe Print", cursive, sans-serif';
  ctx.fillText(`✦ ${sub}`, marginX + 30, 130);

  // 6. Two-Column Handwritten Layout
  const colWidth = 510;
  const col1X = marginX + 25;
  const col2X = marginX + colWidth + 50;
  let curY1 = 180;
  let curY2 = 180;

  sections.forEach((sec, idx) => {
    const isLeft = idx % 2 === 0;
    const x = isLeft ? col1X : col2X;
    let y = isLeft ? curY1 : curY2;

    // Handwritten Section Header with hand-drawn highlighter box
    ctx.fillStyle = 'rgba(254, 240, 138, 0.55)'; // Pastel yellow highlighter effect
    ctx.fillRect(x - 5, y - 22, colWidth - 10, 30);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px "Comic Sans MS", "Segoe Print", "Caveat", cursive, sans-serif';
    ctx.fillText(`§ ${sec.title}`, x + 5, y);

    y += 34;

    // Handwritten Formulas
    sec.formulas.forEach((item) => {
      // Formula label (subdued ink)
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 12.5px "Comic Sans MS", "Segoe Print", cursive, sans-serif';
      ctx.fillText(`• ${item.label}:`, x + 10, y);

      y += 22;

      // Actual Equation (Dark blue pen ink with handwritten box)
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 14px "Comic Sans MS", "Segoe Print", "JetBrains Mono", monospace';
      ctx.fillText(item.formula, x + 24, y);

      y += 26;
    });

    y += 18; // Spacing after section

    if (isLeft) {
      curY1 = y;
    } else {
      curY2 = y;
    }
  });

  // Footer: Handwritten note tip
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 13px "Comic Sans MS", "Segoe Print", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ Tip: Memorize core properties & practice numerical problems daily for maximum retention.', width / 2, height - 20);
}

/**
 * Renders modern high-contrast digital dark reference canvas
 */
function renderDigitalDarkSheet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  sub: string,
  sections: FormulaSection[]
) {
  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#070B14');
  bgGrad.addColorStop(0.5, '#0B1120');
  bgGrad.addColorStop(1, '#05070D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Outer border with Cyan accent
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(title, width / 2, 95);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText(sub, width / 2, 130);

  // Gradient Divider
  const divGrad = ctx.createLinearGradient(120, 0, width - 120, 0);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, '#06B6D4');
  divGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 155);
  ctx.lineTo(width - 120, 155);
  ctx.stroke();

  // Columns Layout
  const colWidth = 570;
  const startX1 = 50;
  const startX2 = width - 50 - colWidth;
  let curY1 = 180;
  let curY2 = 180;

  sections.forEach((sec, idx) => {
    const isLeft = idx % 2 === 0;
    const x = isLeft ? startX1 : startX2;
    let y = isLeft ? curY1 : curY2;

    const boxHeight = 40 + sec.formulas.length * 38 + 15;

    // Card Glass Background
    const cardGrad = ctx.createLinearGradient(x, y, x, y + boxHeight);
    cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    cardGrad.addColorStop(1, 'rgba(8, 14, 26, 0.95)');
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, colWidth, boxHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Top Accent line
    const topAccentGrad = ctx.createLinearGradient(x, y, x + colWidth, y);
    topAccentGrad.addColorStop(0, '#06B6D4');
    topAccentGrad.addColorStop(1, '#818CF8');
    ctx.strokeStyle = topAccentGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, colWidth, 4, [12, 12, 0, 0]);
    ctx.stroke();

    // Section Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText(sec.title, x + 16, y + 28);

    // Badge
    if (sec.badge) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      const bW = 85;
      const bH = 20;
      const bX = x + colWidth - bW - 16;
      const bY = y + 14;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#67E8F9';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sec.badge, bX + bW / 2, bY + 14);
    }

    // Formulas List
    let itemY = y + 54;
    sec.formulas.forEach((item) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText(item.label, x + 18, itemY);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText(item.formula, x + 18, itemY + 18);

      itemY += 38;
    });

    if (isLeft) curY1 += boxHeight + 16;
    else curY2 += boxHeight + 16;
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('STUDY SATHI 2.0 ACADEMIC • HIGH-PRECISION MATHEMATICAL & SCIENTIFIC REFERENCE SHEET', width / 2, height - 35);
}
