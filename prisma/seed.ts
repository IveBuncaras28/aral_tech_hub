import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Grade 7 Mathematics, Term 1 — based on DepEd's Most Essential Learning
 * Competencies (MELCs) for Grade 7 Math Quarter 1, which covers sets and the
 * real number system. Grade 7 is NOT in this year's MATATAG phase (only
 * Grades 3, 6, 9 are for SY 2026-2027), so it stays MELC-based.
 *
 * Competency codes are drawn from published MELC references. Double-check
 * exact codes against your school's current Budget of Work before publishing —
 * secondary sources vary slightly on formatting.
 */
async function seedGrade7MathTerm1(termId: string) {
  // --- Topic 1: Sets ---
  const setsTopic = await prisma.topic.upsert({
    where: { termId_slug: { termId, slug: "sets" } },
    update: {},
    create: {
      termId,
      title: "Sets",
      slug: "sets",
      competencyCode: "M7NS-Ia-1",
      order: 1,
    },
  });

  const introToSets = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: setsTopic.id, slug: "introduction-to-sets" } },
    update: {},
    create: {
      topicId: setsTopic.id,
      title: "Introduction to Sets",
      slug: "introduction-to-sets",
      order: 1,
      contentMdx: `
A **set** is a well-defined collection of distinct objects, called **elements** or **members**.

"Well-defined" means anyone can tell for certain whether something belongs to the set or not.

## Examples
- $A = \\{1, 2, 3, 4, 5\\}$ — the set of the first five counting numbers
- $B = \\{\\text{red, blue, yellow}\\}$ — the set of primary colors

## Key terms
- **Universal set (U)** — the set containing all objects under consideration
- **Null set (∅)** — a set with no elements
- **Subset** — a set where every element also belongs to another set (e.g. $\\{1,2\\} \\subseteq \\{1,2,3\\}$)
- **Cardinality** — the number of elements in a set, written $n(A)$

## Set operations
- **Union ($A \\cup B$)** — all elements in A, B, or both
- **Intersection ($A \\cap B$)** — only elements found in both A and B
- **Difference ($A - B$)** — elements in A that are NOT in B
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: introToSets.id },
    update: {},
    create: {
      lessonId: introToSets.id,
      title: "Quick Check: Introduction to Sets",
      questions: {
        create: [
          {
            prompt: "If A = {1, 2, 3} and B = {2, 3, 4}, what is A ∩ B?",
            choices: ["A. {1, 2, 3, 4}", "B. {2, 3}", "C. {1}", "D. {4}"],
            correctAnswer: "B",
            explanation: "Intersection means elements found in BOTH sets — only 2 and 3 appear in both.",
            order: 1,
          },
          {
            prompt: "What is n(A) if A = {a, b, c, d}?",
            choices: ["A. 3", "B. 4", "C. 5", "D. A"],
            correctAnswer: "B",
            explanation: "Cardinality n(A) counts the number of elements — there are 4 letters in the set.",
            order: 2,
          },
        ],
      },
    },
  });

  const setProblems = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: setsTopic.id, slug: "solving-problems-involving-sets" } },
    update: {},
    create: {
      topicId: setsTopic.id,
      title: "Solving Problems Involving Sets (Venn Diagrams)",
      slug: "solving-problems-involving-sets",
      order: 2,
      contentMdx: `
A **Venn diagram** uses overlapping circles to show relationships between sets, making it easier to solve word problems.

## Worked example
Out of 40 students, 25 like Math, 18 like Science, and 10 like both. How many like neither?

**Step 1:** Students who like only Math or only Science or both = $25 + 18 - 10 = 33$

**Step 2:** Students who like neither = $40 - 33 = 7$

## Why subtract the overlap?
If we just added 25 + 18, we would count the 10 students who like both subjects twice. Subtracting the intersection once corrects for that double-count.
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: setProblems.id },
    update: {},
    create: {
      lessonId: setProblems.id,
      title: "Quick Check: Set Word Problems",
      questions: {
        create: [
          {
            prompt: "In a class of 30, 20 play basketball, 15 play volleyball, and 8 play both. How many play neither?",
            choices: ["A. 3", "B. 5", "C. 7", "D. 12"],
            correctAnswer: "A",
            explanation: "20 + 15 − 8 = 27 play at least one sport. 30 − 27 = 3 play neither.",
            order: 1,
          },
        ],
      },
    },
  });

  // --- Topic 2: Integers (already exists from earlier — add 2 more lessons to it) ---
  const integersTopic = await prisma.topic.upsert({
    where: { termId_slug: { termId, slug: "integers" } },
    update: {},
    create: {
      termId,
      title: "Integers",
      slug: "integers",
      competencyCode: "M7NS-Ic-1",
      order: 2,
    },
  });

  const introToIntegers = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: integersTopic.id, slug: "introduction-to-integers" } },
    update: {},
    create: {
      topicId: integersTopic.id,
      title: "Introduction to Integers",
      slug: "introduction-to-integers",
      order: 1,
      contentMdx: `
Integers are whole numbers that can be **positive**, **negative**, or **zero**.

They do not include fractions or decimals.

## Examples
- Positive integers: 1, 2, 3, ...
- Negative integers: -1, -2, -3, ...
- Zero: 0

## Number line
Integers can be placed on a number line, with negative numbers to the left of zero and positive numbers to the right.
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: introToIntegers.id },
    update: {},
    create: {
      lessonId: introToIntegers.id,
      title: "Quick Check: Integers",
      questions: {
        create: [
          {
            prompt: "Which of the following is NOT an integer?",
            choices: ["A. -5", "B. 0", "C. 3.5", "D. 12"],
            correctAnswer: "C",
            explanation: "3.5 is a decimal, not a whole number, so it is not an integer.",
            order: 1,
          },
          {
            prompt: "What is the opposite of -8?",
            choices: ["A. -8", "B. 0", "C. 1/8", "D. 8"],
            correctAnswer: "D",
            explanation: "The opposite of a negative integer is its positive counterpart.",
            order: 2,
          },
        ],
      },
    },
  });

  const absoluteValue = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: integersTopic.id, slug: "absolute-value" } },
    update: {},
    create: {
      topicId: integersTopic.id,
      title: "Absolute Value of a Number",
      slug: "absolute-value",
      order: 2,
      contentMdx: `
The **absolute value** of a number is its distance from 0 on the number line — always a non-negative value.

We write the absolute value of $x$ as $|x|$.

## Examples
- $|5| = 5$ (5 is already 5 units from 0)
- $|-5| = 5$ (-5 is also 5 units from 0, just in the opposite direction)
- $|0| = 0$

## Why does this matter?
Distance can never be negative — you can't walk "-3 kilometers." Absolute value captures this idea: it only cares about *how far*, not *which direction*.
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: absoluteValue.id },
    update: {},
    create: {
      lessonId: absoluteValue.id,
      title: "Quick Check: Absolute Value",
      questions: {
        create: [
          {
            prompt: "What is |-12|?",
            choices: ["A. -12", "B. 0", "C. 12", "D. 1/12"],
            correctAnswer: "C",
            explanation: "Absolute value is always non-negative — the distance of -12 from 0 is 12.",
            order: 1,
          },
        ],
      },
    },
  });

  const integerOps = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: integersTopic.id, slug: "operations-on-integers" } },
    update: {},
    create: {
      topicId: integersTopic.id,
      title: "Operations on Integers",
      slug: "operations-on-integers",
      order: 3,
      contentMdx: `
## Addition
- Same signs: add the absolute values, keep the sign. $(-3) + (-4) = -7$
- Different signs: subtract the smaller absolute value from the larger, keep the sign of the bigger one. $(-7) + 4 = -3$

## Subtraction
Subtracting an integer is the same as adding its opposite: $8 - (-3) = 8 + 3 = 11$

## Multiplication and division
- Same signs → positive result: $(-4) \\times (-3) = 12$
- Different signs → negative result: $(-4) \\times 3 = -12$
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: integerOps.id },
    update: {},
    create: {
      lessonId: integerOps.id,
      title: "Quick Check: Operations on Integers",
      questions: {
        create: [
          {
            prompt: "What is (-9) + 4?",
            choices: ["A. -13", "B. -5", "C. 5", "D. 13"],
            correctAnswer: "B",
            explanation: "Different signs: 9 − 4 = 5, and since 9 is larger and negative, the answer is -5.",
            order: 1,
          },
          {
            prompt: "What is (-6) × (-2)?",
            choices: ["A. -12", "B. -8", "C. 8", "D. 12"],
            correctAnswer: "D",
            explanation: "Same signs (both negative) multiply to a positive result: 6 × 2 = 12.",
            order: 2,
          },
        ],
      },
    },
  });

  // --- Topic 3: Rational Numbers ---
  const rationalTopic = await prisma.topic.upsert({
    where: { termId_slug: { termId, slug: "rational-numbers" } },
    update: {},
    create: {
      termId,
      title: "Rational Numbers",
      slug: "rational-numbers",
      competencyCode: "M7NS-Id-1",
      order: 3,
    },
  });

  const fractionsDecimals = await prisma.lesson.upsert({
    where: { topicId_slug: { topicId: rationalTopic.id, slug: "fractions-and-decimals" } },
    update: {},
    create: {
      topicId: rationalTopic.id,
      title: "Rational Numbers as Fractions and Decimals",
      slug: "fractions-and-decimals",
      order: 1,
      contentMdx: `
A **rational number** is any number that can be written as $\\frac{a}{b}$, where $a$ and $b$ are integers and $b \\neq 0$.

## Converting a fraction to a decimal
Divide the numerator by the denominator: $\\frac{3}{4} = 3 \\div 4 = 0.75$

## Converting a decimal to a fraction
Write the decimal over a power of 10, then simplify: $0.6 = \\frac{6}{10} = \\frac{3}{5}$

## Terminating vs. repeating decimals
- **Terminating**: $\\frac{1}{4} = 0.25$ (ends)
- **Repeating**: $\\frac{1}{3} = 0.333...$ (repeats forever)

Both are still rational numbers, since both came from a fraction of integers.
`,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: fractionsDecimals.id },
    update: {},
    create: {
      lessonId: fractionsDecimals.id,
      title: "Quick Check: Fractions and Decimals",
      questions: {
        create: [
          {
            prompt: "What is 5/8 as a decimal?",
            choices: ["A. 0.58", "B. 0.625", "C. 0.85", "D. 1.6"],
            correctAnswer: "B",
            explanation: "5 ÷ 8 = 0.625.",
            order: 1,
          },
          {
            prompt: "Which of these is a repeating decimal?",
            choices: ["A. 1/2", "B. 3/4", "C. 2/3", "D. 1/5"],
            correctAnswer: "C",
            explanation: "2 ÷ 3 = 0.666..., which repeats forever. The others end (terminate).",
            order: 2,
          },
        ],
      },
    },
  });
}

async function main() {
  const subject = await prisma.subject.upsert({
    where: { slug: "math" },
    update: {},
    create: { name: "Mathematics", slug: "math", description: "K-12 Mathematics reviewers" },
  });

  // Grade 7 Math is NOT in this year's MATATAG phase (only Grades 3, 6, 9 are) —
  // so it stays MELC-based for SY 2026-2027.
  const grade7 = await prisma.gradeLevel.upsert({
    where: { subjectId_gradeNumber: { subjectId: subject.id, gradeNumber: 7 } },
    update: {},
    create: { subjectId: subject.id, gradeNumber: 7, framework: "MELC" },
  });

  const term1 = await prisma.term.upsert({
    where: { gradeLevelId_termNumber: { gradeLevelId: grade7.id, termNumber: 1 } },
    update: {},
    create: { gradeLevelId: grade7.id, termNumber: 1 },
  });

  await seedGrade7MathTerm1(term1.id);

  // --- Second example: a Grade 6 subject that IS in this year's MATATAG phase ---
  const ap = await prisma.subject.upsert({
    where: { slug: "araling-panlipunan" },
    update: {},
    create: { name: "Araling Panlipunan", slug: "araling-panlipunan" },
  });

  const grade6AP = await prisma.gradeLevel.upsert({
    where: { subjectId_gradeNumber: { subjectId: ap.id, gradeNumber: 6 } },
    update: {},
    create: { subjectId: ap.id, gradeNumber: 6, framework: "MATATAG" },
  });

  console.log({
    grade7MathTerm1: "3 topics, 6 lessons seeded (Sets, Integers, Rational Numbers)",
    grade6AP: `${ap.slug} — framework: ${grade6AP.framework}`,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
