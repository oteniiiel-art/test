const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyR6KUw_KG2unpue72qxbZPi2WHE2UnMfjbNVojbmQhIpRQHJWry7fwyb066OoNbvU-g/exec';
let allData = [];
let filteredData = [];

// Set tanggal hari ini
function setTanggalHeader() {
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    
    const tgl = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
    const jam = now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit',});
    
    document.getElementById('tgl-hdr').textContent = `${tgl} | ${jam}`;
}

// update tiap detik
setTanggalHeader();
setInterval(setTanggalHeader, 1000);

loadData();
function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
    if(tab === 'dashboard') loadData();
}

function formatRupiah(num) {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatTanggal(tgl) {
    if (!tgl) return '-';
    try {
        // Handle berbagai format tanggal
        let date;
        if (typeof tgl === 'string') {
            // Coba parse format ISO (YYYY-MM-DD)
            date = new Date(tgl);
            // Jika hasil Invalid, coba format lain
            if (isNaN(date.getTime())) {
                // Coba format DD/MM/YYYY
                const parts = tgl.split('/');
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    return tgl; // Return original jika tidak bisa parse
                }
            }
        } else {
            date = new Date(tgl);
        }
        
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID');
    } catch (e) {
        return tgl || '-';
    }
}

function handleData(res) {
    allData = res.data;
    filteredData = [...allData];
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');

    if(filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">Data tidak ditemukan</td></tr>';
        return;
    }

    tbody.innerHTML = filteredData.map((row, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${row.instansi || '-'}</td>
            <td>${formatTanggal(row.tanggal)}</td>
            <td>${row.perangkat || '-'}</td>
            <td>${row.jumlah || 0}</td>
            <td>${formatRupiah(row.budget / row.jumlah || 0)}</td>
            <td>${formatRupiah(row.budget)}</td>
            <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${row.spesifikasi || '-'}">${row.spesifikasi || '-'}</td>
            <td>
                <button class="btn-detail" onclick="openDetail(${row.id})">Detail</button>
                <button class="btn-edit" onclick="openEdit(${row.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function loadData() {
    const script = document.createElement('script');
    script.src = SCRIPT_URL + '?callback=handleData';
    document.body.appendChild(script);
}

// Fitur pencarian
document.getElementById('searchInput').addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    filteredData = allData.filter(row =>
        (row.instansi || '').toLowerCase().includes(keyword) ||
        (row.perangkat || '').toLowerCase().includes(keyword) ||
        (row.spesifikasi || '').toLowerCase().includes(keyword)
    );
    renderTable();
});

function resetSearch() {
    document.getElementById('searchInput').value = '';
    filteredData = [...allData];
    renderTable();
}

function openDetail(id) {
    const data = allData.find(d => d.id == id);
    if(!data) return;

    document.getElementById('detailContent').innerHTML = `
        <p><strong>Instansi:</strong> ${data.instansi}</p>
        <p><strong>Tanggal Pengadaan:</strong> ${formatTanggal(data.tanggal)}</p>
        <p><strong>Perangkat:</strong> ${data.perangkat}</p>
        <p><strong>Merk:</strong> ${data.merk}</p>
        <p><strong>Kondisi:</strong> ${data.kondisi}</p>
        <p><strong>Jumlah:</strong> ${data.jumlah}</p>
        <p><strong>Budget/Unit:</strong> ${formatRupiah(data.budget / data.jumlah || 0)}</p>
        <p><strong>Total Budget:</strong> ${formatRupiah(data.budget)}</p>
        <p><strong>Spesifikasi:</strong> ${data.spesifikasi || '-'}</p>
        <p><strong>Nota:</strong> ${data.nota? `<a href="${data.nota}" target="_blank">Lihat Nota</a>` : '-'}</p>
    `;
    document.getElementById('detailModal').style.display = 'flex';
}

function closeDetail() {
    document.getElementById('detailModal').style.display = 'none';
}

function openEdit(id) {
    const data = allData.find(d => d.id == id);
    if(!data) return;

    document.getElementById('editId').value = id;
    document.getElementById('editInstansi').value = data.instansi;
    // Parse tanggal dengan format flexible
    let tanggalValue = '';
    if (data.tanggal) {
        try {
            const date = new Date(data.tanggal);
            if (!isNaN(date.getTime())) {
                tanggalValue = date.toISOString().split('T')[0];
            } else if (typeof data.tanggal === 'string' && /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(data.tanggal)) {
                const parts = data.tanggal.split('/');
                tanggalValue = `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
            }
        } catch (e) {
            tanggalValue = '';
        }
    }
    document.getElementById('editTanggal').value = tanggalValue;
    document.getElementById('editVendor').value = '';
    document.getElementById('editPerangkat').value = data.perangkat;
    document.getElementById('editMerk').value = data.merk;
    document.getElementById('editKondisi').value = data.kondisi;
    document.getElementById('editJumlah').value = data.jumlah;
    document.getElementById('editBudget').value = formatRupiah(data.budget / data.jumlah || 0);
    document.getElementById('editSpesifikasi').value = data.spesifikasi;

    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('id', document.getElementById('editId').value);
    formData.append('instansi', document.getElementById('editInstansi').value);
    formData.append('tanggal', document.getElementById('editTanggal').value);
    formData.append('vendor', document.getElementById('editVendor').value);
    formData.append('perangkat', document.getElementById('editPerangkat').value);
    formData.append('merk', document.getElementById('editMerk').value);
    formData.append('kondisi', document.getElementById('editKondisi').value);
    formData.append('jumlah', document.getElementById('editJumlah').value);
    formData.append('budget', document.getElementById('editBudget').value);
    formData.append('spesifikasi', document.getElementById('editSpesifikasi').value);

    const notaFile = document.getElementById('editNota').files[0];
    if (notaFile) formData.append('nota', notaFile);

    fetch(SCRIPT_URL, {method: 'POST', body: formData, mode: 'no-cors'})
.then(() => {
        alert('Data berhasil diupdate');
        closeModal();
        loadData();
    });
});

function deleteData(id) {
    if(confirm('Yakin mau hapus data ini?')) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);
        fetch(SCRIPT_URL, {method: 'POST', body: formData, mode: 'no-cors'})
 .then(() => {
            alert('Data berhasil dihapus');
            loadData();
        });
    }
}

const jumlah = document.getElementById('jumlah');
const budget = document.getElementById('budget');
const total = document.getElementById('total_budget');

function parseRupiah(str) {
    return parseInt(str.replace(/[^\d]/g, '')) || 0;
}

function hitungTotal() {
    let jml = parseInt(jumlah.value) || 0;
    let bgt = parseRupiah(budget.value);
    total.value = formatRupiah(jml * bgt);
}

budget.addEventListener('input', function(e) {
    e.target.value = formatRupiah(e.target.value);
    hitungTotal();
});
jumlah.addEventListener('input', hitungTotal);

document.getElementById('pengadaanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.querySelector('#pengadaanForm button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    const formData = new FormData(this);

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    }).then(() => {
        document.getElementById('successMsg').style.display = 'block';
        this.reset();
        total.value = '';
        btn.disabled = false;
        btn.textContent = 'Kirim Data Pengadaan';
        setTimeout(() => {
            document.getElementById('successMsg').style.display = 'none';
        }, 3000);
    }).catch(() => {
        alert('Gagal kirim data');
        btn.disabled = false;
        btn.textContent = 'Kirim Data Pengadaan';
    });
});

loadData();