// Reference data for the intake form. Kept in sync with the system prompt's
// Nigerian context so the model isn't asked about things the form can't collect.

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const COMMON_DEGREES = [
  "Microbiology", "Biochemistry", "Botany", "Zoology", "Biological Sciences",
  "Chemistry", "Industrial Chemistry", "Physics", "Mathematics", "Statistics",
  "Computer Science", "Software Engineering", "Information Technology",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Chemical Engineering", "Petroleum Engineering", "Agricultural Engineering",
  "Economics", "Accounting", "Banking & Finance", "Business Administration",
  "Marketing", "Actuarial Science", "Insurance",
  "Mass Communication", "Journalism", "English & Literary Studies",
  "Philosophy", "History", "Linguistics", "French", "Theatre Arts",
  "Political Science", "Public Administration", "International Relations",
  "Sociology", "Psychology", "Anthropology",
  "Law (LL.B)",
  "Medicine (MBBS)", "Pharmacy", "Nursing", "Medical Laboratory Science",
  "Dentistry", "Radiography", "Optometry", "Physiotherapy",
  "Agricultural Economics", "Animal Science", "Crop Science", "Soil Science",
  "Food Science & Technology", "Forestry & Wildlife",
  "Architecture", "Quantity Surveying", "Estate Management", "Building",
  "Urban & Regional Planning", "Surveying & Geoinformatics",
  "Education (English)", "Education (Maths)", "Education (Sciences)",
  "Education (Social Studies)", "Early Childhood Education",
  "Creative Arts", "Fine & Applied Arts", "Music", "Graphic Design",
  "Geology", "Geophysics", "Geography", "Environmental Science",
  "Other",
];

export const UNIVERSITY_TIERS = [
  { value: "federal", label: "Federal University" },
  { value: "state", label: "State University" },
  { value: "private", label: "Private University" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "college_of_education", label: "College of Education" },
];

export const CLASS_OF_DEGREE_OPTIONS = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
  "Pass",
  "HND Distinction",
  "HND Upper Credit",
  "HND Lower Credit",
  "Pending",
  "Prefer not to say",
];

export const NYSC_STATUS = [
  { value: "not_started", label: "Not started yet" },
  { value: "serving", label: "Currently serving" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped / exempted" },
];

export const FAMILY_PRESSURE = [
  { value: "low", label: "Low — they let me figure it out" },
  { value: "medium", label: "Medium — some expectations" },
  { value: "high", label: "High — remittance + formal job expected" },
];

export const JAPA_APPETITE = [
  { value: "none", label: "None — I'm staying in Nigeria" },
  { value: "curious", label: "Curious — open to it if it makes sense" },
  { value: "committed", label: "Committed — actively planning" },
];

export const RISK_TOLERANCE = [
  { value: "low", label: "Low — need income within 3 months" },
  { value: "medium", label: "Medium — can tolerate 6 months of slow income" },
  { value: "high", label: "High — can wait 12+ months for the right payoff" },
];

export const TIME_HORIZON = [
  { value: 6, label: "6 months" },
  { value: 12, label: "1 year" },
  { value: 24, label: "2 years" },
  { value: 36, label: "3 years" },
  { value: 60, label: "5 years" },
];

// Common hard-no patterns so users can pick from chips instead of typing.
export const HARD_NO_OPTIONS = [
  "MLM / network marketing",
  "Yahoo / cybercrime",
  "Commission-only sales",
  "Door-to-door sales",
  "Relocation outside Nigeria",
  "Relocation within Nigeria",
  "Night shifts",
  "Heavy physical labour",
];

// Relationship + family-stage options. Spouse fields only surface in the UI
// when the answer here is 'in_relationship' or 'married', so nothing extra
// to fill for single users.
export const MARITAL_STATUS = [
  { value: "single", label: "Single" },
  { value: "in_relationship", label: "In a relationship (not married)" },
  { value: "married", label: "Married" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const SPOUSE_EMPLOYMENT = [
  { value: "unemployed", label: "Unemployed / not working" },
  { value: "formal", label: "Employed formally (bank, pharma, civil service, corp)" },
  { value: "self_employed", label: "Self-employed / small business / trade" },
  { value: "abroad", label: "Employed abroad (sending remittance)" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// Common skills to save typing. Grouped mentally by category but exported as
// a flat array so the chip picker can render them in one scannable cluster.
// Users can also type their own via the "+ Add your own skill" input.
export const SKILL_OPTIONS = [
  // Office & productivity
  "Excel", "Microsoft Word", "PowerPoint", "Google Workspace",
  // Writing & language
  "Writing", "Copywriting", "Technical writing", "Editing", "Translation",
  "Public speaking", "IELTS prep",
  // Teaching
  "Teaching", "Tutoring", "Curriculum design",
  // Tech — code
  "HTML/CSS", "JavaScript", "Python", "SQL", "React",
  // Tech — data / analytics
  "Data analysis", "Power BI", "Excel analytics",
  // Design
  "Graphic design", "Figma", "Canva", "Adobe Photoshop", "UI design",
  // Video & media
  "Video editing", "Motion graphics", "Photography",
  // Marketing & social
  "Social media management", "Content creation", "SEO", "Digital marketing",
  "Community management",
  // Sales & customer
  "Sales", "Customer service", "Lead generation", "Cold outreach",
  // Ops & admin
  "Project coordination", "Data entry", "Event planning", "Bookkeeping",
  // Sciences / healthcare / lab
  "Laboratory techniques", "Research (academic)", "Pharma QA",
  "Nursing / patient care",
  // Trade & hands-on
  "Driving", "Cooking / catering", "Fashion / tailoring",
  // Language (JAPA-relevant)
  "German (A1+)", "French (basic)",
];
