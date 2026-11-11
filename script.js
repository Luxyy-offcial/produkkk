/* ==========================================================
   LUXYYOFC SHOP - APPLICATION LOGIC & DATABASE (script.js)
   ========================================================== */
const ROLE_PACKAGES = {
            member: { name: 'Member Free', price: 0, discount: 0, badge: 'MEMBER FREE', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700', benefitNote: 'Harga produk normal.' },
            reseller: { name: 'Reseller VIP', price: 15000, discount: 0.20, badge: 'RESELLER (-20%)', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40', benefitNote: 'Diskon 20% otomatis.' },
            admin_member: { name: 'Partner Admin', price: 30000, discount: 0, badge: 'PARTNER ADMIN', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', benefitNote: 'Akses Admin Panel.' },
            maker_admin: { name: 'Maker + Admin', price: 100000, discount: 0, badge: 'MAKER + ADMIN', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40', benefitNote: 'Full Admin Panel.' }
        };

        let netflixCrackApiConfig = { endpoint: 'https://api.netflixcrack-provider.com/v1/generate', apiKey: '' };
        let vouchersDB = [
            { code: 'LUXYYHEMAT', discount: 2000, quota: 50, createdBy: 'OWNER (luxyy)' },
            { code: 'PROMOCRACK', discount: 1000, quota: 30, createdBy: 'OWNER (luxyy)' }
        ];

        let products = [
            {
                id: 'netflix-crack-daily',
                name: 'Netflix Crack (Paket Harian / Kilat)',
                category: 'crack',
                badge: 'NETFLIX CRACK • HARIAN',
                icon: 'fa-solid fa-bolt-lightning',
                color: 'from-rose-600 to-red-500',
                desc: 'Khusus Harian menggunakan Netflix Crack! Pilihan durasi 1 Hari, 3 Hari, & 7 Hari.',
                isNetflixCrack: true,
                variants: [
                    { name: '1 Hari (Netflix Crack)', price: 3000 },
                    { name: '3 Hari (Netflix Crack)', price: 7000 },
                    { name: '7 Hari (Netflix Crack)', price: 12000 }
                ],
                stocks: ['nfcrack1@luxyyofc.id | crackpass11', 'nfcrack2@luxyyofc.id | crackpass22']
            },
            {
                id: 'netflix-uhd',
                name: 'Netflix Premium 4K UHD Resmi',
                category: 'streaming',
                badge: 'TERLARIS',
                icon: 'fa-solid fa-tv',
                color: 'from-red-600 to-rose-500',
                desc: 'Akun Netflix 4K Ultra HD Bahasa Indonesia.',
                variants: [
                    { name: '7 Hari', price: 12000 },
                    { name: '1 Bulan Sharing', price: 25000 }
                ],
                stocks: ['netflix1@luxyyofc.id | SandiNF01']
            },
            {
                id: 'canva-pro',
                name: 'Canva Pro Designer + AI',
                category: 'design',
                badge: 'FULL GARANSI',
                icon: 'fa-solid fa-palette',
                color: 'from-cyan-500 to-blue-600',
                desc: 'Akses semua elemen Pro dan Magic Studio AI.',
                variants: [
                    { name: '1 Bulan Invite', price: 10000 },
                    { name: '1 Tahun', price: 25000 }
                ],
                stocks: ['canvapro1@luxyyofc.id | CanvaPass1']
            }
        ];

        let usersDB = [
            { name: 'Rizky Pratama', username: 'rizky_pratama', wa: '08529123456', password: '123', role: 'member', createdAt: 'Rabu, 11 November 2026 • 07:30:12 WIB' },
            { name: 'Dewi Lestari', username: 'dewi_store', wa: '08129887766', password: '123', role: 'reseller', createdAt: 'Rabu, 11 November 2026 • 07:42:05 WIB' }
        ];
        let ordersDB = [];
        let partnerActivityLogs = [{ time: 'Rabu, 11 November 2026 • 08:00:00 WIB', actor: 'SYSTEM', role: 'OWNER', action: 'Sistem siap digunakan.' }];
        let fakeNotifLogs = [
            { time: 'Rabu, 11 November 2026 • 07:30:12 WIB', text: '🎉 @rizky_pratama (0852-xxxx-456) baru saja mendaftar akun Member!', details: 'User: @rizky_pratama | WA: 08529123456 | Pass: 123' },
            { time: 'Rabu, 11 November 2026 • 07:42:05 WIB', text: '👑 @dewi_store (0812-xxxx-766) baru saja bergabung sebagai Reseller VIP!', details: 'User: @dewi_store | WA: 08129887766 | Pass: 123' }
        ];

        let currentUser = null;
        let isOwnerAdminLoggedIn = false;
        let autoFakeNotifEnabled = true;
        let currentCategory = 'all';
        let activeCheckoutMode = 'product';
        let activeProduct = null;
        let activeVariantIdx = 0;
        let activeUpgradeRoleKey = null;
        let pendingInvoice = '';
        let appliedVoucherObj = null;
        let customQrisBase64 = '';

        // ============================================================================
        // 1. JAVASCRIPT PERSISTENT DATABASE ENGINE (LOCALSTORAGE) & WEB AUDIO ENGINE
        // ============================================================================
        const DB_STORAGE_KEY = 'LUXYYOFC_SHOP_PRODUCTION_DB_V1';

        function playWebSound(type = 'pop') {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                const now = ctx.currentTime;
                if (type === 'success') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
                    osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                    osc.start(now);
                    osc.stop(now + 0.45);
                } else {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.12);
                }
            } catch (err) {
                // Ignore audio context restriction before user interaction
            }
        }

        function saveAppState() {
            try {
                const payload = {
                    products,
                    usersDB,
                    ordersDB,
                    vouchersDB,
                    partnerActivityLogs: partnerActivityLogs.slice(0, 60),
                    fakeNotifLogs: fakeNotifLogs.slice(0, 60),
                    customOwnerBroadcasts,
                    netflixCrackApiConfig,
                    customQrisBase64,
                    savedSessionUser: currentUser ? currentUser.username : null,
                    isOwnerAdminLoggedIn
                };
                localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(payload));
            } catch (e) {
                console.warn('Gagal menyimpan state ke localStorage:', e);
            }
        }

        function loadAppState() {
            try {
                const raw = localStorage.getItem(DB_STORAGE_KEY);
                if (!raw) return;
                const data = JSON.parse(raw);
                if (Array.isArray(data.products) && data.products.length > 0) products = data.products;
                if (Array.isArray(data.usersDB) && data.usersDB.length > 0) usersDB = data.usersDB;
                if (Array.isArray(data.ordersDB)) ordersDB = data.ordersDB;
                if (Array.isArray(data.vouchersDB)) vouchersDB = data.vouchersDB;
                if (Array.isArray(data.partnerActivityLogs)) partnerActivityLogs = data.partnerActivityLogs;
                if (Array.isArray(data.fakeNotifLogs)) fakeNotifLogs = data.fakeNotifLogs;
                if (Array.isArray(data.customOwnerBroadcasts)) customOwnerBroadcasts = data.customOwnerBroadcasts;
                if (data.netflixCrackApiConfig) netflixCrackApiConfig = data.netflixCrackApiConfig;
                if (data.customQrisBase64) {
                    customQrisBase64 = data.customQrisBase64;
                    const wrap = document.getElementById('customFullPosterWrapper');
                    const img = document.getElementById('customFullPosterImg');
                    const def = document.getElementById('defaultYusufPosterLayout');
                    if (wrap && img && def) {
                        wrap.classList.remove('hidden');
                        img.src = customQrisBase64;
                        def.classList.add('hidden');
                    }
                }
                if (typeof data.isOwnerAdminLoggedIn === 'boolean') {
                    isOwnerAdminLoggedIn = data.isOwnerAdminLoggedIn;
                }
                if (data.savedSessionUser) {
                    if (data.savedSessionUser.toLowerCase() === 'luxyy' && isOwnerAdminLoggedIn) {
                        currentUser = {
                            name: 'Owner Luxyy',
                            username: 'luxyy',
                            wa: '088229239987',
                            password: 'luxyy123',
                            role: 'maker_admin',
                            createdAt: 'OWNER UTAMA'
                        };
                    } else {
                        const found = usersDB.find(u => u.username.toLowerCase() === data.savedSessionUser.toLowerCase());
                        if (found) currentUser = found;
                    }
                }
            } catch (e) {
                console.warn('Gagal memuat state dari localStorage:', e);
            }
        }

        function copyTextToClipboard(text, label = 'Data akun') {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            playWebSound('pop');
            showToast(`${label} berhasil disalin ke Clipboard!`);
        }

        function exportDatabaseJson() {
            saveAppState();
            const raw = localStorage.getItem(DB_STORAGE_KEY) || JSON.stringify({ usersDB, ordersDB, products });
            const blob = new Blob([raw], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-luxyyofc-shop-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            playWebSound('success');
            showToast('File Backup Database (.json) berhasil diunduh!');
        }

        function resetDatabaseToDefault() {
            localStorage.removeItem(DB_STORAGE_KEY);
            showToast('Database di-reset ke pengaturan awal. Memuat ulang...');
            setTimeout(() => window.location.reload(), 900);
        }

        // FUNGSI FORMAT TANGGAL, BULAN, TAHUN & JAM:MENIT:DETIK LENGKAP
        function getFullDateTimeString() {
            const now = new Date();
            const datePart = now.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const timePart = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            return `${datePart} • ${timePart} WIB`;
        }

        function startRealtimeClockUpdater() {
            const updateAllClocks = () => {
                const fullStr = getFullDateTimeString();
                document.querySelectorAll('.liveClockFullDisplay').forEach(el => {
                    el.innerText = fullStr;
                });
            };
            updateAllClocks();
            setInterval(updateAllClocks, 1000);
        }

        // Data generator untuk Fake Pendaftaran Otomatis
        const fakeNamesPool = [
            { name: 'Fajar Nugraha', user: 'fajar_nug', wa: '08138821901', pass: 'fajar123' },
            { name: 'Nabila Putri', user: 'nabila_ptr', wa: '08572219440', pass: 'bila99' },
            { name: 'Dimas Anggara', user: 'dimas_ang', wa: '08821093812', pass: 'dimas77' },
            { name: 'Siti Rahmawati', user: 'siti_rahma', wa: '08965541239', pass: 'rahma01' },
            { name: 'Reza Mahendra', user: 'reza_mhn', wa: '08219984120', pass: 'reza888' },
            { name: 'Aulia Zahra', user: 'aulia_zhr', wa: '08781123904', pass: 'aulia55' }
        ];

        // Broadcast Fake Notification Loop for All Users (including guests)
        let publicBroadcastPool = [
            '🔥 Pengunjung baru baru saja mendaftar akun Member di Luxyyofc Shop!',
            '💳 Pembayaran Berhasil! Pesanan Netflix Crack 3 Hari untuk @dewi_store telah dikonfirmasi Owner.',
            '📢 Promo diskon voucher "LUXYYHEMAT" aktif hari ini untuk semua member.',
            '✨ @rizky_pratama baru saja mendaftar akun Member baru di Luxyyofc Shop!'
        ];

        // Daftar Broadcast Kustom yang Diatur dari Owner Panel
        let customOwnerBroadcasts = [
            {
                id: 'bc-default-1',
                category: 'WAJIB JOIN SALURAN',
                message: 'Wajib join Saluran Resmi Luxyyofc Shop untuk klaim garansi, info restock Netflix Crack & bagi-bagi kode voucher harian!',
                btnLabel: 'Join Saluran Sekarang',
                link: 'https://wa.me/6288229239987',
                time: 'AKTIF'
            }
        ];

        function showGlobalFloatingPopup(badge, text, timeStr, iconHtml = '<i class="fa-solid fa-bell"></i>', actionLink = '', actionLabel = '') {
            const box = document.getElementById('globalFloatingNotif');
            const badgeEl = document.getElementById('globalFloatingBadge');
            const timeEl = document.getElementById('globalFloatingTime');
            const textEl = document.getElementById('globalFloatingText');
            const iconEl = document.getElementById('globalFloatingIcon');
            const actionWrap = document.getElementById('globalFloatingActionWrap');
            const actionLinkEl = document.getElementById('globalFloatingActionLink');
            const actionLabelEl = document.getElementById('globalFloatingActionLabel');
            const topBarText = document.getElementById('liveWebNotifText');

            if (topBarText) topBarText.innerHTML = text;
            if (!box || !badgeEl || !timeEl || !textEl) return;

            badgeEl.innerText = badge;
            timeEl.innerText = timeStr;
            textEl.innerHTML = text;
            if (iconEl) iconEl.innerHTML = iconHtml;

            if (actionWrap && actionLinkEl && actionLabelEl) {
                if (actionLink) {
                    actionWrap.classList.remove('hidden');
                    actionLinkEl.href = actionLink;
                    actionLabelEl.innerText = actionLabel || 'Kunjungi Link';
                } else {
                    actionWrap.classList.add('hidden');
                }
            }

            box.classList.remove('translate-y-28', 'opacity-0');
            box.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                box.classList.remove('translate-y-0', 'opacity-100');
                box.classList.add('translate-y-28', 'opacity-0');
            }, 5200);
        }

        function ownerSendCustomBroadcast() {
            const category = document.getElementById('ownerBroadcastCategory').value;
            const message = document.getElementById('ownerBroadcastMessage').value.trim();
            const btnLabel = document.getElementById('ownerBroadcastBtnLabel').value.trim() || 'Buka Sekarang';
            const link = document.getElementById('ownerBroadcastLink').value.trim();
            const pinBanner = document.getElementById('ownerBroadcastPinBanner').checked;

            if (!message) {
                showToast('Isi pesan broadcast wajib diisi!');
                return;
            }

            const timeStr = getFullDateTimeString();
            const newBc = {
                id: 'bc-' + Date.now(),
                category,
                message,
                btnLabel,
                link,
                time: timeStr
            };
            customOwnerBroadcasts.unshift(newBc);

            // Masukkan juga ke antrean broadcast berjalan & log di Owner Panel
            const formattedHtml = `📢 <strong>[${category}]</strong> ${message}`;
            publicBroadcastPool.unshift(formattedHtml);
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `📢 BROADCAST OWNER [${category}]: ${message}`,
                details: link ? `Tombol: "${btnLabel}" -> ${link}` : 'Tanpa Link Tombol'
            });

            // Jika dicentang pasang sebagai Banner Atas Toko
            if (pinBanner) {
                const bannerEl = document.getElementById('pinnedOwnerBroadcastBanner');
                const badgeEl = document.getElementById('pinnedBroadcastBadge');
                const msgEl = document.getElementById('pinnedBroadcastMessage');
                const actionArea = document.getElementById('pinnedBroadcastActionArea');

                if (bannerEl) bannerEl.classList.remove('hidden');
                if (badgeEl) badgeEl.innerText = '📢 ' + category;
                if (msgEl) msgEl.innerText = message;
                if (actionArea) {
                    if (link) {
                        actionArea.innerHTML = `
                            <a href="${link}" target="_blank" class="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow transition flex items-center gap-1">
                                <span>${btnLabel}</span> <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            </a>
                        `;
                    } else {
                        actionArea.innerHTML = '';
                    }
                }
            }

            // Langsung tembak popup melayang ke semua user sekarang
            showGlobalFloatingPopup(
                category,
                `<strong>${message}</strong>`,
                timeStr,
                '<i class="fa-solid fa-tower-broadcast text-amber-400"></i>',
                link,
                btnLabel
            );

            playWebSound('success');
            saveAppState();
            showToast('Broadcast berhasil dikirim & dipasang ke seluruh user!');
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function ownerClearPinnedBanner() {
            const bannerEl = document.getElementById('pinnedOwnerBroadcastBanner');
            if (bannerEl) bannerEl.classList.add('hidden');
            showToast('Kartu broadcast di pojok kanan bawah disembunyikan.');
        }

        function ownerDeleteCustomBroadcast(bcId) {
            customOwnerBroadcasts = customOwnerBroadcasts.filter(b => b.id !== bcId);
            saveAppState();
            showToast('Item broadcast dihapus dari daftar rotasi.');
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function triggerManualFakeRegistration() {
            const pick = fakeNamesPool[Math.floor(Math.random() * fakeNamesPool.length)];
            const suffix = Math.floor(10 + Math.random() * 89);
            const uName = `${pick.user}${suffix}`;
            const maskedWa = pick.wa.slice(0, 4) + '-xxxx-' + pick.wa.slice(-3);
            const timeStr = getFullDateTimeString();

            const msg = `🎉 Member baru <strong>@${uName}</strong> (${maskedWa}) baru saja mendaftar akun di Luxyyofc Shop!`;
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `🎉 FAKE NOTIF DAFTAR: @${uName} (${maskedWa}) baru saja daftar akun!`,
                details: `Username: @${uName} | Nomor WA: ${pick.wa} | Password: ${pick.pass} | Waktu Daftar: ${timeStr}`
            });
            publicBroadcastPool.unshift(msg);

            showGlobalFloatingPopup('MEMBER BARU DAFTAR', msg, 'Baru Saja', '<i class="fa-solid fa-user-plus"></i>');
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function triggerManualFakePurchaseSuccess() {
            const pick = fakeNamesPool[Math.floor(Math.random() * fakeNamesPool.length)];
            const prodPick = products[Math.floor(Math.random() * products.length)];
            const varPick = prodPick.variants[0];
            const timeStr = getFullDateTimeString();

            const msg = `✅ <strong>Pembayaran Berhasil!</strong> Pesanan <strong>${prodPick.name} (${varPick.name})</strong> untuk <strong>@${pick.user}</strong> telah dikonfirmasi Owner.`;
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `✅ FAKE NOTIF LUNAS: @${pick.user} membeli ${prodPick.name} (${varPick.name})`,
                details: `Pembeli: @${pick.user} | Produk: ${prodPick.name} | Total: ${formatRupiah(varPick.price + 100)} | Waktu: ${timeStr}`
            });
            publicBroadcastPool.unshift(msg);

            showGlobalFloatingPopup('PEMBAYARAN BERHASIL', msg, 'Baru Saja', '<i class="fa-solid fa-circle-check text-emerald-400"></i>');
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function toggleAutoFakeNotifLoop() {
            autoFakeNotifEnabled = !autoFakeNotifEnabled;
            const btn = document.getElementById('btnToggleAutoFake');
            if (btn) {
                btn.innerText = autoFakeNotifEnabled ? 'AUTO LOOP: ON' : 'AUTO LOOP: OFF';
                btn.className = autoFakeNotifEnabled
                    ? 'px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black'
                    : 'px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black';
            }
            showToast(`Auto-Loop Fake Notif diubah ke: ${autoFakeNotifEnabled ? 'AKTIF' : 'NONAKTIF'}`);
        }

        function ownerQuickTestBuy() {
            if (!currentUser) {
                currentUser = {
                    name: 'Owner Luxyy',
                    username: 'luxyy',
                    wa: '088229239987',
                    password: 'luxyy123',
                    role: 'maker_admin',
                    createdAt: 'OWNER UTAMA'
                };
            }
            openQrisCheckout(products[0].id);
        }

        function startPublicBroadcastTicker() {
            let idx = 0;
            // Tampilkan notifikasi pertama kali untuk semua pengunjung (termasuk yang belum daftar)
            setTimeout(() => {
                showGlobalFloatingPopup('INFO LIVE LUXYYOFC', publicBroadcastPool[0], 'Baru Saja', '<i class="fa-solid fa-bolt"></i>');
            }, 2000);

            setInterval(() => {
                if (!autoFakeNotifEnabled) return;
                // Rotasi antara Broadcast Kustom Owner (Promo/Wajib Join Saluran), Fake Daftar, dan Broadcast Umum
                const rand = Math.random();

                if (customOwnerBroadcasts.length > 0 && rand < 0.38) {
                    const bc = customOwnerBroadcasts[idx % customOwnerBroadcasts.length];
                    showGlobalFloatingPopup(
                        bc.category,
                        `<strong>${bc.message}</strong>`,
                        'Info Resmi',
                        '<i class="fa-solid fa-bullhorn text-amber-400"></i>',
                        bc.link,
                        bc.btnLabel
                    );
                    idx++;
                } else if (rand < 0.72) {
                    triggerManualFakeRegistration();
                } else {
                    const text = publicBroadcastPool[idx % publicBroadcastPool.length];
                    showGlobalFloatingPopup('LIVE BROADCAST', text, 'Baru Saja', '<i class="fa-solid fa-circle-check"></i>');
                    idx++;
                }
            }, 9000);
        }

        function formatRupiah(num) {
            return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
        }

        function showToast(msg) {
            const container = document.getElementById('toastContainer');
            if (container) {
                const el = document.createElement('div');
                el.className = 'px-4 py-3 rounded-2xl bg-slate-900/95 border border-indigo-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5';
                el.innerHTML = `<i class="fa-solid fa-bell text-amber-400"></i><span>${msg}</span>`;
                container.appendChild(el);
                setTimeout(() => el.remove(), 4500);
            }
        }

        function getEffectivePrice(basePrice, role = null) {
            const r = role || (currentUser ? currentUser.role : 'member');
            if (r !== 'reseller') return basePrice;
            return Math.round(basePrice * 0.80);
        }

        function getMyOrders() {
            if (!currentUser) return [];
            return ordersDB.filter(o => o.username.toLowerCase() === currentUser.username.toLowerCase());
        }

        function switchMainView(viewName) {
            if (viewName === 'admin') {
                if (!isOwnerAdminLoggedIn) {
                    showToast('Silakan masuk menggunakan akun resmi Anda.');
                    openAuthModal('login');
                    return;
                }
                ['store', 'member', 'admin'].forEach(v => document.getElementById(`view-${v}`).classList.add('hidden'));
                document.getElementById('view-admin').classList.remove('hidden');
                renderOwnerAdminPanel();
                return;
            }

            if (viewName === 'member' && !currentUser) {
                showToast('Silakan masuk atau daftar akun terlebih dahulu.');
                openAuthModal('login');
                return;
            }

            ['store', 'member', 'admin'].forEach(v => document.getElementById(`view-${v}`).classList.add('hidden'));
            document.getElementById(`view-${viewName}`).classList.remove('hidden');

            if (viewName === 'store') renderProducts();
            if (viewName === 'member') renderMemberDashboard();
        }

        function renderHeaderAuth() {
            const container = document.getElementById('headerAuthArea');
            const heroBannerActions = document.getElementById('heroBannerActions');
            const navOwnerBtn = document.getElementById('navBtnOwnerAdmin');
            const navUserAdminBtn = document.getElementById('navBtnUserAdminPanel');

            if (navOwnerBtn) navOwnerBtn.classList.toggle('hidden', !isOwnerAdminLoggedIn);
            if (navUserAdminBtn) navUserAdminBtn.classList.toggle('hidden', !(currentUser && (currentUser.role === 'admin_member' || currentUser.role === 'maker_admin')));

            const showJoinPrompts = Boolean(currentUser && currentUser.role === 'member');
            const hasJoinedPartner = Boolean(currentUser && currentUser.role !== 'member');

            ['navBtnJoinRole', 'footerJoinBtn', 'footerJoinDot', 'btnMemberDashUpgrade'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.toggle('hidden', !showJoinPrompts);
            });

            const heroGuestFeaturesList = document.getElementById('heroGuestFeaturesList');
            const heroRolePackagesList = document.getElementById('heroRolePackagesList');
            const heroJoinedActiveBox = document.getElementById('heroJoinedActiveBox');
            const heroRightActionCell = document.getElementById('heroRightActionCell');
            const heroRightBoxTitle = document.getElementById('heroRightBoxTitle');

            if (!currentUser) {
                if (heroGuestFeaturesList) heroGuestFeaturesList.classList.remove('hidden');
                if (heroRolePackagesList) heroRolePackagesList.classList.add('hidden');
                if (heroJoinedActiveBox) heroJoinedActiveBox.classList.add('hidden');
                if (heroRightBoxTitle) heroRightBoxTitle.innerText = 'Informasi Luxyyofc Shop';
                if (heroRightActionCell) {
                    heroRightActionCell.innerHTML = `<button onclick="openAuthModal('register')" class="w-full rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 font-bold text-xs py-2.5 mt-2 transition">Daftar Akun Member Gratis →</button>`;
                }
            } else if (showJoinPrompts) {
                if (heroGuestFeaturesList) heroGuestFeaturesList.classList.add('hidden');
                if (heroRolePackagesList) heroRolePackagesList.classList.remove('hidden');
                if (heroJoinedActiveBox) heroJoinedActiveBox.classList.add('hidden');
                if (heroRightBoxTitle) heroRightBoxTitle.innerText = 'Pilihan Level Member / Partner';
                if (heroRightActionCell) {
                    heroRightActionCell.innerHTML = `<button onclick="openUpgradeRoleModal()" class="w-full rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-bold text-xs py-2.5 mt-2 transition"><i class="fa-solid fa-crown mr-1"></i> Join Reseller / Admin / Maker →</button>`;
                }
            } else if (hasJoinedPartner) {
                const roleInfo = ROLE_PACKAGES[currentUser.role] || ROLE_PACKAGES.member;
                if (heroGuestFeaturesList) heroGuestFeaturesList.classList.add('hidden');
                if (heroRolePackagesList) heroRolePackagesList.classList.add('hidden');
                if (heroRightBoxTitle) heroRightBoxTitle.innerText = 'Status Partner Aktif';
                if (heroJoinedActiveBox) {
                    heroJoinedActiveBox.classList.remove('hidden');
                    heroJoinedActiveBox.innerHTML = `
                        <div class="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleInfo.badgeClass}">${roleInfo.badge}</span>
                                <span class="text-emerald-400 font-bold text-[11px]"><i class="fa-solid fa-circle-check mr-1"></i>Aktif</span>
                            </div>
                            <p class="text-white font-bold text-sm">Level ${roleInfo.name}</p>
                            <p class="text-slate-400 text-[11px] leading-relaxed">${roleInfo.benefitNote}</p>
                        </div>
                    `;
                }
                if (heroRightActionCell) {
                    if (currentUser.role === 'admin_member' || currentUser.role === 'maker_admin') {
                        heroRightActionCell.innerHTML = `<button onclick="openPartnerAdminModal()" class="w-full rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 font-bold text-xs py-2.5 mt-2 transition"><i class="fa-solid fa-sliders mr-1"></i> Buka Admin Panel Saya →</button>`;
                    } else {
                        heroRightActionCell.innerHTML = '';
                    }
                }
            }

            const badgeCount = document.getElementById('myOrderBadgeCount');
            if (badgeCount) badgeCount.innerText = getMyOrders().length;

            if (!currentUser) {
                if (container) {
                    container.innerHTML = `
                        <button onclick="openAuthModal('login')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition">Masuk</button>
                        <button onclick="openAuthModal('register')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg transition">Daftar</button>
                    `;
                }
                if (heroBannerActions) {
                    heroBannerActions.innerHTML = `
                        <button onclick="openAuthModal('register')" class="px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-200 transition shadow-lg"><i class="fa-solid fa-user-plus mr-2 text-indigo-600"></i> Daftar Akun Sekarang</button>
                        <button onclick="openAuthModal('login')" class="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition">Masuk Akun</button>
                    `;
                }
            } else {
                const roleInfo = ROLE_PACKAGES[currentUser.role] || ROLE_PACKAGES.member;
                if (container) {
                    container.innerHTML = `
                        <button onclick="switchMainView('member')" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center space-x-2">
                            <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">${currentUser.name.charAt(0).toUpperCase()}</div>
                            <div class="text-left hidden sm:block">
                                <p class="text-xs font-bold text-white leading-none">${currentUser.username}</p>
                                <span class="text-[9px] font-mono uppercase text-emerald-400">${roleInfo.badge}</span>
                            </div>
                        </button>
                        <button onclick="logoutUser()" class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition" title="Keluar"><i class="fa-solid fa-power-off text-xs"></i></button>
                    `;
                }
                if (heroBannerActions) {
                    heroBannerActions.innerHTML = `
                        <div class="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs flex flex-wrap items-center gap-3">
                            <span class="px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase ${roleInfo.badgeClass}">${roleInfo.badge}</span>
                            <span class="text-slate-200">Halo, <strong>${currentUser.name}</strong> (@${currentUser.username})</span>
                            ${currentUser.role === 'member' ? `<button onclick="openUpgradeRoleModal()" class="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"><i class="fa-solid fa-crown mr-1"></i>Upgrade</button>` : ''}
                        </div>
                    `;
                }
            }
        }

        function renderProducts() {
            const searchElem = document.getElementById('searchInput');
            const search = searchElem ? searchElem.value.toLowerCase() : '';
            const grid = document.getElementById('productGrid');
            if (!grid) return;

            const filtered = products.filter(p => {
                const matchCat = currentCategory === 'all' || p.category === currentCategory;
                const matchSearch = p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
                return matchCat && matchSearch;
            });

            grid.innerHTML = filtered.map(p => {
                const lowestPrice = Math.min(...p.variants.map(v => v.price));
                const effectiveLowest = getEffectivePrice(lowestPrice);
                const isCrackBadge = p.isNetflixCrack || p.category === 'crack';

                return `
                    <div class="glass-card rounded-2xl p-5 border ${isCrackBadge ? 'border-rose-500/40' : 'border-slate-800'} flex flex-col justify-between space-y-4">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center text-lg shadow-lg">
                                    <i class="${p.icon}"></i>
                                </div>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCrackBadge ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">${p.badge}</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-white text-base">${p.name}</h4>
                                ${isCrackBadge ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-extrabold text-rose-300"><i class="fa-solid fa-fire mr-1"></i>KHUSUS HARIAN: NETFLIX CRACK</span>` : ''}
                                <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.desc}</p>
                            </div>
                        </div>
                        <div class="space-y-3 pt-3 border-t border-slate-800">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400">Harga Mulai:</span>
                                <span class="font-extrabold text-emerald-400 font-mono text-sm">${formatRupiah(effectiveLowest)}</span>
                            </div>
                            <button onclick="openQrisCheckout('${p.id}')" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition">
                                <i class="fa-solid fa-cart-shopping mr-1.5"></i> Beli Sekarang
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function setCategory(cat) {
            currentCategory = cat;
            renderProducts();
        }

        function openAuthModal(tab = 'login') {
            document.getElementById('authModal').classList.remove('hidden');
            switchAuthTab(tab);
        }

        function closeAuthModal() {
            document.getElementById('authModal').classList.add('hidden');
        }

        function switchAuthTab(tab) {
            const btnLogin = document.getElementById('authTabBtn-login');
            const btnReg = document.getElementById('authTabBtn-register');
            const formLogin = document.getElementById('authForm-login');
            const formReg = document.getElementById('authForm-register');

            if (tab === 'login') {
                btnLogin.className = 'py-2.5 rounded-lg bg-indigo-600 text-white transition';
                btnReg.className = 'py-2.5 rounded-lg text-slate-400 hover:text-white transition';
                formLogin.classList.remove('hidden');
                formReg.classList.add('hidden');
            } else {
                btnReg.className = 'py-2.5 rounded-lg bg-purple-600 text-white transition';
                btnLogin.className = 'py-2.5 rounded-lg text-slate-400 hover:text-white transition';
                formReg.classList.remove('hidden');
                formLogin.classList.add('hidden');
            }
        }

        function submitMemberLogin() {
            const u = document.getElementById('loginUsername').value.trim();
            const p = document.getElementById('loginPassword').value.trim();
            if (!u || !p) {
                showToast('Username dan password wajib diisi.');
                return;
            }

            // Cek apakah login sebagai owner (luxyy / luxyy123)
            if (u.toLowerCase() === 'luxyy' && p === 'luxyy123') {
                isOwnerAdminLoggedIn = true;
                // Set currentUser juga agar Owner bisa langsung test beli produk di katalog
                currentUser = {
                    name: 'Owner Luxyy',
                    username: 'luxyy',
                    wa: '088229239987',
                    password: 'luxyy123',
                    role: 'maker_admin',
                    createdAt: 'OWNER UTAMA'
                };
                saveAppState();
                playWebSound('success');
                closeAuthModal();
                showToast('Berhasil masuk ke Owner Panel! Semua sesi tersimpan otomatis.');
                renderHeaderAuth();
                switchMainView('admin');
                return;
            }

            const found = usersDB.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
            if (!found) {
                showToast('Username atau password salah / akun belum terdaftar.');
                return;
            }
            currentUser = found;
            saveAppState();
            playWebSound('success');
            closeAuthModal();
            showToast(`Berhasil masuk sebagai @${currentUser.username}`);
            renderHeaderAuth();
            switchMainView('store');
        }

        function submitMemberRegister() {
            const name = document.getElementById('regName').value.trim();
            const username = document.getElementById('regUsername').value.trim().toLowerCase();
            const wa = document.getElementById('regWhatsapp').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            if (!name || !username || !wa || !password) {
                showToast('Semua kolom form pendaftaran wajib diisi.');
                return;
            }
            if (usersDB.some(x => x.username === username)) {
                showToast('Username sudah terdaftar. Gunakan yang lain.');
                return;
            }
            const timeStr = getFullDateTimeString();
            const newUser = { name, username, wa, password, role: 'member', createdAt: timeStr };
            usersDB.unshift(newUser);
            currentUser = newUser;

            // Catat ke fake notif & broadcast ke seluruh user & owner panel
            const broadcastText = `🎉 Pengguna baru <strong>@${username}</strong> baru saja mendaftar di Luxyyofc Shop!`;
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `🎉 PENDAFTAR ASLI: @${username} baru saja mendaftar akun Member!`,
                details: `Username: @${username} | WA: ${wa} | Password: ${password} | Waktu Daftar: ${timeStr}`
            });
            publicBroadcastPool.unshift(broadcastText);
            showGlobalFloatingPopup('MEMBER BARU DAFTAR', broadcastText, 'Baru Saja', '<i class="fa-solid fa-user-check"></i>');

            saveAppState();
            playWebSound('success');
            closeAuthModal();
            showToast('Pendaftaran akun berhasil & tersimpan di database!');
            renderHeaderAuth();
            switchMainView('store');
        }

        function logoutUser() {
            currentUser = null;
            saveAppState();
            showToast('Anda telah keluar dari akun.');
            renderHeaderAuth();
            switchMainView('store');
        }

        function openUpgradeRoleModal() {
            if (!currentUser) {
                showToast('Silakan masuk akun terlebih dahulu.');
                openAuthModal('login');
                return;
            }
            document.getElementById('upgradeRoleModal').classList.remove('hidden');
        }

        function closeUpgradeRoleModal() {
            document.getElementById('upgradeRoleModal').classList.add('hidden');
        }

        function startRoleUpgradeCheckout(roleKey) {
            if (!currentUser) return;
            activeCheckoutMode = 'role';
            activeUpgradeRoleKey = roleKey;
            pendingInvoice = 'INV-ROLE-' + Math.floor(100000 + Math.random() * 900000);
            appliedVoucherObj = null;
            closeUpgradeRoleModal();

            const rObj = ROLE_PACKAGES[roleKey];
            document.getElementById('qrisModalProductTitle').innerText = 'Upgrade Level: ' + rObj.name;
            document.getElementById('qrisModalBuyerUser').innerText = '@' + currentUser.username;
            document.getElementById('qrisModalInvoice').innerText = pendingInvoice;
            document.getElementById('qrisModalBasePrice').innerText = formatRupiah(rObj.price);
            document.getElementById('qrisVariantSection').classList.add('hidden');
            document.getElementById('qrisVoucherSection').classList.add('hidden');
            document.getElementById('qrisVoucherRow').classList.add('hidden');
            document.getElementById('qrisModalTotal').innerText = formatRupiah(rObj.price + 100);

            document.getElementById('qrisCheckoutModal').classList.remove('hidden');
        }

        function openQrisCheckout(prodId) {
            if (!currentUser) {
                showToast('Silakan masuk akun terlebih dahulu sebelum membeli.');
                openAuthModal('login');
                return;
            }
            activeCheckoutMode = 'product';
            activeProduct = products.find(p => p.id === prodId);
            if (!activeProduct) return;
            activeVariantIdx = 0;
            pendingInvoice = 'INV-PRD-' + Math.floor(100000 + Math.random() * 900000);
            appliedVoucherObj = null;

            // JIKA OWNER YANG KLIK BELI: LANGSUNG SUKSES TANPA PERLU KONFIRMASI / MODAL QRIS
            const isOwnerBuyer = isOwnerAdminLoggedIn || currentUser.username.toLowerCase() === 'luxyy';
            if (isOwnerBuyer) {
                confirmQrisWhatsApp();
                return;
            }

            document.getElementById('qrisModalProductTitle').innerText = activeProduct.name;
            document.getElementById('qrisModalBuyerUser').innerText = '@' + currentUser.username;
            document.getElementById('qrisModalInvoice').innerText = pendingInvoice;
            document.getElementById('qrisVoucherSection').classList.remove('hidden');

            const varSec = document.getElementById('qrisVariantSection');
            varSec.classList.remove('hidden');
            const varList = document.getElementById('qrisVariantList');
            varList.innerHTML = activeProduct.variants.map((v, i) => `
                <button onclick="selectVariant(${i})" id="variantBtn-${i}" class="p-2 rounded-xl border text-xs font-bold text-left transition ${i === 0 ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}">
                    <div>${v.name}</div>
                    <div class="text-emerald-400 font-mono mt-0.5">${formatRupiah(getEffectivePrice(v.price))}</div>
                </button>
            `).join('');

            updateQrisModalPricing();
            document.getElementById('qrisCheckoutModal').classList.remove('hidden');
        }

        function selectVariant(idx) {
            activeVariantIdx = idx;
            activeProduct.variants.forEach((v, i) => {
                const btn = document.getElementById(`variantBtn-${i}`);
                if (btn) {
                    btn.className = i === idx ? 'p-2 rounded-xl border text-xs font-bold text-left transition bg-indigo-600/30 border-indigo-500 text-white' : 'p-2 rounded-xl border text-xs font-bold text-left transition bg-slate-900 border-slate-800 text-slate-300';
                }
            });
            updateQrisModalPricing();
        }

        function updateQrisModalPricing() {
            if (!activeProduct) return;
            const base = activeProduct.variants[activeVariantIdx].price;
            const eff = getEffectivePrice(base);
            document.getElementById('qrisModalBasePrice').innerText = formatRupiah(eff);

            let disc = 0;
            if (appliedVoucherObj) {
                disc = appliedVoucherObj.discount;
                document.getElementById('qrisVoucherRow').classList.remove('hidden');
                document.getElementById('qrisVoucherCodeLabel').innerText = appliedVoucherObj.code;
                document.getElementById('qrisModalVoucherDiscount').innerText = '- ' + formatRupiah(disc);
            } else {
                document.getElementById('qrisVoucherRow').classList.add('hidden');
            }

            const total = Math.max(100, eff - disc) + 100;
            document.getElementById('qrisModalTotal').innerText = formatRupiah(total);
        }

        function applyCheckoutVoucher() {
            const codeInput = document.getElementById('checkoutVoucherInput').value.trim().toUpperCase();
            if (!codeInput) return;
            const vFound = vouchersDB.find(x => x.code === codeInput);
            if (!vFound) {
                showToast('Kode voucher tidak valid.');
                return;
            }
            appliedVoucherObj = vFound;
            showToast(`Voucher ${vFound.code} berhasil dipasang!`);
            updateQrisModalPricing();
        }

        function closeQrisCheckoutModal() {
            document.getElementById('qrisCheckoutModal').classList.add('hidden');
        }

        function confirmQrisWhatsApp() {
            if (!currentUser) return;
            let totalAmount = 0;
            let itemName = '';

            if (activeCheckoutMode === 'role') {
                const rObj = ROLE_PACKAGES[activeUpgradeRoleKey];
                totalAmount = rObj.price + 100;
                itemName = 'Upgrade Level: ' + rObj.name;
            } else {
                const base = activeProduct.variants[activeVariantIdx].price;
                const eff = getEffectivePrice(base);
                const disc = appliedVoucherObj ? appliedVoucherObj.discount : 0;
                totalAmount = Math.max(100, eff - disc) + 100;
                itemName = `${activeProduct.name} (${activeProduct.variants[activeVariantIdx].name})`;
            }

            const timeStr = getFullDateTimeString();
            const isOwnerBuyer = isOwnerAdminLoggedIn || currentUser.username.toLowerCase() === 'luxyy';

            // JIKA OWNER YANG BELI: LANGSUNG SUKSES TANPA PERLU KONFIRMASI WA / ANTREAN
            if (isOwnerBuyer) {
                let credsDelivered = 'vip_owner@luxyyofc.id | OwnerPass99 | Full Akses';
                if (activeCheckoutMode === 'product' && activeProduct && activeProduct.stocks && activeProduct.stocks.length > 0) {
                    credsDelivered = activeProduct.stocks[0];
                } else if (activeCheckoutMode === 'role') {
                    upgradeUserRole(currentUser.username, activeUpgradeRoleKey);
                    credsDelivered = 'Level Akun berhasil diaktifkan instan!';
                }

                const instantOrder = {
                    id: pendingInvoice,
                    username: currentUser.username,
                    itemName,
                    total: totalAmount,
                    status: 'success',
                    credentials: credsDelivered,
                    date: timeStr,
                    approvedAt: timeStr
                };
                ordersDB.unshift(instantOrder);

                const successMsg = `✅ <strong>Pembayaran Berhasil!</strong> Pesanan <strong>${itemName}</strong> untuk <strong>@${currentUser.username}</strong> telah selesai diproses.`;
                fakeNotifLogs.unshift({
                    time: timeStr,
                    text: `✅ ORDER INSTAN OWNER BERHASIL: ${pendingInvoice} - ${itemName}`,
                    details: `Pembeli: @${currentUser.username} | Akun: ${credsDelivered} | Waktu: ${timeStr}`
                });
                publicBroadcastPool.unshift(successMsg);

                saveAppState();
                playWebSound('success');
                closeQrisCheckoutModal();
                showGlobalFloatingPopup('PEMBAYARAN BERHASIL', successMsg, 'Baru Saja', '<i class="fa-solid fa-circle-check text-emerald-400"></i>');
                showToast('Pembelian Owner berhasil secara instan tanpa perlu konfirmasi!');
                renderHeaderAuth();
                if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
                switchMainView('member');
                return;
            }

            const newOrder = {
                id: pendingInvoice,
                username: currentUser.username,
                itemName,
                total: totalAmount,
                status: 'pending',
                date: timeStr
            };
            ordersDB.unshift(newOrder);

            // Notifikasi sudah TF tapi harus tunggu dikonfirmasi dulu di Owner Panel
            const pendingWaitText = `⏳ @${currentUser.username} sudah mengajukan transfer untuk ${itemName} (${formatRupiah(totalAmount)}). Menunggu dikonfirmasi di Owner Panel!`;
            fakeNotifLogs.unshift({
                time: timeStr,
                text: pendingWaitText,
                details: `Invoice: ${pendingInvoice} | Pembeli: @${currentUser.username} | Total: ${formatRupiah(totalAmount)} | Waktu Order: ${timeStr}`
            });

            showGlobalFloatingPopup(
                'MENUNGGU VERIFIKASI OWNER',
                `⏳ <strong>@${currentUser.username}</strong> sudah transfer untuk <strong>${itemName}</strong>. Menunggu dikonfirmasi di Owner Panel!`,
                'Baru Saja',
                '<i class="fa-solid fa-clock text-amber-400"></i>'
            );

            saveAppState();
            playWebSound('pop');
            const waText = encodeURIComponent(`Halo Admin Luxyy, saya sudah transfer untuk pesanan:\n\nInvoice: ${pendingInvoice}\nUsername: @${currentUser.username}\nProduk: ${itemName}\nTotal Transfer: ${formatRupiah(totalAmount)} (Termasuk Fee Rp 100)\nWaktu Order: ${timeStr}\n\nMohon segera dikonfirmasi di Owner Panel.`);
            window.open(`https://wa.me/6288229239987?text=${waText}`, '_blank');

            closeQrisCheckoutModal();
            showToast('Sudah TF! Menunggu dikonfirmasi terlebih dahulu di Owner Panel.');
            renderHeaderAuth();
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function renderMemberDashboard() {
            const container = document.getElementById('memberDashboardContent');
            if (!container || !currentUser) return;
            const myOrders = getMyOrders();

            if (myOrders.length === 0) {
                container.innerHTML = `
                    <div class="glass-card rounded-2xl p-8 text-center space-y-3">
                        <i class="fa-solid fa-box-open text-3xl text-slate-600"></i>
                        <p class="text-xs text-slate-400">Belum ada riwayat transaksi atau akun yang dipesan.</p>
                        <button onclick="switchMainView('store')" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">Mulai Belanja Sekarang</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = myOrders.map(o => `
                <div class="glass-card rounded-2xl p-5 border ${o.status === 'success' ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/30'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-white text-xs">${o.id}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
                                ${o.status === 'success' ? 'PEMBAYARAN BERHASIL • SUKSES' : 'SUDAH TF • TUNGGU KONFIRMASI OWNER PANEL'}
                            </span>
                        </div>
                        <h4 class="font-bold text-sm text-slate-200">${o.itemName}</h4>
                        <p class="text-[11px] text-slate-400 font-mono">Total: ${formatRupiah(o.total)} • Waktu Order: ${o.date}</p>
                    </div>
                    <div class="w-full sm:w-auto">
                        ${o.status === 'success' ? `
                            <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-xs text-emerald-300 space-y-2">
                                <div class="font-bold text-white flex items-center justify-between gap-3">
                                    <span><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i>Detail Akun Premium:</span>
                                    <button onclick="copyTextToClipboard('${(o.credentials || '').replace(/'/g, "\\'")}', 'Data akun ${o.itemName}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[10px] transition">
                                        <i class="fa-regular fa-copy mr-1"></i>Salin Akun
                                    </button>
                                </div>
                                <div class="bg-slate-950/80 px-2.5 py-1.5 rounded border border-emerald-500/20 select-all">${o.credentials || 'Akun / Level berhasil diaktifkan.'}</div>
                            </div>
                        ` : `
                            <span class="text-xs text-amber-300 font-semibold"><i class="fa-solid fa-clock mr-1"></i>Menunggu dikonfirmasi di Owner Panel...</span>
                        `}
                    </div>
                </div>
            `).join('');
        }

        function upgradeUserRole(username, newRoleKey) {
            const u = usersDB.find(x => x.username.toLowerCase() === username.toLowerCase());
            if (u) u.role = newRoleKey;
            if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
                currentUser.role = newRoleKey;
                renderHeaderAuth();
            }
            saveAppState();
        }

        function logoutAdminSession() {
            isOwnerAdminLoggedIn = false;
            saveAppState();
            showToast('Keluar dari Owner Panel.');
            renderHeaderAuth();
            switchMainView('store');
        }

        function renderOwnerAdminPanel() {
            const pendingList = ordersDB.filter(o => o.status === 'pending');
            const successList = ordersDB.filter(o => o.status === 'success');
            const totalRevenue = successList.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
            const totalStocks = products.reduce((acc, p) => acc + (p.stocks ? p.stocks.length : 0), 0);

            const statRevEl = document.getElementById('ownerStatRevenue');
            const statPendEl = document.getElementById('ownerStatPending');
            const statUsersEl = document.getElementById('ownerStatUsers');
            const statStockEl = document.getElementById('ownerStatStockVoucher');

            if (statRevEl) statRevEl.innerText = formatRupiah(totalRevenue);
            if (statPendEl) statPendEl.innerText = pendingList.length + ' Order';
            if (statUsersEl) statUsersEl.innerText = usersDB.length + ' Akun';
            if (statStockEl) statStockEl.innerText = `${totalStocks} Stok / ${vouchersDB.length} Voucher`;

            const pendingBadge = document.getElementById('ownerPendingCountBadge');
            if (pendingBadge) pendingBadge.innerText = pendingList.length + ' Pending';

            const pContainer = document.getElementById('ownerPendingOrdersList');
            if (pContainer) {
                if (pendingList.length === 0) {
                    pContainer.innerHTML = `<p class="text-xs text-slate-500 italic">Tidak ada antrean pesanan pending. Klik "Test Beli Produk (Owner)" di atas untuk mencoba simulasi order.</p>`;
                } else {
                    pContainer.innerHTML = pendingList.map(o => `
                        <div class="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono font-bold text-white">${o.id}</span>
                                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">SUDAH TF • BELUM DIKONFIRMASI</span>
                                </div>
                                <p class="font-bold text-slate-200">${o.itemName} — Pembeli: <span class="text-indigo-300">@${o.username}</span></p>
                                <p class="font-mono text-amber-400 text-[11px]"><i class="fa-regular fa-clock mr-1"></i>Waktu Beli: ${o.date} • Total TF: ${formatRupiah(o.total)}</p>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button onclick="adminApproveOrder('${o.id}')" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg">
                                    <i class="fa-solid fa-check mr-1"></i> Konfirmasi & Kirim
                                </button>
                                <button onclick="adminRejectOrder('${o.id}')" class="px-2.5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition" title="Tolak / Hapus">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Render riwayat semua pembelian + jam beli & jam konfirmasi
            const totalBadge = document.getElementById('ownerTotalOrdersBadge');
            if (totalBadge) totalBadge.innerText = ordersDB.length + ' Transaksi';
            const allOrdContainer = document.getElementById('ownerAllOrdersHistoryList');
            if (allOrdContainer) {
                if (ordersDB.length === 0) {
                    allOrdContainer.innerHTML = `<p class="text-xs text-slate-500 italic">Belum ada riwayat pembelian produk.</p>`;
                } else {
                    allOrdContainer.innerHTML = ordersDB.map(o => `
                        <div class="p-3 rounded-xl bg-slate-900 border ${o.status === 'success' ? 'border-emerald-500/30' : 'border-amber-500/30'} flex justify-between items-center gap-2">
                            <div class="space-y-0.5">
                                <div class="font-bold text-white">${o.itemName} <span class="text-indigo-300 font-mono">(@${o.username})</span></div>
                                <div class="text-[11px] text-slate-400 font-mono">Invoice: ${o.id} • Nominal: ${formatRupiah(o.total)}</div>
                                <div class="text-[10px] text-cyan-300 font-mono"><i class="fa-regular fa-clock mr-1"></i>Waktu Order: ${o.date} ${o.approvedAt ? `| Dikonfirmasi: ${o.approvedAt}` : '| Menunggu Konfirmasi'}</div>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
                                ${o.status === 'success' ? 'LUNAS' : 'PENDING'}
                            </span>
                        </div>
                    `).join('');
                }
            }

            const fakeContainer = document.getElementById('ownerFakeNotifLogsList');
            if (fakeContainer) {
                fakeContainer.innerHTML = fakeNotifLogs.map(n => `
                    <div class="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-slate-200 space-y-1">
                        <div class="flex items-center justify-between text-xs font-semibold">
                            <span><i class="fa-solid fa-circle-dot text-emerald-400 mr-1.5"></i>${n.text}</span>
                        </div>
                        <div class="text-[10px] text-amber-400 font-mono"><i class="fa-regular fa-clock mr-1"></i>${n.time}</div>
                        ${n.details ? `<div class="text-[11px] font-mono text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-cyan-500/20">${n.details}</div>` : ''}
                    </div>
                `).join('');
            }

            const bcListEl = document.getElementById('ownerCustomBroadcastList');
            if (bcListEl) {
                if (customOwnerBroadcasts.length === 0) {
                    bcListEl.innerHTML = `<p class="text-[11px] text-slate-500 italic">Belum ada broadcast kustom aktif.</p>`;
                } else {
                    bcListEl.innerHTML = customOwnerBroadcasts.map(b => `
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-2">
                            <div class="space-y-0.5">
                                <div class="font-bold text-amber-300 text-[11px]">[${b.category}] <span class="text-white font-normal">${b.message}</span></div>
                                ${b.link ? `<div class="text-[10px] text-cyan-300 font-mono">Tombol: ${b.btnLabel} → ${b.link}</div>` : ''}
                            </div>
                            <button onclick="ownerDeleteCustomBroadcast('${b.id}')" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-bold transition shrink-0">
                                Hapus
                            </button>
                        </div>
                    `).join('');
                }
            }

            const totalUsersBadge = document.getElementById('ownerTotalUsersBadge');
            if (totalUsersBadge) totalUsersBadge.innerText = usersDB.length + ' User';

            const uContainer = document.getElementById('ownerUsersList');
            if (uContainer) {
                if (usersDB.length === 0) {
                    uContainer.innerHTML = `<p class="text-xs text-slate-500 italic">Belum ada member terdaftar.</p>`;
                } else {
                    uContainer.innerHTML = usersDB.map(u => `
                        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
                            <div class="space-y-0.5">
                                <div>
                                    <span class="font-bold text-white">@${u.username}</span> (${u.name}) •
                                    <a href="https://wa.me/${u.wa.replace(/^0/, '62')}?text=Halo%20kak%20@${u.username}%2C%20ini%20info%20akun%20Luxyyofc%20Shop%20Anda.%20Password%3A%20${u.password}" target="_blank" class="text-emerald-400 hover:underline font-mono">
                                        <i class="fa-brands fa-whatsapp mr-1"></i>${u.wa}
                                    </a>
                                </div>
                                <div class="text-[11px] text-amber-400 font-mono">Password: <strong>${u.password}</strong> | Level: <span class="text-indigo-300 uppercase">${u.role}</span></div>
                                <div class="text-[10px] text-cyan-300 font-mono"><i class="fa-regular fa-clock mr-1"></i>Waktu Daftar: ${u.createdAt}</div>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                                <select onchange="ownerChangeUserRole('${u.username}', this.value)" class="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[10px] text-white font-semibold">
                                    <option value="member" ${u.role === 'member' ? 'selected' : ''}>Member Free</option>
                                    <option value="reseller" ${u.role === 'reseller' ? 'selected' : ''}>Reseller (-20%)</option>
                                    <option value="admin_member" ${u.role === 'admin_member' ? 'selected' : ''}>Partner Admin</option>
                                    <option value="maker_admin" ${u.role === 'maker_admin' ? 'selected' : ''}>Maker + Admin</option>
                                </select>
                                <button onclick="document.getElementById('directSendUsername').value='${u.username}'; showToast('Username @${u.username} dipilih ke form kirim produk!')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition">
                                    Pilih Kirim
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }

            const logContainer = document.getElementById('ownerActivityLogsList');
            if (logContainer) {
                logContainer.innerHTML = partnerActivityLogs.map(l => `
                    <div class="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div class="text-[10px] text-amber-400">[${l.time}]</div>
                        <div class="text-slate-200"><strong>${l.actor} (${l.role})</strong>: ${l.action}</div>
                    </div>
                `).join('');
            }
        }

        function ownerChangeUserRole(username, newRole) {
            upgradeUserRole(username, newRole);
            const timeStr = getFullDateTimeString();
            partnerActivityLogs.unshift({
                time: timeStr,
                actor: 'OWNER',
                role: 'ADMIN',
                action: `Mengubah level akun @${username} menjadi ${newRole}`
            });
            saveAppState();
            showToast(`Level akun @${username} berhasil diubah menjadi ${newRole}!`);
            renderOwnerAdminPanel();
        }

        function adminRejectOrder(orderId) {
            ordersDB = ordersDB.filter(o => o.id !== orderId);
            saveAppState();
            showToast(`Pesanan ${orderId} telah dihapus/ditolak.`);
            renderOwnerAdminPanel();
        }

        function ownerApproveAllPending() {
            const pendingList = ordersDB.filter(o => o.status === 'pending');
            if (pendingList.length === 0) {
                showToast('Tidak ada antrean pending saat ini.');
                return;
            }
            pendingList.forEach(o => adminApproveOrder(o.id));
            showToast(`Semua (${pendingList.length}) pesanan pending berhasil dikonfirmasi!`);
        }

        function adminApproveOrder(orderId) {
            const ord = ordersDB.find(o => o.id === orderId);
            if (!ord) return;
            const timeStr = getFullDateTimeString();
            ord.status = 'success';
            ord.approvedAt = timeStr;

            if (ord.id.includes('ROLE')) {
                if (ord.itemName.includes('Reseller')) upgradeUserRole(ord.username, 'reseller');
                else if (ord.itemName.includes('Admin')) upgradeUserRole(ord.username, 'admin_member');
                else if (ord.itemName.includes('Maker')) upgradeUserRole(ord.username, 'maker_admin');
                ord.credentials = 'Level Akun Partner berhasil diaktifkan!';
            } else {
                ord.credentials = 'email_premium@luxyyofc.id | pass_vip123 | Garansi Aktif';
            }

            // Setelah dikonfirmasi di Owner Panel, baru munculkan notifikasi Pembayaran Berhasil ke seluruh user!
            const successMsg = `✅ <strong>Pembayaran Berhasil!</strong> Pesanan <strong>${ord.itemName}</strong> untuk <strong>@${ord.username}</strong> telah dikonfirmasi Owner.`;
            partnerActivityLogs.unshift({ time: timeStr, actor: 'OWNER', role: 'ADMIN', action: `Mengonfirmasi pembayaran ${ord.id} (@${ord.username})` });
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `✅ PEMBAYARAN BERHASIL: Pesanan ${ord.id} (@${ord.username}) - ${ord.itemName}`,
                details: `Dikonfirmasi Owner: ${timeStr} | Akun terkirim ke @${ord.username}`
            });
            publicBroadcastPool.unshift(successMsg);

            saveAppState();
            playWebSound('success');
            showGlobalFloatingPopup('PEMBAYARAN BERHASIL', successMsg, 'Baru Saja', '<i class="fa-solid fa-circle-check text-emerald-400"></i>');
            showToast(`Pesanan ${ord.id} telah dikonfirmasi! Notifikasi Pembayaran Berhasil disiarkan.`);
            renderOwnerAdminPanel();
        }

        function ownerSendAccountByUsername() {
            const username = document.getElementById('directSendUsername').value.trim().toLowerCase();
            const productName = document.getElementById('directSendProductName').value.trim();
            const duration = document.getElementById('directSendDuration').value.trim();
            const creds = document.getElementById('directSendCredentials').value.trim();

            if (!username || !productName || !creds) {
                showToast('Username, nama produk, dan detail akun wajib diisi.');
                return;
            }

            const timeStr = getFullDateTimeString();
            const invId = 'INV-DIRECT-' + Math.floor(1000 + Math.random() * 9000);
            ordersDB.unshift({
                id: invId,
                username,
                itemName: `${productName} (${duration || 'Full Garansi'})`,
                total: 0,
                status: 'success',
                credentials: creds,
                date: timeStr,
                approvedAt: timeStr
            });

            const successMsg = `✅ <strong>Pembayaran Berhasil!</strong> Produk <strong>${productName}</strong> (${duration || 'Full Garansi'}) telah dikirimkan ke <strong>@${username}</strong>.`;
            partnerActivityLogs.unshift({ time: timeStr, actor: 'OWNER', role: 'ADMIN', action: `Kirim produk ${productName} ke @${username}` });
            fakeNotifLogs.unshift({
                time: timeStr,
                text: `✅ PEMBAYARAN BERHASIL & PRODUK TERKIRIM: ${productName} ke @${username}`,
                details: `Invoice: ${invId} | User: @${username} | Akun: ${creds} | Waktu Kirim: ${timeStr}`
            });
            publicBroadcastPool.unshift(successMsg);

            saveAppState();
            playWebSound('success');
            showGlobalFloatingPopup('PEMBAYARAN BERHASIL', successMsg, 'Baru Saja', '<i class="fa-solid fa-paper-plane text-emerald-400"></i>');
            showToast(`Produk berhasil dikirim ke @${username} & Notifikasi Pembayaran Berhasil muncul!`);
            renderOwnerAdminPanel();
        }

        function saveNetflixCrackApiConfig() {
            netflixCrackApiConfig.endpoint = document.getElementById('ownerNetflixApiUrl').value.trim();
            netflixCrackApiConfig.apiKey = document.getElementById('ownerNetflixApiKey').value.trim();
            const timeStr = getFullDateTimeString();
            partnerActivityLogs.unshift({ time: timeStr, actor: 'OWNER', role: 'ADMIN', action: `Memperbarui konfigurasi API Key Netflix Crack` });
            saveAppState();
            showToast('Konfigurasi API Key Netflix Crack berhasil disimpan permanen!');
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function handleCustomQrisUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                const imgData = event.target.result;
                customQrisBase64 = imgData;
                document.getElementById('customFullPosterWrapper').classList.remove('hidden');
                document.getElementById('customFullPosterImg').src = imgData;
                document.getElementById('defaultYusufPosterLayout').classList.add('hidden');
                saveAppState();
                playWebSound('success');
                showToast('File foto QRIS (.jpg/.png) berhasil dipasang & disimpan permanen!');
            };
            reader.readAsDataURL(file);
        }

        function applyQrisJpgUrl() {
            const urlInput = document.getElementById('ownerQrisJpgUrlInput');
            const jpgPath = urlInput ? urlInput.value.trim() : 'qris-yusuf-store.jpg';
            if (!jpgPath) {
                showToast('Masukkan nama file .jpg atau URL gambar QRIS!');
                return;
            }
            customQrisBase64 = jpgPath;
            document.getElementById('customFullPosterWrapper').classList.remove('hidden');
            document.getElementById('customFullPosterImg').src = jpgPath;
            document.getElementById('defaultYusufPosterLayout').classList.add('hidden');
            saveAppState();
            playWebSound('success');
            showToast(`Path foto QRIS diatur ke "${jpgPath}". Pastikan file berada di folder yang sama saat di-hosting.`);
        }

        function resetDefaultQrisPoster(silent = false) {
            customQrisBase64 = '';
            const wrap = document.getElementById('customFullPosterWrapper');
            const def = document.getElementById('defaultYusufPosterLayout');
            if (wrap) wrap.classList.add('hidden');
            if (def) def.classList.remove('hidden');
            saveAppState();
            if (!silent) showToast('Tampilan QRIS dikembalikan ke Poster Resmi YUSUF STORE.');
        }

        function downloadSeparatedWebsiteFile(fileType) {
            let content = '';
            let filename = '';
            let mime = 'text/plain;charset=utf-8';

            const styleEl = document.querySelector('style');
            const scriptEl = document.querySelectorAll('script');
            const mainAppScript = scriptEl[scriptEl.length - 1];

            if (fileType === 'css') {
                filename = 'style.css';
                mime = 'text/css;charset=utf-8';
                content = `/* ==========================================================\n   LUXYYOFC SHOP - OFFICIAL STYLESHEET (style.css)\n   ========================================================== */\n` + (styleEl ? styleEl.innerHTML.trim() : '');
            } else if (fileType === 'js') {
                filename = 'script.js';
                mime = 'application/javascript;charset=utf-8';
                content = `/* ==========================================================\n   LUXYYOFC SHOP - APPLICATION LOGIC & DATABASE (script.js)\n   ========================================================== */\n` + (mainAppScript ? mainAppScript.innerHTML.trim() : '');
            } else if (fileType === 'html') {
                filename = 'index.html';
                mime = 'text/html;charset=utf-8';
                const cloneDoc = document.documentElement.cloneNode(true);
                const cloneStyle = cloneDoc.querySelector('style');
                if (cloneStyle) {
                    const linkTag = document.createElement('link');
                    linkTag.rel = 'stylesheet';
                    linkTag.href = 'style.css';
                    cloneStyle.parentNode.replaceChild(linkTag, cloneStyle);
                }
                const cloneScripts = cloneDoc.querySelectorAll('script');
                const lastScript = cloneScripts[cloneScripts.length - 1];
                if (lastScript) {
                    const extScript = document.createElement('script');
                    extScript.src = 'script.js';
                    lastScript.parentNode.replaceChild(extScript, lastScript);
                }
                content = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;
            }

            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            playWebSound('success');
            showToast(`File ${filename} berhasil diunduh!`);
        }

        // Generator Poster QRIS Default menjadi File .JPG (Canvas) jika user belum upload foto sendiri
        function generateDefaultQrisJpgBase64() {
            return new Promise((resolve) => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 600;
                    canvas.height = 750;
                    const ctx = canvas.getContext('2d');

                    // Background biru gelap ala Yusuf Store
                    const grad = ctx.createLinearGradient(0, 0, 600, 750);
                    grad.addColorStop(0, '#0f296b');
                    grad.addColorStop(0.5, '#091538');
                    grad.addColorStop(1, '#04091a');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 600, 750);

                    // Bingkai luar neon
                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 8;
                    ctx.strokeRect(16, 16, 568, 718);

                    // Judul Header
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 38px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('YUSUF STORE', 300, 85);

                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 20px Inter, sans-serif';
                    ctx.fillText('SCAN QRIS ALL PAYMENT', 300, 120);

                    // Kotak Putih Tempat QR
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(140, 150, 320, 320);

                    // Gambar QRIS
                    const qrImg = new Image();
                    qrImg.crossOrigin = 'Anonymous';
                    qrImg.onload = function() {
                        ctx.drawImage(qrImg, 160, 170, 280, 280);
                        ctx.fillStyle = '#f8fafc';
                        ctx.font = 'bold 18px Inter, sans-serif';
                        ctx.fillText('Pastikan Nama QRIS: YUSUF STORE', 300, 525);
                        ctx.fillStyle = '#fbbf24';
                        ctx.font = 'bold 16px Inter, sans-serif';
                        ctx.fillText('Wajib Tambah Biaya Admin +Rp 100', 300, 560);
                        ctx.fillStyle = '#94a3b8';
                        ctx.font = '15px Inter, sans-serif';
                        ctx.fillText('Kirim Bukti Transfer ke WhatsApp: 088229239987', 300, 600);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                        resolve(dataUrl.split(',')[1]);
                    };
                    qrImg.onerror = function() {
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                        resolve(dataUrl.split(',')[1]);
                    };
                    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=00020101021126610014COM.GO-JEK.WWW01189360091431234567890210G1234567890303UMI51440014ID.CO.QRIS.WWW0215ID10243216543210303UMI5204581553033605802ID5911YUSUF_STORE6006BEKASI6105175106304A1B2';
                } catch (e) {
                    resolve('');
                }
            });
        }

        async function downloadFullWebsiteZip() {
            if (typeof JSZip === 'undefined') {
                showToast('Library ZIP sedang dimuat, silakan coba 2 detik lagi.');
                return;
            }

            showToast('Sedang membungkus paket website ke dalam file .ZIP...');
            const zip = new JSZip();

            // 1. Ambil style.css
            const styleEl = document.querySelector('style');
            const cssContent = `/* ==========================================================\n   LUXYYOFC SHOP - OFFICIAL STYLESHEET (style.css)\n   ========================================================== */\n` + (styleEl ? styleEl.innerHTML.trim() : '');
            zip.file('style.css', cssContent);

            // 2. Ambil script.js
            const scriptEls = document.querySelectorAll('script');
            const mainAppScript = scriptEls[scriptEls.length - 1];
            const jsContent = `/* ==========================================================\n   LUXYYOFC SHOP - APPLICATION LOGIC & DATABASE (script.js)\n   ========================================================== */\n` + (mainAppScript ? mainAppScript.innerHTML.trim() : '');
            zip.file('script.js', jsContent);

            // 3. Buat index.html bersih yang memanggil style.css & script.js
            const cloneDoc = document.documentElement.cloneNode(true);
            const cloneStyle = cloneDoc.querySelector('style');
            if (cloneStyle) {
                const linkTag = document.createElement('link');
                linkTag.rel = 'stylesheet';
                linkTag.href = 'style.css';
                cloneStyle.parentNode.replaceChild(linkTag, cloneStyle);
            }
            const cloneScripts = cloneDoc.querySelectorAll('script');
            const lastScript = cloneScripts[cloneScripts.length - 1];
            if (lastScript) {
                const extScript = document.createElement('script');
                extScript.src = 'script.js';
                lastScript.parentNode.replaceChild(extScript, lastScript);
            }
            const htmlContent = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;
            zip.file('index.html', htmlContent);

            // 4. Sertakan file qris-yusuf-store.jpg (dari foto yang di-upload user atau generate otomatis)
            if (customQrisBase64 && customQrisBase64.startsWith('data:image')) {
                const base64Data = customQrisBase64.split(',')[1];
                zip.file('qris-yusuf-store.jpg', base64Data, { base64: true });
            } else {
                const fallbackJpgBase64 = await generateDefaultQrisJpgBase64();
                if (fallbackJpgBase64) {
                    zip.file('qris-yusuf-store.jpg', fallbackJpgBase64, { base64: true });
                }
            }

            // 5. Tambahkan file panduan README.txt
            const readmeText = `============================================================
PAKET SOURCE CODE WEBSITE LUXYYOFC SHOP (SIAP HOSTING)
============================================================

Isi di dalam file ZIP ini:
1. index.html          -> Halaman utama website
2. style.css           -> Desain tampilan & animasi CSS
3. script.js           -> Sistem database, keranjang QRIS, audio & Owner Panel
4. qris-yusuf-store.jpg -> Gambar QRIS Resmi YUSUF STORE (bisa Anda timpa/ganti dengan foto QRIS Anda sendiri menggunakan nama file yang sama)

Login Owner Panel:
- Buka menu "Masuk" di pojok kanan atas
- Username : luxyy
- Password : luxyy123
`;
            zip.file('README-CARA-PAKAI.txt', readmeText);

            // Generate dan unduh file .zip
            const contentBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(contentBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'luxyyofc-shop-website.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            playWebSound('success');
            showToast('Paket luxyyofc-shop-website.zip berhasil diunduh!');
        }

        function openPartnerAdminModal(isOwnerOverride = false) {
            if (!isOwnerOverride && (!currentUser || (currentUser.role !== 'admin_member' && currentUser.role !== 'maker_admin'))) {
                showToast('Anda harus bergabung sebagai Partner Admin atau Maker untuk membuka panel ini.');
                openUpgradeRoleModal();
                return;
            }
            document.getElementById('partnerAdminModal').classList.remove('hidden');
            const select = document.getElementById('partnerStockProdSelect');
            select.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            renderPartnerProductsManageList();
            renderPartnerVouchers();
        }

        function renderPartnerProductsManageList() {
            const listEl = document.getElementById('partnerProductsManageList');
            if (!listEl) return;
            listEl.innerHTML = products.map(p => `
                <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                        <div class="font-bold text-white">${p.name}</div>
                        <div class="text-[10px] text-cyan-300 font-mono">Varian: ${p.variants.map(v => `${v.name} (${formatRupiah(v.price)})`).join(', ')}</div>
                        <div class="text-[10px] text-emerald-400 font-mono">Stok Tersedia: ${p.stocks ? p.stocks.length : 0} akun</div>
                    </div>
                    <button onclick="partnerDeleteProduct('${p.id}')" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-bold transition shrink-0">
                        Hapus
                    </button>
                </div>
            `).join('');
        }

        function partnerDeleteProduct(prodId) {
            if (products.length <= 1) {
                showToast('Minimal harus ada 1 produk di katalog.');
                return;
            }
            const target = products.find(p => p.id === prodId);
            products = products.filter(p => p.id !== prodId);
            const timeStr = getFullDateTimeString();
            partnerActivityLogs.unshift({
                time: timeStr,
                actor: currentUser ? currentUser.username : 'OWNER',
                role: currentUser ? currentUser.role.toUpperCase() : 'OWNER',
                action: `Menghapus produk: ${target ? target.name : prodId}`
            });
            saveAppState();
            showToast('Produk dihapus dari katalog.');
            renderPartnerProductsManageList();
            renderProducts();
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function makerGenerateSampleAccount(typeLabel) {
            const randNum = Math.floor(1000 + Math.random() * 8999);
            const generated = `maker_${randNum}@luxyyofc.id | MakerPass${randNum} | ${typeLabel}`;
            const credInput = document.getElementById('partnerStockCredentials');
            if (credInput) credInput.value = generated;
            playWebSound('pop');
            showToast(`Berhasil generate akun ${typeLabel}! Klik "Simpan Stok & Durasi" untuk menyimpan.`);
        }

        function closePartnerAdminModal() {
            document.getElementById('partnerAdminModal').classList.add('hidden');
        }

        function partnerCreateNewProduct() {
            const name = document.getElementById('partnerNewProdName').value.trim();
            const category = document.getElementById('partnerNewProdCat').value;
            const price = parseInt(document.getElementById('partnerNewProdPrice').value) || 10000;
            const duration = document.getElementById('partnerNewProdDuration').value.trim() || '1 Bulan';

            if (!name) {
                showToast('Nama produk wajib diisi.');
                return;
            }

            const newProd = {
                id: 'prod-' + Date.now(),
                name,
                category,
                badge: category === 'crack' ? 'NETFLIX CRACK • HARIAN' : 'PRODUK BARU',
                icon: category === 'crack' ? 'fa-solid fa-bolt-lightning' : 'fa-solid fa-box',
                color: category === 'crack' ? 'from-rose-600 to-red-500' : 'from-indigo-600 to-blue-500',
                desc: `Tersedia durasi ${duration} bergaransi penuh.`,
                isNetflixCrack: category === 'crack',
                variants: [{ name: duration, price }],
                stocks: []
            };
            products.push(newProd);
            const timeStr = getFullDateTimeString();
            partnerActivityLogs.unshift({
                time: timeStr,
                actor: currentUser ? currentUser.username : 'OWNER',
                role: currentUser ? currentUser.role.toUpperCase() : 'OWNER',
                action: `Menambah produk baru: ${name} (${duration} - ${formatRupiah(price)})`
            });
            saveAppState();
            playWebSound('success');
            showToast('Produk baru berhasil ditambahkan & disimpan permanen!');
            const select = document.getElementById('partnerStockProdSelect');
            if (select) select.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            renderPartnerProductsManageList();
            renderProducts();
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function partnerAddStockItem() {
            const prodId = document.getElementById('partnerStockProdSelect').value;
            const customDur = document.getElementById('partnerStockDurationCustom').value.trim() || '1 Hari';
            const customPrice = parseInt(document.getElementById('partnerStockPriceCustom').value) || 5000;
            const creds = document.getElementById('partnerStockCredentials').value.trim();
            if (!creds) {
                showToast('Data akun wajib diisi.');
                return;
            }
            const p = products.find(x => x.id === prodId);
            if (p) {
                p.stocks.push(`${creds} (${customDur})`);
                // Jika durasi belum ada di daftar variants produk, otomatis tambahkan varian durasi tersebut
                const existingVar = p.variants.find(v => v.name.toLowerCase() === customDur.toLowerCase());
                if (!existingVar) {
                    p.variants.push({ name: customDur, price: customPrice });
                }
                const timeStr = getFullDateTimeString();
                partnerActivityLogs.unshift({
                    time: timeStr,
                    actor: currentUser ? currentUser.username : 'OWNER',
                    role: currentUser ? currentUser.role.toUpperCase() : 'OWNER',
                    action: `Menambah stok ${p.name} dengan durasi "${customDur}" (${formatRupiah(customPrice)})`
                });
                saveAppState();
                playWebSound('success');
                showToast(`Stok & durasi "${customDur}" berhasil disimpan ke database!`);
                document.getElementById('partnerStockCredentials').value = '';
                renderPartnerProductsManageList();
                renderProducts();
                if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
            }
        }

        function partnerCreateVoucher() {
            const code = document.getElementById('voucherNewCode').value.trim().toUpperCase();
            const discount = parseInt(document.getElementById('voucherNewDiscount').value) || 1000;
            const quota = parseInt(document.getElementById('voucherNewQuota').value) || 25;

            if (!code) {
                showToast('Kode voucher wajib diisi.');
                return;
            }
            const timeStr = getFullDateTimeString();
            vouchersDB.unshift({ code, discount, quota, createdBy: currentUser ? currentUser.username : 'OWNER', createdAt: timeStr });
            partnerActivityLogs.unshift({
                time: timeStr,
                actor: currentUser ? currentUser.username : 'OWNER',
                role: currentUser ? currentUser.role.toUpperCase() : 'OWNER',
                action: `Membuat kode voucher diskon: ${code} (Potongan ${formatRupiah(discount)})`
            });
            saveAppState();
            playWebSound('success');
            showToast(`Voucher ${code} berhasil dibuat & disimpan!`);
            renderPartnerVouchers();
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function partnerDeleteVoucher(code) {
            vouchersDB = vouchersDB.filter(v => v.code !== code);
            saveAppState();
            showToast(`Voucher ${code} dihapus.`);
            renderPartnerVouchers();
            if (isOwnerAdminLoggedIn) renderOwnerAdminPanel();
        }

        function renderPartnerVouchers() {
            const list = document.getElementById('partnerVoucherList');
            if (!list) return;
            list.innerHTML = vouchersDB.map(v => `
                <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                        <span class="font-mono font-bold text-amber-400">${v.code}</span> (Potongan ${formatRupiah(v.discount)})
                        <div class="text-[10px] text-slate-400">Kuota: ${v.quota} • Oleh: ${v.createdBy}</div>
                    </div>
                    <button onclick="partnerDeleteVoucher('${v.code}')" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-bold transition">
                        Hapus
                    </button>
                </div>
            `).join('');
        }

        window.onload = function() {
            loadAppState();
            startRealtimeClockUpdater();
            renderHeaderAuth();
            renderProducts();
            startPublicBroadcastTicker();
        };