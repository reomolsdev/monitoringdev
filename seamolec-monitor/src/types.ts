/**
 * types.ts
 * Skema model data — Prototipe Aplikasi Monitoring Program SEAMEO SEAMOLEC
 * Sumber tunggal: Tabel_Kerja_SEAMOLEC_FYDP_2025-2029.xlsx (9 sheet)
 *
 * ATURAN YANG DIPEGANG:
 *  1. Nama entitas dan field dipakai apa adanya, konsisten dengan spreadsheet sumber.
 *  2. Field yang di spreadsheet masih kosong diisi `null` — tidak dikarang.
 *  3. Field turunan TIDAK disimpan di data.ts; dihitung saat render (lihat bagian 4).
 *
 * CATATAN SUMBER (penting, jangan dihapus):
 *  - Kolom `Status` dan `Catatan` pada sheet "Aktivitas per Flagship" ada tetapi
 *    100% kosong (0 dari 80 baris). Kolom `PIC` hanya terisi 3 baris + 1 baris lain.
 *  - Spreadsheet tidak memiliki kolom tanggal sama sekali, sehingga `start_date`
 *    dan `due_date` selalu `null` pada data awal.
 *  - Sheet "Panduan" mendefinisikan dropdown Status sebagai sumber enum kanonik.
 */

/* ==================================================================== */
/* 1. ENUM / UNION                                                      */
/* ==================================================================== */

/** Pilar aktivitas — kolom `Pilar` pada sheet "Aktivitas per Flagship". */
export type Pillar =
  | "T - Capacity Building"
  | "R - R&D"
  | "I - IT&KM"
  | "C - CPMP";

/**
 * Status aktivitas — didefinisikan pada sheet "Panduan" baris "Pilihan Status".
 * Ini satu-satunya enum status yang kanonik untuk Activity dan Milestone.
 */
export type ActivityStatus =
  | "Belum mulai"
  | "On track"
  | "Perlu perhatian"
  | "Selesai"
  | "Ditunda";

/** Status milestone memakai himpunan nilai yang sama dengan status aktivitas. */
export type MilestoneStatus = ActivityStatus;

/** Kategori KPI — kolom `Kategori` pada sheet "KPI & Target 2029". */
export type KpiCategory = "Strategi" | "SMART";

/** Kategori pendanaan — kolom `Kategori` pada sheet "Pendanaan". */
export type FundingCategory = "Program" | "Infrastruktur TI";

/** Kode 5 divisi fungsional. */
export type DivisionCode =
  | "CPMP"
  | "IT&KM"
  | "Training"
  | "R&D"
  | "Admin & Finance";

/** Kode 5 strategi inti FYDP 2025–2029. */
export type StrategyCode = "ST1" | "WT3" | "WT2" | "ST3" | "WO2";

/* ID — dibuat karena spreadsheet tidak punya kolom ID eksplisit.
   Skema: numerik, diturunkan dari urutan baris pada sheet sumber agar dapat dilacak. */
export type ProgrammeId = number; // 1..9, urut sheet "Ringkasan 9 Flagship"
export type ActivityId = number; // 1..80, sama persis dengan kolom `No`
export type KpiId = number; // 1..10, urut sheet "KPI & Target 2029"
export type ProgressUpdateId = number; // urut penambahan, belum ada data

/* ==================================================================== */
/* 2. ENTITAS                                                           */
/* ==================================================================== */

/**
 * Strategy — 5 strategi inti FYDP.
 * Sumber: sheet "Ringkasan 9 Flagship" (kolom `Kode Strategi` + `Klaster Strategi`).
 */
export interface Strategy {
  /** Kode strategi. Kunci utama. */
  code: StrategyCode;
  /** Nama lengkap strategi. */
  name: string;
  /** Klaster strategi (label pengelompokan dari kolom `Klaster Strategi`). */
  cluster: string;
}

/**
 * Programme — 9 flagship programme.
 * Sumber: sheet "Ringkasan 9 Flagship", 1 baris = 1 programme.
 */
export interface Programme {
  /** ID numerik 1..9. Kunci utama, dirujuk oleh Activity.programme_id. */
  id: ProgrammeId;
  /** Akronim resmi, mis. "AILOS". */
  acronym: string;
  /** Kepanjangan nama programme. */
  full_name: string;
  /** Kode strategi induk. Relasi ke Strategy.code. */
  strategy_code: StrategyCode;
  /** Divisi penanggung jawab utama. Relasi ke Division.code. */
  lead_division: DivisionCode;
  /**
   * Pemilik / tim pelaksana, apa adanya dari kolom `Pemilik / Team`.
   * Nilainya bisa berisi beberapa entitas dipisah koma, mis. "CPMP, MWG Secretariat".
   */
  owner_team: string;
  /** Rentang halaman rujukan pada dokumen FYDP, mis. "39-40". */
  fydp_page: string;
}

/**
 * Division — 5 divisi fungsional.
 * Sumber: gabungan nilai `Lead Division` / `Divisi` / `Divisi Pelaksana` pada sheet 1, 4, 5, 6, 7, 8.
 */
export interface Division {
  /** Kode divisi. Kunci utama. */
  code: DivisionCode;
  /**
   * Nama divisi.
   * CATATAN: seluruh workbook tidak pernah menuliskan kepanjangan kelima divisi —
   * hanya singkatan di atas. Karena itu `name` menyalin persis label yang dipakai
   * workbook (bukan karangan), dan dapat diganti dengan nama resmi saat tersedia.
   */
  name: string;
}

/**
 * Activity — 80 aktivitas pada tabel kerja utama.
 * Sumber: sheet "Aktivitas per Flagship", baris 2–81.
 */
export interface Activity {
  /** ID 1..80, sama dengan kolom `No`. Kunci utama. */
  id: ActivityId;
  /** Relasi ke Programme.id (bukan akronim). */
  programme_id: ProgrammeId;
  /** Sub-program / komponen di dalam flagship (kolom `Program / Komponen`). */
  component: string;
  /**
   * Kode aktivitas (kolom `Kode`), mis. "T1", "R2 / I2".
   * TIDAK unik — gunakan (programme_id, component, code) sebagai kunci gabungan.
   */
  code: string;
  /** Judul / uraian aktivitas (kolom `Aktivitas`). */
  title: string;
  /** Pilar aktivitas. */
  pillar: Pillar;
  /**
   * Divisi pelaksana.
   * Bertipe string (bukan DivisionCode) karena sumber memuat satu nilai gabungan
   * "R&D / IT&KM" yang di luar 5 nilai Division. 79 dari 80 baris cocok dengan DivisionCode.
   */
  division: string;
  /** PIC aktivitas. `null` = belum diisi (76 dari 80 baris kosong di sumber). */
  pic: string | null;
  /** Status terkini. `null` = belum diisi (seluruh 80 baris kosong di sumber). */
  status: ActivityStatus | null;
  /** Catatan / kendala. `null` = belum diisi (seluruh 80 baris kosong di sumber). */
  note: string | null;
  /** Tanggal mulai (ISO YYYY-MM-DD). `null` = belum ditetapkan; sumber tidak punya kolom tanggal. */
  start_date: string | null;
  /** Tenggat selesai (ISO YYYY-MM-DD). `null` = belum ditetapkan; sumber tidak punya kolom tanggal. */
  due_date: string | null;
}

/**
 * KPI — 10 indikator (5 kategori Strategi + 5 kategori SMART).
 * Sumber: sheet "KPI & Target 2029", baris 2–11.
 */
export interface KPI {
  /** ID 1..10. Kunci utama. */
  id: KpiId;
  /** Kategori indikator. */
  category: KpiCategory;
  /**
   * Label pengelompokan baris, apa adanya dari kolom `Flagship / Kode`.
   * Untuk kategori "Strategi" berisi programme, mis. "PROGRES / ADCEND";
   * untuk kategori "SMART" berisi tema, mis. "Pelatihan & Penelitian".
   * Relasi ke Programme bersifat tekstual (bukan foreign key) karena satu baris
   * KPI dapat mencakup beberapa programme sekaligus.
   */
  label: string;
  /** Rumusan indikator (kolom `Indikator KPI`). */
  indicator: string;
  /**
   * Nilai target (kolom `Target`).
   * Nilai desimal menyatakan persentase (mis. 0.2 = 20%); satuan sebenarnya ada di `unit`.
   */
  target: number;
  /** Satuan target (kolom `Satuan`). */
  unit: string;
  /** Realisasi terkini (kolom `Realisasi`). `null` = belum ada data (seluruh 10 baris kosong). */
  realisation: number | null;
  /** Sumber rujukan (kolom `Sumber`). */
  source: string;
}

/**
 * Milestone — 5 tonggak tahunan 2025–2029.
 * Sumber: sheet "Milestone 2025-2029", baris 2–6.
 */
export interface Milestone {
  /** Tahun tonggak (2025–2029). Kunci utama. */
  year: number;
  /** Uraian tonggak implementasi (kolom `Tonggak Implementasi`). */
  description: string;
  /** PIC / koordinator. `null` = belum diisi (seluruh 5 baris kosong di sumber). */
  pic: string | null;
  /** Status tonggak. `null` = belum diisi (seluruh 5 baris kosong di sumber). */
  status: MilestoneStatus | null;
  /** Catatan. `null` = belum diisi (seluruh 5 baris kosong di sumber). */
  note: string | null;
}

/**
 * MEComponent — 5 komponen kerangka Monitoring & Evaluation.
 * Sumber: sheet "Kerangka M&E", baris 2–6.
 */
export interface MEComponent {
  /** Nama komponen M&E. Kunci utama. */
  component: string;
  /** Metode pengumpulan data. */
  method: string;
  /** Penanggung jawab. Relasi tekstual ke Division.code. */
  owner: string;
  /** Frekuensi review. */
  frequency: string;
  /** Titik keputusan / pemanfaatan hasil. */
  decision_point: string;
}

/**
 * Funding — 13 baris pendanaan (9 Program + 4 Infrastruktur TI).
 * Sumber: sheet "Pendanaan", baris 2–14.
 */
export interface Funding {
  /** Kategori pendanaan. Kunci gabungan bersama `item`. */
  category: FundingCategory;
  /**
   * Objek pendanaan, apa adanya dari kolom `Flagship / Aset`.
   * Untuk kategori "Program" berisi akronim programme; untuk "Infrastruktur TI" berisi nama aset.
   */
  item: string;
  /**
   * Kode strategi terkait, apa adanya.
   * Bisa berisi lebih dari satu nilai dengan pemisah yang tidak konsisten,
   * mis. "ST1 & ST3", "WO2, WT2, ST3". Relasi ke Strategy bersifat many-to-many tekstual.
   */
  strategy_code: string;
  /** Divisi penanggung jawab. Relasi tekstual ke Division.code. */
  lead_division: string;
  /** Sumber dana utama. */
  source: string;
  /** Rasional pendanaan. */
  rationale: string;
}

/**
 * ProgressUpdate — riwayat pembaruan status aktivitas.
 * TIDAK ADA di spreadsheet sumber; tabel ini baru dan menjadi penopang fitur
 * "detail aktivitas dengan riwayat pembaruan". Karena itu datanya kosong di awal.
 */
export interface ProgressUpdate {
  /** ID urut. Kunci utama. */
  id: ProgressUpdateId;
  /** Relasi ke Activity.id. */
  activity_id: ActivityId;
  /** Nama PIC / pengguna yang melakukan pembaruan. */
  author: string;
  /** Waktu pembaruan (ISO 8601). */
  timestamp: string;
  /** Status sebelum perubahan. `null` bila sebelumnya belum ada status. */
  status_before: ActivityStatus | null;
  /** Status setelah perubahan. */
  status_after: ActivityStatus;
  /** Komentar / keterangan kendala yang menyertai pembaruan. */
  comment: string | null;
}

/* ==================================================================== */
/* 3. WADAH DATASET                                                     */
/* ==================================================================== */

/**
 * SeamolecDataset — pembungkus seluruh koleksi, bukan entitas baru.
 * Hanya dipakai agar data.ts dapat diekspor sebagai satu objek yang bertipe.
 */
export interface SeamolecDataset {
  strategies: Strategy[];
  programmes: Programme[];
  divisions: Division[];
  activities: Activity[];
  kpis: KPI[];
  milestones: Milestone[];
  meComponents: MEComponent[];
  fundings: Funding[];
  progressUpdates: ProgressUpdate[];
}

/* ==================================================================== */
/* 4. FIELD TURUNAN — TIDAK DISIMPAN, DIHITUNG SAAT RENDER                */
/* ==================================================================== */

/**
 * Capaian KPI = realisation / target.
 * `null` bila `realisation` null atau `target` bernilai 0/null.
 * Padanan formula spreadsheet: =IF(OR(Target="",Target=0,Realisasi=""),"",Realisasi/Target)
 */
export type KpiCapaian = number | null;

/**
 * Status KPI — dihitung dari `KpiCapaian` dengan ambang tetap:
 *   capaian null  -> "Belum ada data"
 *   capaian >= 1  -> "Tercapai"
 *   capaian >= 0.7-> "On track"
 *   selain itu    -> "Perlu perhatian"
 * Padanan formula spreadsheet pada kolom `Status` sheet "KPI & Target 2029".
 */
export type KpiStatus =
  | "Belum ada data"
  | "Tercapai"
  | "On track"
  | "Perlu perhatian";

/**
 * Progres flagship — agregat seluruh Activity yang berada di bawah satu Programme.
 * Dihitung saat render; tidak ada padanannya sebagai kolom di spreadsheet.
 */
export interface ProgrammeProgress {
  programme_id: ProgrammeId;
  /** Jumlah seluruh aktivitas programme ini. */
  total: number;
  selesai: number;
  on_track: number;
  perlu_perhatian: number;
  belum_mulai: number;
  ditunda: number;
  /** Aktivitas yang statusnya masih `null`. */
  tanpa_status: number;
  /**
   * Persentase kemajuan = selesai / total * 100.
   * Sesuai perhitungan yang dipakai di UI (`hitungProgres` pada kerangka.html):
   * hanya aktivitas berstatus "Selesai" yang dihitung, aktivitas "On track"
   * TIDAK diberi bobot setengah. `null` bila programme tidak punya aktivitas.
   */
  percent: number | null;
}

/**
 * Aktivitas berisiko — daftar yang dipakai Manajer Program untuk deteksi dini.
 * Kriteria: `status` bernilai "Perlu perhatian" atau "Ditunda".
 * Dihitung saat render; tidak disimpan.
 */
export interface AtRiskActivity {
  activity: Activity;
  /** Alasan masuk daftar risiko. */
  reason: Extract<ActivityStatus, "Perlu perhatian" | "Ditunda">;
  /** Programme induk, untuk konteks tampilan. */
  programme: Programme;
}
