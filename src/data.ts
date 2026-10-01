/**
 * data.ts
 * Data lengkap prototipe — SEAMEO SEAMOLEC Monitoring Program
 *
 * Sumber: Tabel_Kerja_SEAMOLEC_FYDP_2025-2029.xlsx (9 sheet, ekstraksi 23 September 2026)
 * Volume: 9 programme · 5 strategy · 5 division · 80 activity · 10 KPI
 *         · 5 milestone · 5 MEComponent · 13 Funding · 0 ProgressUpdate
 *
 * KEBIJAKAN PENGISIAN:
 *  - Semua nilai diambil apa adanya dari spreadsheet.
 *  - Field yang di spreadsheet masih kosong diisi `null` — tidak ada nilai yang dikarang.
 *  - Field turunan (capaian KPI, status KPI, progres flagship, aktivitas berisiko)
 *    TIDAK ada di sini; dihitung saat render (lihat types.ts bagian 4).
 */

import type {
  Activity,
  ActivityId,
  Division,
  Funding,
  KPI,
  MEComponent,
  Milestone,
  Pillar,
  Programme,
  ProgrammeId,
  ProgressUpdate,
  SeamolecDataset,
  Strategy,
} from "./types";

/* ==================================================================== */
/* STRATEGY — 5 strategi inti                                           */
/* name: dari ringkasan FYDP yang dipakai pada brief program            */
/* cluster: dari kolom `Klaster Strategi`, sheet "Ringkasan 9 Flagship" */
/* ==================================================================== */

export const strategies: Strategy[] = [
  { code: "ST1", name: "Champion ODL Policy Harmonization", cluster: "Policy Harmonization" },
  // CATATAN DATA: sheet sumber menandai keempat programme WT3 (FLEXERA/CREATE/CODEA/NEXEL)
  // dengan klaster "Policy Harmonization" — identik dengan klaster ST1. Nilai ini
  // dipertahankan apa adanya sesuai instruksi "jangan diubah". Konsekuensinya: bila
  // dashboard mengelompokkan berdasarkan `cluster`, ST1 dan WT3 akan tergabung.
  // Ubah satu baris ini bila ingin memakai klaster tersendiri untuk WT3.
  { code: "WT3", name: "Develop ODL QA Expertise", cluster: "Policy Harmonization" },
  { code: "WT2", name: "Fund Digital Equity Initiatives", cluster: "Fund Digital Equity" },
  { code: "ST3", name: "Develop Low-Bandwidth ODL Solutions", cluster: "Access & Inclusion" },
  { code: "WO2", name: "Adopt Comprehensive ODL Analytics", cluster: "ODL Analytics" },
];

/* ==================================================================== */
/* DIVISION — 5 divisi fungsional                                       */
/* Workbook tidak pernah menuliskan kepanjangan; `name` menyalin label  */
/* yang benar-benar dipakai workbook (bukan karangan).                  */
/* ==================================================================== */

export const divisions: Division[] = [
  { code: "CPMP", name: "CPMP" },
  { code: "IT&KM", name: "IT&KM" },
  { code: "Training", name: "Training" },
  { code: "R&D", name: "R&D" },
  { code: "Admin & Finance", name: "Admin & Finance" },
];

/* ==================================================================== */
/* PROGRAMME — 9 flagship programme                                     */
/* id 1..9 mengikuti urutan baris sheet "Ringkasan 9 Flagship"          */
/* ==================================================================== */

export const programmes: Programme[] = [
  {
    id: 1,
    acronym: "AILOS",
    full_name: "Access & Inclusion Low-bandwidth ODL Solutions",
    strategy_code: "ST3",
    lead_division: "IT&KM",
    owner_team: "IT&KM",
    fydp_page: "39-40",
  },
  {
    id: 2,
    acronym: "PROGRES",
    full_name: "Partnership for Research, Open Learning, Global Readiness, and Educational Synergy",
    strategy_code: "ST1",
    lead_division: "CPMP",
    owner_team: "CPMP, MWG Secretariat",
    fydp_page: "43",
  },
  {
    id: 3,
    acronym: "ADCEND",
    full_name: "Advancing Systems for Credentialing, E-learning, and Networked Distance Education",
    strategy_code: "ST1",
    lead_division: "CPMP",
    owner_team: "CPMP, MWG Secretariat",
    fydp_page: "40-41",
  },
  {
    id: 4,
    acronym: "R-MODE",
    full_name: "Resource Mobilization for Digital Equity",
    strategy_code: "WT2",
    lead_division: "CPMP",
    owner_team: "CPMP",
    fydp_page: "44",
  },
  {
    id: 5,
    acronym: "FLEXERA",
    full_name: "Flexible Credentials for Educator Advancement",
    strategy_code: "WT3",
    lead_division: "Training",
    owner_team: "Training Certification Team, Master Trainers",
    fydp_page: "41",
  },
  {
    id: 6,
    acronym: "CREATE",
    full_name: "Creative and Responsive Educator Acceleration through Technology Empowerment",
    strategy_code: "WT3",
    lead_division: "Training",
    owner_team: "Training Certification Team",
    fydp_page: "42",
  },
  {
    id: 7,
    acronym: "CODEA",
    full_name: "Coding and Artificial Intelligence for Education Advancement",
    strategy_code: "WT3",
    lead_division: "Training",
    owner_team: "Training Certification Team",
    fydp_page: "42",
  },
  {
    id: 8,
    acronym: "NEXEL",
    full_name: "Next Generation Experiential Learning Initiative",
    strategy_code: "WT3",
    lead_division: "Training",
    owner_team: "Training Certification Team",
    fydp_page: "43",
  },
  {
    id: 9,
    acronym: "COALA",
    full_name: "Comprehensive ODL Analytics",
    strategy_code: "WO2",
    lead_division: "R&D",
    owner_team: "R&D",
    fydp_page: "44",
  },
];

/* ==================================================================== */
/* ACTIVITY — 80 aktivitas tabel kerja utama                            */
/* Sumber: sheet "Aktivitas per Flagship", baris 2–81                   */
/* ==================================================================== */

/** Pemetaan singkat pilar agar baris data tetap terbaca. */
const P = {
  T: "T - Capacity Building",
  R: "R - R&D",
  I: "I - IT&KM",
  C: "C - CPMP",
} as const;

/**
 * Pembuat satu baris Activity.
 * `status`, `note`, `start_date`, dan `due_date` selalu `null` pada data awal karena
 * keempat kolom tersebut kosong (atau tidak ada) di spreadsheet sumber.
 * `pic` hanya diisi untuk baris yang memang punya nilai di sumber.
 */
const act = (
  id: ActivityId,
  programme_id: ProgrammeId,
  component: string,
  code: string,
  title: string,
  pillar: Pillar,
  division: string,
  pic: string | null = null,
): Activity => ({
  id,
  programme_id,
  component,
  code,
  title,
  pillar,
  division,
  pic,
  status: null,
  note: null,
  start_date: null,
  due_date: null,
});

export const activities: Activity[] = [
  /* ---------- AILOS (programme_id 1) — 15 aktivitas ---------- */
  act(1, 1, "Open High School (SMA Terbuka)", "T1", "Standardisasi protokol pelatihan guru dan tutor", P.T, "Training", "Arie Susanty"),
  act(2, 1, "Open High School (SMA Terbuka)", "R1", "Kerangka konseptual dan riset pengembangan SMA Terbuka", P.R, "R&D", "Arie Susanty"),
  act(3, 1, "Open High School (SMA Terbuka)", "I1", 'Pengembangan platform "SEAMOLEC Lite"', P.I, "IT&KM", "Arie Susanty"),
  act(4, 1, "Open High School (SMA Terbuka)", "C1", "Forum / Dialog Kebijakan Alternative Learning Systems (ALS)", P.C, "CPMP", "Arie Susanty"),
  act(5, 1, "ODL Central Maluku (PJJ Malteng)", "T2", "Pelatihan dan pendampingan pedagogis guru serta tutor PJJ Maluku Tengah", P.T, "Training"),
  act(6, 1, "ODL Central Maluku (PJJ Malteng)", "R2 / I2", "Asesmen kesiapan implementasi PJJ di Maluku Tengah", P.R, "R&D / IT&KM"),
  act(7, 1, "ODL Central Maluku (PJJ Malteng)", "R3", "Riset output program dan dampak sosio-pendidikan", P.R, "R&D"),
  act(8, 1, "ODL Central Maluku (PJJ Malteng)", "C2", "Advokasi strategis untuk ALS", P.C, "CPMP"),
  act(9, 1, "ODL Indonesian Schools Abroad (PJJ SILN)", "T3", "Pengembangan profesional guru dan tutor Sekolah Indonesia Luar Negeri (SILN)", P.T, "Training"),
  act(10, 1, "ODL Indonesian Schools Abroad (PJJ SILN)", "C3", "Dokumentasi dan publikasi", P.C, "CPMP"),
  act(11, 1, "Online Equivalency (Setara Daring)", "T3", "Peningkatan kapasitas Pamong Belajar pada sistem kesetaraan daring", P.T, "Training"),
  act(12, 1, "Online Equivalency (Setara Daring)", "I3", "Optimasi teknis dan pembaruan platform Setara Daring", P.I, "IT&KM"),
  act(13, 1, "Online Equivalency (Setara Daring)", "C4", "Dokumentasi dan publikasi", P.C, "CPMP"),
  act(14, 1, "Online Courses (Kursus Daring)", "T4", "Pelatihan instruksional bagi penyelenggara kursus daring", P.T, "Training"),
  act(15, 1, "Online Courses (Kursus Daring)", "I4", "Optimasi teknis dan pembaruan platform Kursus Daring", P.I, "IT&KM"),

  /* ---------- PROGRES (programme_id 2) — 9 aktivitas ---------- */
  act(16, 2, "Blended Learning Management (PM-PTM)", "T1", "Workshop pengembangan kursus daring untuk Blended Learning", P.T, "Training"),
  act(17, 2, "Blended Learning Management (PM-PTM)", "T2", "Workshop desain program", P.T, "Training"),
  act(18, 2, "Blended Learning Management (PM-PTM)", "T3", "Training of Trainers (ToT) bagi dosen / faculty", P.T, "Training"),
  act(19, 2, "Blended Learning Management (PM-PTM)", "T4", "Pelatihan bagi mahasiswa dan pendidik mitra", P.T, "Training"),
  act(20, 2, "Blended Learning Management (PM-PTM)", "R1", "Riset implementasi model Blended Learning di sekolah mitra", P.R, "R&D"),
  act(21, 2, "Blended Learning Management (PM-PTM)", "C1", "Dokumentasi sistematis kegiatan program", P.C, "CPMP"),
  act(22, 2, "Mentorship Program Studi PJJ", "T5", "Workshop desain program strategis", P.T, "Training"),
  act(23, 2, "Mentorship Program Studi PJJ", "T6", "Pengembangan profesional bagi anggota fakultas", P.T, "Training"),
  act(24, 2, "Mentorship Program Studi PJJ", "C2", "Dialog kebijakan dan forum penguatan program studi PJJ", P.C, "CPMP"),

  /* ---------- ADCEND (programme_id 3) — 9 aktivitas ---------- */
  act(25, 3, "Kerangka Mikrokredensial", "R1", "Pengembangan kerangka dan pedoman micro-credential untuk Indonesia", P.R, "R&D"),
  act(26, 3, "Kerangka Mikrokredensial", "T1", "Bantuan teknis bagi perguruan tinggi dalam pengembangan dan penyampaian micro-credential", P.T, "Training"),
  act(27, 3, "Working Group", "C1", "Kelompok Kerja Nasional (Indonesia) dan Regional (Asia Tenggara)", P.C, "CPMP"),
  act(28, 3, "Platform & Infrastruktur", "I1", "Penyediaan teknis untuk MOOC, platform e-learning, digital open badge, dan learning analytics", P.I, "IT&KM"),
  act(29, 3, "Studi & Kajian", "R2", "Kajian ratifikasi dan implementasi Konvensi Tokyo serta Global Convention tentang pengakuan kualifikasi pendidikan tinggi di ASEAN", P.R, "R&D"),
  act(30, 3, "Deployment Micro-credentials", "T2", "Penerapan micro-credentials pada International Trade (mitra FITT Canada) dan Digital Marketing (mitra ASCENDA Canada)", P.T, "Training"),
  act(31, 3, "Dialog & Advokasi", "C2", "Serial dialog kebijakan dan forum regional tentang micro-credentials", P.C, "CPMP"),
  act(32, 3, "Kerangka Regional", "R3", "Perumusan kerangka micro-credential regional Asia Tenggara", P.R, "R&D"),
  act(33, 3, "Dialog & Advokasi", "C3", "Advokasi media sosial dan diseminasi publikasi strategis", P.C, "CPMP"),

  /* ---------- FLEXERA (programme_id 5) — 4 aktivitas ---------- */
  act(34, 5, "Kerangka & Konten", "R1", "Pengembangan kerangka, pedoman operasional, dan kurasi konten micro-credential SEAMOLEC", P.R, "R&D"),
  act(35, 5, "Pelatihan", "T1", "Peningkatan kapasitas dan pelatihan micro-credential SEAMOLEC", P.T, "Training"),
  act(36, 5, "Kemitraan", "C1", "Keterlibatan strategis dan pengembangan kemitraan potensial (APSTPI, LSP)", P.C, "CPMP"),
  act(37, 5, "Platform", "I1", "Optimasi teknis dan peningkatan sistemik platform micro-credential SEAMOLEC", P.I, "IT&KM"),

  /* ---------- CREATE (programme_id 6) — 9 aktivitas ---------- */
  act(38, 6, "Kursus Daring", "T1", "Penyampaian kursus daring SEAMOLEC", P.T, "Training"),
  act(39, 6, "Kursus Daring", "C1", "Diseminasi sistematis dan promosi penawaran kursus daring", P.C, "CPMP"),
  act(40, 6, "Kursus Daring", "I1", "Penyediaan bantuan dan dukungan teknis", P.I, "IT&KM"),
  act(41, 6, "Pelatihan On-site", "T2", "Fasilitasi pelatihan tatap muka di institusi mitra", P.T, "Training"),
  act(42, 6, "Pelatihan On-site", "C2", "Dokumentasi dan pelaporan resmi kegiatan pelatihan mitra", P.C, "CPMP"),
  act(43, 6, "Pelatihan In-house", "T3", "Fasilitasi pelatihan tatap muka in-house di SEAMOLEC Centre", P.T, "Training"),
  act(44, 6, "Pelatihan In-house", "C3", "Dokumentasi dan pelaporan resmi pelatihan institusional di SEAMOLEC", P.C, "CPMP"),
  act(45, 6, "Pelatihan In-house", "I2", "Penyediaan dukungan teknis menyeluruh", P.I, "IT&KM"),
  act(46, 6, "Webinar", "C4", "Penyelenggaraan webinar tentang praktik terbaik pendidikan", P.C, "CPMP"),

  /* ---------- CODEA (programme_id 7) — 10 aktivitas ---------- */
  act(47, 7, "CODE-A", "R1", "Pengembangan model CODE-A Fase 2 (Computational Thinking untuk sekolah dasar)", P.R, "R&D"),
  act(48, 7, "CODE-A", "T1", "Peningkatan kapasitas CODE-A", P.T, "Training"),
  act(49, 7, "CODE-A", "C1", "Penyelenggaraan webinar dan forum regional", P.C, "CPMP"),
  act(50, 7, "CODE-B", "R2", "Pengembangan model CODE-B Fase 2 (Coding untuk SMP)", P.R, "R&D"),
  act(51, 7, "CODE-B", "T2", "Peningkatan kapasitas CODE-B", P.T, "Training"),
  act(52, 7, "CODE-B", "C2", "Advokasi strategis", P.C, "CPMP"),
  act(53, 7, "CODE-C", "R3", "Pengembangan model CODE-C Fase 2 (Coding dan AI untuk SMA)", P.R, "R&D"),
  act(54, 7, "CODE-C", "T3", "Peningkatan kapasitas CODE-C", P.T, "Training"),
  act(55, 7, "AI in the Classroom", "R4", 'Pengembangan model "AI in the Classroom" untuk pendidik', P.R, "R&D"),
  act(56, 7, "AI in the Classroom", "T4", "Pelatihan implementasi AI di ruang kelas", P.T, "Training"),

  /* ---------- NEXEL (programme_id 8) — 10 aktivitas ---------- */
  act(57, 8, "STEM Academy", "T1", "Training of Trainers (ToT) dalam pendidikan STEM", P.T, "Training"),
  act(58, 8, "STEM Leadership", "R1", "Analisis output program dan dampak sosio-pendidikan", P.R, "R&D"),
  act(59, 8, "STEM Academy", "C1", "Penyelenggaraan workshop dan webinar regional", P.C, "CPMP"),
  act(60, 8, "Platform STEM", "I1", "Pengembangan infrastruktur STEM Online Course", P.I, "IT&KM"),
  act(61, 8, "STEM Leadership", "T2", "ToT dan capacity building untuk 15 sekolah pilot", P.T, "Training"),
  act(62, 8, "STEM Leadership", "R2", "Riset output dan dampak inisiatif mentorship STEM", P.R, "R&D"),
  act(63, 8, "STEM Mentorship", "C2", "Advokasi strategis dan diseminasi publikasi", P.C, "CPMP"),
  act(64, 8, "STEM Mentorship", "T3", "Mentorship STEM bersama Dinas Pendidikan Provinsi/Kabupaten (STEAM, Matematika, CODAP & SAGE, Floaiono)", P.T, "Training"),
  act(65, 8, "STEM Academy", "R3", "Pedoman teknis pengembangan dan kurasi kursus daring berkualitas", P.R, "R&D"),
  act(66, 8, "Planetary Wellbeing", "T4", "Pelatihan Planetary Wellbeing", P.T, "Training"),

  /* ---------- R-MODE (programme_id 4) — 9 aktivitas ---------- */
  act(67, 4, "Mekanisme Kolaboratif", "R1", "Mekanisme kolaboratif untuk pendanaan riset bersama", P.R, "R&D"),
  act(68, 4, "Mekanisme Kolaboratif", "T1", "Mekanisme kolaboratif untuk pendanaan pelatihan bersama", P.T, "Training"),
  act(69, 4, "Mekanisme Kolaboratif", "I1", "Mekanisme kolaboratif untuk pendanaan infrastruktur TI dan pengembangan platform", P.I, "IT&KM"),
  act(70, 4, "Mekanisme Kolaboratif", "C1", "Mekanisme kolaboratif untuk pendanaan kegiatan diseminasi dan publikasi", P.C, "CPMP"),
  act(71, 4, "Mekanisme Kolaboratif", "R2", "Pengembangan proposal riset bersama", P.R, "R&D"),
  act(72, 4, "Pendanaan Berbasis Mitra", "T2", "Pendanaan pelatihan yang dipimpin mitra", P.T, "Training"),
  act(73, 4, "Pendanaan Berbasis Mitra", "I2", "Pendanaan mitra untuk infrastruktur TI dan pengembangan platform", P.I, "IT&KM"),
  act(74, 4, "Pendanaan Berbasis Mitra", "C2", "Pendanaan mitra untuk kegiatan diseminasi dan publikasi bersama", P.C, "CPMP"),
  act(75, 4, "Grant Acquisition Unit", "C3", "Operasionalisasi Grant Acquisition Unit", P.C, "CPMP"),

  /* ---------- COALA (programme_id 9) — 5 aktivitas ---------- */
  act(76, 9, "SEAMEO MEL Outcome 1", "R1", "Pengukuran efektivitas pembelajaran", P.R, "R&D"),
  act(77, 9, "SEAMEO MEL Outcome 3", "R2", "Asesmen dampak pelatihan", P.R, "R&D"),
  act(78, 9, "SEAMEO MEL Outcome 2", "I1", "Komunikasi dan manajemen pengetahuan", P.I, "IT&KM"),
  act(79, 9, "Laporan Dampak", "C1", "Penyusunan SEAMOLEC Annual Impact Report", P.C, "CPMP"),
  act(80, 9, "Dukungan Teknis", "T1", "Dukungan teknis sistem data dan matriks data MEL", P.T, "Training"),
];

/* ==================================================================== */
/* KPI — 10 indikator (5 Strategi + 5 SMART)                            */
/* Sumber: sheet "KPI & Target 2029", baris 2–11                        */
/* `label` = kolom `Flagship / Kode` apa adanya                         */
/* `realisation` = null (kolom `Realisasi` kosong di seluruh baris)     */
/* ==================================================================== */

export const kpis: KPI[] = [
  {
    id: 1,
    category: "Strategi",
    label: "PROGRES / ADCEND",
    indicator: "Jumlah negara anggota SEAMEO yang secara formal mengadopsi atau menyelaraskan regulasi ODL nasional dengan kerangka regional yang disahkan",
    target: 5,
    unit: "negara",
    realisation: null,
    source: "FYDP hal. 37",
  },
  {
    id: 2,
    category: "Strategi",
    label: "FLEXERA / CREATE / CODEA / NEXEL",
    indicator: "Kenaikan skor kepercayaan employer regional atas kualitas kredensial ODL tersertifikasi SEAMOLEC",
    target: 0.2,
    unit: "% kenaikan",
    realisation: null,
    source: "FYDP hal. 37",
  },
  {
    id: 3,
    category: "Strategi",
    label: "R-MODE",
    indicator: "Persentase dana non-inti yang dialokasikan khusus untuk inisiatif bagi komunitas kurang terlayani",
    target: 0.4,
    unit: "% dari dana",
    realisation: null,
    source: "FYDP hal. 37",
  },
  {
    id: 4,
    category: "Strategi",
    label: "AILOS",
    indicator: "Penurunan konsumsi data (dan estimasi biaya pengguna) untuk konten flagship via platform SEAMOLEC Lite",
    target: 0.3,
    unit: "% penurunan",
    realisation: null,
    source: "FYDP hal. 37",
  },
  {
    id: 5,
    category: "Strategi",
    label: "COALA",
    indicator: "Persentase intervensi ODL utama yang dilacak dengan metrik perubahan kapasitas institusi, bukan sekadar partisipasi",
    target: 1,
    unit: "% integrasi",
    realisation: null,
    source: "FYDP hal. 37",
  },
  {
    id: 6,
    category: "SMART",
    label: "Pelatihan & Penelitian",
    indicator: "Praktisi ODL tersertifikasi, minimum 40% dari komunitas kurang terlayani",
    target: 1500,
    unit: "praktisi",
    realisation: null,
    source: "One-pager FYDP",
  },
  {
    id: 7,
    category: "SMART",
    label: "TIK & Kesetaraan Digital",
    indicator: "Proyek percontohan skala besar di negara anggota, termasuk penerapan platform SEAMOLEC Lite",
    target: 3,
    unit: "proyek",
    realisation: null,
    source: "One-pager FYDP",
  },
  {
    id: 8,
    category: "SMART",
    label: "Kebijakan & Konsultasi",
    indicator: "Kerangka ODL/QA regional yang diadopsi, disertai bantuan teknis ke minimum 80% negara anggota",
    target: 5,
    unit: "kerangka",
    realisation: null,
    source: "One-pager FYDP",
  },
  {
    id: 9,
    category: "SMART",
    label: "Jejaring & Kemitraan",
    indicator: "Kemitraan strategis formal baru yang terbentuk, disertai program ODL kolaboratif lintas negara",
    target: 15,
    unit: "kemitraan",
    realisation: null,
    source: "One-pager FYDP",
  },
  {
    id: 10,
    category: "SMART",
    label: "Keberlanjutan Kelembagaan",
    indicator: "Peningkatan dana non-inti yang terdiversifikasi",
    target: 0.5,
    unit: "% peningkatan",
    realisation: null,
    source: "One-pager FYDP",
  },
];

/* ==================================================================== */
/* MILESTONE — 5 tonggak tahunan                                        */
/* Sumber: sheet "Milestone 2025-2029", baris 2–6                       */
/* pic / status / note = null (kolom C, D, E kosong di seluruh baris)   */
/* ==================================================================== */

export const milestones: Milestone[] = [
  {
    year: 2025,
    description: "FYDP resmi diluncurkan; lokakarya strategis internal selesai; endorsement Governing Board diperoleh",
    pic: null,
    status: null,
    note: null,
  },
  {
    year: 2026,
    description: "Grant Acquisition Unit dibentuk; Laporan Dampak Tahunan pertama diterbitkan; pilot platform SEAMOLEC Lite dimulai",
    pic: null,
    status: null,
    note: null,
  },
  {
    year: 2027,
    description: "Kerangka kebijakan MWG disahkan oleh tiga negara pilot; SEAMOLEC Lite diterapkan di tiga zona konektivitas rendah",
    pic: null,
    status: null,
    note: null,
  },
  {
    year: 2028,
    description: "Regional ODL Quality Seal operasional di lima negara; 50 pakar QA tersertifikasi; MEL terintegrasi penuh; 40% dana berbasis kesetaraan tercapai",
    pic: null,
    status: null,
    note: null,
  },
  {
    year: 2029,
    description: "1.500 praktisi tersertifikasi; 15 kemitraan strategis terbentuk; 80% negara anggota dibantu; 50% diversifikasi pendanaan tercapai",
    pic: null,
    status: null,
    note: null,
  },
];

/* ==================================================================== */
/* MEComponent — 5 komponen kerangka M&E                                */
/* Sumber: sheet "Kerangka M&E", baris 2–6                              */
/* ==================================================================== */

export const meComponents: MEComponent[] = [
  {
    component: "MWG Progress & Policy",
    method: "P&C Technical Reports, Governing Board Minutes, External Legal Reviews",
    owner: "CPMP",
    frequency: "Kuartalan & Tahunan",
    decision_point: "Menyesuaikan prioritas diplomatik, meningkatkan skala bantuan teknis (ST1, Objective 3)",
  },
  {
    component: "Financial Health & Equity",
    method: "Grant Acquisition Tracking System, S&I Financial Reports (Non-Core vs Core)",
    owner: "R&D",
    frequency: "Bulanan (internal), Kuartalan (laporan GB)",
    decision_point: "Mempertajam target donor, mengoptimalkan alokasi dana untuk menjaga Equity Focus (WT2)",
  },
  {
    component: "Quality & Credibility",
    method: "Employer/Industry Perception Surveys (sebelum/sesudah rollout WT3), ODL Audit Reports",
    owner: "Training",
    frequency: "Dua kali setahun",
    decision_point: "Memvalidasi efektivitas Quality Seal (WT3), menangkal Market Skepticism",
  },
  {
    component: "Technology Effectiveness",
    method: "Embedded Platform Analytics (penggunaan low-bandwidth, retensi pengguna di zona konektivitas rendah), Field User Surveys",
    owner: "IT&KM",
    frequency: "Dua kali setahun (fase pilot), kuartalan (pasca-rollout)",
    decision_point: "Penyempurnaan platform, keputusan mainstreaming ST3 sebagai solusi kesetaraan default",
  },
  {
    component: "Institutional Impact",
    method: "Annual Impact Reports, Longitudinal Graduate Tracking (mekanisme pasca-2029)",
    owner: "CPMP",
    frequency: "Tahunan (publikasi publik)",
    decision_point: "Membuktikan nilai pendidikan (WO2), mengamankan komitmen lanjutan negara anggota",
  },
];

/* ==================================================================== */
/* FUNDING — 13 baris (9 Program + 4 Infrastruktur TI)                  */
/* Sumber: sheet "Pendanaan", baris 2–14                                */
/* `strategy_code` dipertahankan apa adanya, termasuk nilai gabungan    */
/* dengan pemisah yang tidak konsisten ("&" dan ",").                   */
/* ==================================================================== */

export const fundings: Funding[] = [
  {
    category: "Program",
    item: "AILOS",
    strategy_code: "ST3",
    lead_division: "IT&KM",
    source: "External Grants (target: WT2)",
    rationale: "Pengembangan teknologi, infrastruktur server (CapEx), optimasi konten, dan biaya deployment pilot terdesentralisasi",
  },
  {
    category: "Program",
    item: "PROGRES",
    strategy_code: "ST1",
    lead_division: "CPMP",
    source: "Core Budget / Member States",
    rationale: "Biaya diplomasi tingkat tinggi (perjalanan, konsultasi, rapat Ministerial Working Group)",
  },
  {
    category: "Program",
    item: "ADCEND",
    strategy_code: "ST1",
    lead_division: "CPMP",
    source: "Core Budget / Member States",
    rationale: "Biaya diplomasi tingkat tinggi (perjalanan, konsultasi, rapat Ministerial Working Group)",
  },
  {
    category: "Program",
    item: "R-MODE",
    strategy_code: "WT2",
    lead_division: "CPMP",
    source: "Core Budget (pendirian unit) / External Grants",
    rationale: "Gaji personel Grant Acquisition Unit, lisensi software, perjalanan engagement donor",
  },
  {
    category: "Program",
    item: "FLEXERA",
    strategy_code: "WT3",
    lead_division: "Training",
    source: "Core Budget / Fee-for-Service (sinergi SO1)",
    rationale: "Pengembangan kurikulum Quality Seal, pelatihan pengajar, dan biaya audit QA eksternal",
  },
  {
    category: "Program",
    item: "CREATE",
    strategy_code: "WT3",
    lead_division: "Training",
    source: "Core Budget / Fee-for-Service (sinergi SO1)",
    rationale: "Pengembangan kurikulum Quality Seal, pelatihan pengajar, dan biaya audit QA eksternal",
  },
  {
    category: "Program",
    item: "CODEA",
    strategy_code: "WT3",
    lead_division: "Training",
    source: "Core Budget / Fee-for-Service (sinergi SO1)",
    rationale: "Pengembangan kurikulum Quality Seal, pelatihan pengajar, dan biaya audit QA eksternal",
  },
  {
    category: "Program",
    item: "NEXEL",
    strategy_code: "WT3",
    lead_division: "Training",
    source: "Core Budget / Fee-for-Service (sinergi SO1)",
    rationale: "Pengembangan kurikulum Quality Seal, pelatihan pengajar, dan biaya audit QA eksternal",
  },
  {
    category: "Program",
    item: "COALA",
    strategy_code: "WO2",
    lead_division: "R&D",
    source: "Core Budget / Host Ministry (Renstra)",
    rationale: "Konsultansi eksternal desain kerangka MEL, integrasi software learning analytics, dan pelatihan staf data",
  },
  {
    category: "Infrastruktur TI",
    item: "SEAMOLEC Lite Platform",
    strategy_code: "ST1 & ST3",
    lead_division: "IT&KM",
    source: "External Grants / CapEx",
    rationale: "Esensial untuk mitigasi Digital Divide dan menjangkau komunitas kurang terlayani",
  },
  {
    category: "Infrastruktur TI",
    item: "Centralized MEL Dashboard",
    strategy_code: "WO2, WT2, ST3",
    lead_division: "R&D",
    source: "Core Budget / Host Ministry",
    rationale: "Memungkinkan transparansi data, pelacakan longitudinal, dan penghasil bukti untuk mengamankan pendanaan",
  },
  {
    category: "Infrastruktur TI",
    item: "Regional QA Audit Tools",
    strategy_code: "WT3 & ST1",
    lead_division: "Training",
    source: "Core Budget / Fee-for-Service",
    rationale: "Alat digital untuk menstandardisasi evaluasi QA dan mensertifikasi 50 pakar regional",
  },
  {
    category: "Infrastruktur TI",
    item: "Secure Digital Policy Platform",
    strategy_code: "ST1",
    lead_division: "CPMP",
    source: "Core Budget / Member States",
    rationale: "Memfasilitasi dialog kebijakan lintas batas yang bersifat rahasia bagi MWG",
  },
];

/* ==================================================================== */
/* ProgressUpdate — riwayat pembaruan                                   */
/* Tidak ada di spreadsheet sumber; tabel baru untuk fitur riwayat.     */
/* Kosong pada data awal.                                               */
/* ==================================================================== */

export const progressUpdates: ProgressUpdate[] = [];

/* ==================================================================== */
/* DATASET — agregat seluruh koleksi                                    */
/* ==================================================================== */

export const dataset: SeamolecDataset = {
  strategies,
  programmes,
  divisions,
  activities,
  kpis,
  milestones,
  meComponents,
  fundings,
  progressUpdates,
};
