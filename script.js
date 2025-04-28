/**
 * Menambahkan event listener yang akan dijalankan ketika 
 * DOM (Document Object Model) sepenuhnya selesai dimuat.
 * Ini memastikan semua elemen HTML sudah tersedia sebelum
 * kode JavaScript dijalankan.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mendapatkan referensi ke form input tamu dengan ID 'guestbook-form'
    // menggunakan document.getElementById()
    const guestbookForm = document.getElementById('guestbook-form');
    
    // Mendapatkan referensi ke elemen yang akan menampilkan daftar tamu
    const guestList = document.getElementById('guestbook-list');
    
    // Mendapatkan referensi ke input field untuk pencarian tamu
    const searchInput = document.getElementById('search-guest');
    
    // Mendapatkan referensi ke tombol untuk menghapus semua tamu
    const clearAllBtn = document.getElementById('clear-all');
    
    /**
     * Mengambil data tamu dari localStorage dengan key 'guests'.
     * localStorage hanya menyimpan string, jadi kita perlu parse JSON-nya.
     * Jika belum ada data (null), gunakan array kosong sebagai fallback
     * menggunakan operator OR (||).
     */
    let guests = JSON.parse(localStorage.getItem('guests')) || [];
    
    /**
     * Fungsi untuk menampilkan daftar tamu ke dalam DOM.
     * @param {string} filter - String untuk memfilter tamu (opsional)
     */
    function displayGuests(filter = '') {
        /**
         * Memfilter array guests berdasarkan:
         * - Nama tamu yang mengandung string filter (case insensitive)
         * - Atau pesan tamu yang mengandung string filter (case insensitive)
         * Menggunakan method Array.prototype.filter() dan String.prototype.includes()
         */
        const filteredGuests = guests.filter(guest => 
            guest.name.toLowerCase().includes(filter.toLowerCase()) || 
            guest.message.toLowerCase().includes(filter.toLowerCase())
        );
        
        /**
         * Jika tidak ada tamu yang cocok dengan filter,
         * tampilkan pesan "empty state"
         */
        if (filteredGuests.length === 0) {
            // Menggunakan innerHTML untuk mengisi konten
            guestList.innerHTML = `
                <div class="empty-state">
                    <!-- SVG icon untuk visualisasi -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>Tidak ada pengunjung yang ditemukan</p>
                </div>
            `;
            return; // Keluar dari fungsi lebih awal
        }
        
        // Mengosongkan konten guestList sebelum menambahkan yang baru
        guestList.innerHTML = '';
        
        /**
         * Loop melalui setiap tamu yang sudah difilter.
         * forEach memberikan akses ke:
         * - guest: objek tamu saat ini
         * - index: posisi tamu dalam array
         */
        filteredGuests.forEach((guest, index) => {
            // Membuat elemen div baru untuk setiap tamu
            const guestItem = document.createElement('div');
            
            /**
             * Menetapkan class CSS untuk guestItem.
             * Jika guest.attended true, tambahkan class 'attended'
             * Menggunakan template literal dengan conditional
             */
            guestItem.className = `guest-item ${guest.attended ? 'attended' : ''}`;
            
            /**
             * Mengisi konten guestItem dengan HTML string.
             * Menggunakan template literal dengan interpolation (${...})
             */
            guestItem.innerHTML = `
                <div class="guest-info">
                    <h4>${guest.name}</h4>
                    <p class="guest-message">${guest.message}</p>
                    <span class="guest-date">${
                        // Format tanggal ke locale Indonesia
                        new Date(guest.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',    // Tanggal angka (1-31)
                            month: 'long',    // Nama bulan panjang (Januari)
                            year: 'numeric', // Tahun angka (2023)
                            hour: '2-digit',  // Jam 2 digit (01)
                            minute: '2-digit' // Menit 2 digit (05)
                        })
                    }</span>
                </div>
                <div class="guest-actions">
                    <!-- 
                        Tombol untuk toggle status attended:
                        - data-index menyimpan posisi tamu dalam array
                        - title berisi tooltip yang berubah sesuai status
                        - Konten tombol ✓ atau ✗ berdasarkan status
                    -->
                    <button class="toggle-attended" data-index="${index}" 
                            title="${guest.attended ? 'Tandai belum berkunjung' : 'Tandai sudah berkunjung'}">
                        ${guest.attended ? '✓' : '✗'}
                    </button>
                    <!-- Tombol hapus dengan tanda X -->
                    <button class="delete-guest" data-index="${index}" 
                            title="Hapus pengunjung">✕</button>
                </div>
            `;
            
            // Menambahkan guestItem yang sudah dibuat ke dalam guestList
            guestList.appendChild(guestItem);
        });
    }
    
    /**
     * Menambahkan event listener untuk form submission.
     * Event listener menerima parameter event (e) yang digunakan
     * untuk mencegah perilaku default form submission.
     */
    guestbookForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah reload halaman
        
        /**
         * Mengambil nilai input dari form:
         * - trim() menghapus whitespace di awal dan akhir
         * - checked untuk checkbox mengembalikan boolean
         */
        const name = document.getElementById('guest-name').value.trim();
        const message = document.getElementById('guest-message').value.trim();
        const attended = document.getElementById('guest-attended').checked;
        
        // Validasi: nama dan message tidak boleh kosong
        if (name && message) {
            // Membuat objek tamu baru dengan properti:
            const newGuest = {
                name,       // Nama tamu
                message,    // Pesan tamu
                attended,   // Status kehadiran (boolean)
                timestamp: new Date().toISOString() // Waktu sekarang dalam ISO format
            };
            
            /**
             * Menambahkan tamu baru ke awal array dengan unshift()
             * (beda dengan push() yang menambah di akhir)
             */
            guests.unshift(newGuest);
            
            /**
             * Menyimpan array guests ke localStorage.
             * localStorage hanya menerima string, jadi perlu diubah ke JSON
             * dengan JSON.stringify()
             */
            localStorage.setItem('guests', JSON.stringify(guests));
            
            // Memperbarui tampilan daftar tamu
            displayGuests();
            
            // Mereset form ke keadaan awal
            guestbookForm.reset();
            
            // Membuat elemen toast notification
            const toast = document.createElement('div');
            toast.className = 'toast success'; // Class untuk styling
            
            // Konten toast dengan SVG icon dan pesan
            toast.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Terima kasih telah mengisi buku tamu!</span>
            `;
            
            // Menambahkan toast ke body document
            document.body.appendChild(toast);
            
            /**
             * Menggunakan setTimeout untuk animasi:
             * 1. Setelah 100ms, tambahkan class 'show' untuk fade in
             * 2. Setelah 3000ms (3 detik), hapus toast dari DOM
             */
            setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            }, 100);
        }
    });
    
    /**
     * Event delegation untuk menangani klik pada guestList.
     * Digunakan karena tombol aksi dibuat secara dinamis.
     */
    guestList.addEventListener('click', function(e) {
        // Jika yang diklik adalah tombol delete
        if (e.target.classList.contains('delete-guest')) {
            // Ambil index tamu dari atribut data-index
            const index = e.target.getAttribute('data-index');
            
            // Hapus 1 elemen dari array mulai dari index
            guests.splice(index, 1);
            
            // Simpan perubahan ke localStorage
            localStorage.setItem('guests', JSON.stringify(guests));
            
            // Perbarui tampilan dengan filter yang aktif (jika ada)
            displayGuests(searchInput.value);
        }
        
        // Jika yang diklik adalah tombol toggle attended
        if (e.target.classList.contains('toggle-attended')) {
            const index = e.target.getAttribute('data-index');
            
            // Toggle nilai attended (true jadi false, false jadi true)
            guests[index].attended = !guests[index].attended;
            
            // Simpan perubahan
            localStorage.setItem('guests', JSON.stringify(guests));
            
            // Perbarui tampilan
            displayGuests(searchInput.value);
        }
    });
    
    /**
     * Event listener untuk input search.
     * Akan trigger setiap kali nilai input berubah.
     */
    searchInput.addEventListener('input', function() {
        // Panggil displayGuests dengan nilai input saat ini
        displayGuests(this.value);
    });
    
    /**
     * Event listener untuk tombol clear all.
     */
    clearAllBtn.addEventListener('click', function() {
        // Hanya jalankan jika ada tamu dan user mengkonfirmasi
        if (guests.length > 0 && confirm('Apakah Anda yakin ingin menghapus semua data pengunjung?')) {
            // Reset array guests
            guests = [];
            
            // Hapus data dari localStorage
            localStorage.removeItem('guests');
            
            // Perbarui tampilan
            displayGuests();
            
            // Kosongkan input search
            searchInput.value = '';
        }
    });
    
    // Panggil displayGuests pertama kali saat halaman dimuat
    displayGuests();
});