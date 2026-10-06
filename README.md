# SEAMOLEC Monitoring Program

Halaman berada langsung di root repository. `index.html` menampilkan Dashboard, sehingga GitHub Pages dengan sumber branch `main`, folder `/ (root)`, membuka Dashboard pada `/monitoringdev/`.

Aktivitas dan KPI dikelompokkan di `BOD/`, `Manager/`, `Staf/`, dan `PIC/`. Default navigasi adalah BOD; pemilih role berpindah URL untuk halaman Aktivitas/KPI. Route lama `aktivitas.html` dan `kpi.html` mengarahkan ke BOD.

Halaman lain: `timeline.html`, `me.html`, `pendanaan.html`, `laporan.html`, dan `pengaturan.html`. `kerangka.html` tetap tersedia sebagai versi seluruh menu dalam satu file.

`assets/css/` berisi CSS khusus Laporan. `assets/js/` berisi katalog aktivitas dari Excel, interaksi dokumen Laporan, dan pencarian/filter pada Aktivitas. `src/` mempertahankan model data yang sudah ada.

Untuk mencoba secara lokal dari root repository:

```sh
python -m http.server 8000
```

Buka `http://localhost:8000/`. Gunakan alamat dan port yang sama untuk mengakses data dokumen yang tersimpan.

Pada Laporan, unggah dokumen ke layanan pilihan terlebih dahulu, lalu tambahkan tautannya. Metadata disimpan dalam `localStorage` browser; data belum dibagikan antarperangkat atau pengguna. Ekspor CSV mengikuti semua filter dan pencarian aktif, mencakup seluruh hasil, bukan hanya halaman tabel yang terlihat.

Preview Google bergantung pada izin berbagi dokumen. Tautan cover gambar bersifat opsional. Jika tidak ada cover atau viewer yang didukung, aplikasi menampilkan cover ringkasan dari metadata, bukan halaman asli dokumen.

Katalog Laporan mengacu pada 88 aktivitas di sheet **Aktivitas per Flagship** pada Excel yang diberikan. Kode dipilih menurut flagship; pilihan aktivitas terkait membedakan kode yang dipakai pada beberapa aktivitas. Jenis dokumen mengacu pada kebutuhan pelaporan kerangka M&E, FYDP halaman 38.

Filter periode mencakup Q1 (Januari–Maret), Q2 (April–Juni), Q3 (Juli–September), Q4 (Oktober–Desember), Semester 1, Semester 2, dan Tahunan. Periode dicocokkan dengan kategori periode dokumen; tahun dipilih secara terpisah. Semua filter berawal pada pilihan Semua, sehingga seluruh dokumen tersedia dalam daftar.

Kode strategi mengikuti sheet **Ringkasan 9 Flagship**: AILOS → ST3, PROGRES/ADCEND → ST1, R-MODE → WT2, FLEXERA/CREATE/CODEA/NEXEL → WT3, dan COALA → WO2. Dokumen flagship mendapat strategi otomatis, termasuk dokumen yang telah tersimpan sebelum filter ini ditambahkan. Dokumen lintas program dapat diberi strategi secara manual. Kode strategi berbeda dari kode aktivitas T1/R1/I1/C1.

Folder ekspor `figma/`, paket ZIP Figma, dan `design-options/` sudah dihapus. Gunakan route per role untuk impor melalui URL GitHub Pages.

Route desain Staf: `Staf/aktivitas-subtaskopened.html` membuka subtask dan `Staf/aktivitas-addtask.html` membuka form tambah subtask. Keduanya menggunakan aktivitas contoh I1 AILOS secara default. Parameter `?activity=activity-3` (atau ID aktivitas lain) mempertahankan aktivitas yang dipilih. Tombol Staf berpindah URL; simpan/batal kembali ke route subtask terbuka.
