import React, { useState, Fragment, useEffect } from "react";
import { Link, Head, usePage, router } from "@inertiajs/react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { Toaster, toast } from "react-hot-toast";
import {
    HomeIcon,
    UsersIcon,
    BookOpenIcon,
    AcademicCapIcon,
    ClipboardDocumentListIcon,
    BellIcon,
    ChevronDownIcon,
    RectangleStackIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    UserGroupIcon,
    Bars3Icon,
    XMarkIcon,
    BuildingOffice2Icon,
    MagnifyingGlassIcon,
    ChartPieIcon,
    SparklesIcon,
    ComputerDesktopIcon,
    CheckIcon,
    EnvelopeOpenIcon
} from "@heroicons/react/24/outline";

/* ---------- Small Nav Components ---------- */
function NavLink({ href, active, isCollapsed, children, label }) {
    return (
        <Link
            href={href}
            className={`group relative flex items-center w-full p-2.5 rounded-xl transition-all duration-300 ease-out text-sm font-medium ${
                active 
                    ? "bg-white/15 text-white shadow-inner backdrop-blur-md" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
        >
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-gradient-to-b from-sky-400 to-indigo-400 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            )}
            
            <div className={`transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? "mx-auto" : "mr-3 group-hover:translate-x-1"}`}>
                {children}
            </div>

            {!isCollapsed && <span className="truncate transition-transform duration-300 group-hover:translate-x-1">{label}</span>}

            {isCollapsed && (
                <span
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden whitespace-nowrap rounded-md bg-slate-800/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block z-50"
                    role="tooltip"
                >
                    {label}
                </span>
            )}
        </Link>
    );
}

function CollapsibleNavGroup({ title, icon, isCollapsed, children, active = false }) {
    const [isOpen, setIsOpen] = useState(active);

    useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    return (
        <li className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex w-full items-center p-2.5 rounded-xl transition-all duration-300 ease-out text-sm font-medium ${
                    active || isOpen 
                        ? "bg-white/10 text-white backdrop-blur-sm" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
            >
                {(active && isCollapsed) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-gradient-to-b from-sky-400 to-indigo-400 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                )}
                
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? "mx-auto" : "mr-3 group-hover:translate-x-1"}`}>
                    {icon}
                </div>

                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left transition-transform duration-300 group-hover:translate-x-1">{title}</span>
                        <ChevronDownIcon
                            className={`w-4 h-4 ml-2 transform transition-transform duration-300 ease-in-out ${
                                isOpen ? "rotate-180 text-sky-400" : "rotate-0 text-white/40 group-hover:text-white/70"
                            }`}
                            aria-hidden
                        />
                    </>
                )}

                {isCollapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden whitespace-nowrap rounded-md bg-slate-800/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block z-50">
                        {title}
                    </span>
                )}
            </button>

            <Transition
                show={isOpen && !isCollapsed}
                enter="transition-all ease-out duration-300"
                enterFrom="max-h-0 opacity-0 translate-y-[-10px]"
                enterTo="max-h-screen opacity-100 translate-y-0"
                leave="transition-all ease-in duration-200"
                leaveFrom="max-h-screen opacity-100 translate-y-0"
                leaveTo="max-h-0 opacity-0 translate-y-[-10px]"
            >
                <ul className="mt-1.5 pl-4 pr-1 space-y-1 border-l border-white/10 ml-4">{children}</ul>
            </Transition>
        </li>
    );
}

const MenuSectionLabel = ({ isCollapsed, children }) => {
    if (isCollapsed) return <div className="h-4" />;
    return (
        <div className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {children}
        </div>
    );
};

/* ---------- Main Layout ---------- */
export default function AdminLayout({ user, header, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [toggleImageError, setToggleImageError] = useState(false);

    // Inertia shared props
    const pageProps = usePage().props || {};
    const flash = pageProps.flash || {};
    // ✅ Tambahkan globalStats di sini
    const { pengaturan, adminMode, errors, globalStats } = pageProps;
    const currentUser = user ?? pageProps.auth?.user ?? null;

    // ✅ Ambil data notifikasi (asumsi struktur data dari backend)
    // Jika backend belum kirim array, fallback ke array kosong
    const notifications = globalStats?.notifications || [];
    // Prioritaskan hitungan dari unreadSurat jika ada, jika tidak gunakan panjang array notifikasi
    const unreadCount = globalStats?.unreadSurat ?? notifications.length ?? 0;

    // Flag mode absensi
    const isAbsensiMode = adminMode === "absensi";

    useEffect(() => {
        console.log("AdminLayout useEffect flash triggered. Flash object:", flash, "Errors:", errors);
        if (flash?.success) {
            console.log("Triggering toast.success:", flash.success);
            toast.success(flash.success);
        }
        if (flash?.message) {
            console.log("Triggering toast.message:", flash.message);
            toast.success(flash.message);
        }
        if (flash?.error) {
            console.log("Triggering toast.error:", flash.error);
            toast.error(flash.error);
        }
        if (errors?.error) {
            console.log("Triggering toast.errors:", errors.error);
            toast.error(errors.error);
        }
    }, [flash?._ts, errors?.error]);

    const toggleIconPath = pengaturan?.toggle_icon_url || "/images/sidebar-toggle-blue.png";

    // --- Actions Notifikasi ---
    // Karena kita menggunakan SuratIzin sebagai notifikasi, "Mark as Read" artinya menuju detail surat
    const handleNotificationClick = (id) => {
        // Redirect ke halaman index surat izin dengan filter ID tersebut
        router.get(route('admin.surat-izin.index', { status: 'Diajukan', q: id }));
    };

    const markAllRead = () => {
        // Opsi: Arahkan ke halaman index untuk memproses semua
        router.visit(route("admin.surat-izin.index", { status: 'Diajukan' }));
    };

    const SidebarHeader = ({ isCollapsed }) => (
        <div className={`flex items-center gap-3 p-5 relative ${isCollapsed ? "justify-center" : ""}`}>
            {/* Subtle glow effect behind logo */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 w-10 h-10 bg-sky-400/20 blur-xl rounded-full" />
            
            {pengaturan?.logo_url ? (
                <img
                    src={pengaturan.logo_url}
                    alt="Logo Sekolah"
                    className="h-10 w-10 object-contain rounded-xl shadow-lg ring-1 ring-white/20 relative z-10 transition-transform duration-300 hover:scale-105"
                />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-sky-500/30 ring-1 ring-white/20 shadow-lg relative z-10 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-md">
                        <path
                            d="M12 2L4 6v6c0 5.25 3.5 9 8 10 4.5-1 8-4.75 8-10V6l-8-4z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path d="M8 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}

            {!isCollapsed && (
                <div className="relative z-10 flex flex-col justify-center transition-opacity duration-300">
                    <h1 className="text-[15px] font-extrabold text-white tracking-wide drop-shadow-sm">IT AL - HAWARI</h1>
                    <p className="text-[11px] font-medium text-white/50 tracking-wider">SISTEM SEKOLAH DIGITAL</p>
                </div>
            )}
        </div>
    );

    const sidebarContent = (isMobile = false) => {
        const absensiActive =
            route().current("admin.absensi-guru.*") ||
            route().current("admin.absensi-siswa.*") ||
            route().current("admin.absensi-siswa-mapel.*") ||
            route().current("admin.absensi-siswa.bulanan.*") ||
            route().current("admin.surat-izin.*");

        return (
            <div className="flex flex-col h-full">
                <SidebarHeader isCollapsed={!isSidebarOpen && !isMobile} />

                <div className="my-2 mx-4 h-px bg-white/10" />

                <nav className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-1.5">
                        <MenuSectionLabel isCollapsed={!isSidebarOpen && !isMobile}>Utama</MenuSectionLabel>
                        <li>
                            <NavLink
                                href={route("admin.dashboard")}
                                active={route().current("admin.dashboard")}
                                isCollapsed={!isSidebarOpen && !isMobile}
                                label="Dashboard"
                            >
                                <HomeIcon className="w-5 h-5" />
                            </NavLink>
                        </li>

                        {/* Master Data */}
                        <MenuSectionLabel isCollapsed={!isSidebarOpen && !isMobile}>Manajemen Data</MenuSectionLabel>
                        <CollapsibleNavGroup
                            title="Master Data"
                            icon={<RectangleStackIcon className="w-6 h-6" />}
                            isCollapsed={!isSidebarOpen && !isMobile}
                            active={
                                route().current("admin.guru.*") ||
                                route().current("admin.siswa.*") ||
                                route().current("admin.kelas.*") ||
                                route().current("admin.mata-pelajaran.*") ||
                                route().current("admin.orang-tua-wali.*")
                            }
                        >
                            <li>
                                <NavLink
                                    href={route("admin.guru.index")}
                                    active={route().current("admin.guru.*")}
                                    isCollapsed={false}
                                    label="Data Guru"
                                >
                                    <UsersIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.siswa.index")}
                                    active={route().current("admin.siswa.*")}
                                    isCollapsed={false}
                                    label="Data Siswa"
                                >
                                    <AcademicCapIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.kelas.index")}
                                    active={route().current("admin.kelas.*")}
                                    isCollapsed={false}
                                    label="Data Kelas"
                                >
                                    <BuildingOffice2Icon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.mata-pelajaran.index")}
                                    active={route().current("admin.mata-pelajaran.*")}
                                    isCollapsed={false}
                                    label="Mata Pelajaran"
                                >
                                    <BookOpenIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.orang-tua-wali.index")}
                                    active={route().current("admin.orang-tua-wali.*")}
                                    isCollapsed={false}
                                    label="Orang Tua/Wali"
                                >
                                    <UserGroupIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                        </CollapsibleNavGroup>

                        {/* Absensi */}
                        <MenuSectionLabel isCollapsed={!isSidebarOpen && !isMobile}>Akademik & Kehadiran</MenuSectionLabel>
                        <CollapsibleNavGroup
                            title="Absensi"
                            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                            isCollapsed={!isSidebarOpen && !isMobile}
                            active={absensiActive}
                        >
                            <li>
                                <NavLink
                                    href={route("admin.absensi-guru.index")}
                                    active={route().current("admin.absensi-guru.*")}
                                    isCollapsed={false}
                                    label="Absensi Guru"
                                >
                                    <UsersIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.absensi-siswa.index")}
                                    active={route().current("admin.absensi-siswa.*")}
                                    isCollapsed={false}
                                    label="Absensi Siswa"
                                >
                                    <AcademicCapIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.absensi-siswa.bulanan.index")}
                                    active={route().current("admin.absensi-siswa.bulanan.*")}
                                    isCollapsed={false}
                                    label="Rekap Bulanan Siswa"
                                >
                                    <UsersIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.absensi-siswa-mapel.index")}
                                    active={route().current("admin.absensi-siswa-mapel.*")}
                                    isCollapsed={false}
                                    label="Absensi Siswa per Mapel"
                                >
                                    <BookOpenIcon className="w-5 h-5" />
                                </NavLink>
                            </li>

                            {/* === Surat Izin === */}
                            <li>
                                <NavLink
                                    href={route("admin.surat-izin.index")}
                                    active={route().current("admin.surat-izin.index")}
                                    isCollapsed={false}
                                    label="Surat Izin (Verifikasi)"
                                >
                                    <div className="relative">
                                        <DocumentTextIcon className="w-5 h-5" />
                                        {/* Badge Kecil di Sidebar jika collapsed/expand */}
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-indigo-900" />
                                        )}
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    href={route("admin.surat-izin.create")}
                                    active={route().current("admin.surat-izin.create")}
                                    isCollapsed={false}
                                    label="Buat Surat Izin"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                </NavLink>
                            </li>
                        </CollapsibleNavGroup>

                        {/* Jadwal, Jurnal */}
                        <MenuSectionLabel isCollapsed={!isSidebarOpen && !isMobile}>Jadwal & Jurnal</MenuSectionLabel>
                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.jadwal-mengajar.index")}
                                    active={route().current("admin.jadwal-mengajar.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Jadwal Mengajar"
                                >
                                    <CalendarDaysIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.jadwal-pelajaran.index")}
                                    active={route().current("admin.jadwal-pelajaran.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Jadwal Pelajaran"
                                >
                                    <CalendarDaysIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.jurnal-mengajar.index")}
                                    active={route().current("admin.jurnal-mengajar.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Jurnal Mengajar"
                                >
                                    <DocumentTextIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.monitoring.materi")}
                                    active={route().current("admin.monitoring.materi*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Monitoring Materi"
                                >
                                    <ChartPieIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.monitoring.tugas")}
                                    active={route().current("admin.monitoring.tugas*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Monitoring Tugas"
                                >
                                    <ClipboardDocumentListIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {/* Laporan (Tampil di kedua mode) */}
                        <MenuSectionLabel isCollapsed={!isSidebarOpen && !isMobile}>Sistem & Laporan</MenuSectionLabel>
                        <li>
                            <NavLink
                                href={route("admin.laporan.index")}
                                active={route().current("admin.laporan.*")}
                                isCollapsed={!isSidebarOpen && !isMobile}
                                label="Laporan"
                            >
                                <ChartBarIcon className="w-6 h-6" />
                            </NavLink>
                        </li>

                        {/* Audit Trail (Tampil di mode Full) */}
                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.log-aktivitas.index")}
                                    active={route().current("admin.log-aktivitas.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Log Aktivitas"
                                >
                                    <ClipboardDocumentListIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.kalender.index")}
                                    active={route().current("admin.kalender.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Kalender Akademik"
                                >
                                    <CalendarDaysIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.users.index")}
                                    active={route().current("admin.users.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Manajemen User"
                                >
                                    <UsersIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}

                        {!isAbsensiMode && (
                            <li>
                                <NavLink
                                    href={route("admin.pengaturan.index")}
                                    active={route().current("admin.pengaturan.*")}
                                    isCollapsed={!isSidebarOpen && !isMobile}
                                    label="Pengaturan"
                                >
                                    <Cog6ToothIcon className="w-6 h-6" />
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>

                <div
                    className={`p-4 border-t border-white/10 bg-black/10 backdrop-blur-md transition-all duration-300 ${!isSidebarOpen && !isMobile ? "flex justify-center" : "text-xs text-white/60"
                        }`}
                >
                    {!isSidebarOpen && !isMobile ? (
                        <div className="text-white/40 font-mono text-[10px] tracking-wider font-bold">v1.0</div>
                    ) : (
                        <div className="w-full flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold text-white/70">© {new Date().getFullYear()} AbsensiApp</div>
                                <div className="text-[10px] text-white/40 mt-0.5 tracking-wide">Premium Dashboard</div>
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-400 ring-1 ring-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                                    Beta
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={header} />

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4500,
                    style: {
                        background: '#ffffff',
                        color: '#374151',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                        border: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                        },
                        style: {
                            borderLeft: '4px solid #10b981',
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                        style: {
                            borderLeft: '4px solid #ef4444',
                        }
                    }
                }}
            />

            <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
                {/* Mobile sidebar */}
                <Transition.Root show={isMobileSidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setIsMobileSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/40" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative flex w-full max-w-xs flex-1">
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button
                                            type="button"
                                            className="-m-2.5 p-2.5"
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            aria-label="Tutup menu"
                                        >
                                            {!toggleImageError ? (
                                                <img
                                                    src={toggleIconPath}
                                                    alt="Tutup sidebar"
                                                    onError={() => setToggleImageError(true)}
                                                    className="h-6 w-6 object-contain transform rotate-90 transition-transform duration-200 hover:scale-110"
                                                />
                                            ) : (
                                                <XMarkIcon className="h-6 w-6 text-indigo-900" />
                                            )}
                                        </button>
                                    </div>

                                    <aside className="flex w-full flex-col overflow-y-auto bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 border-r border-white/10 shadow-xl text-white/70">
                                        {sidebarContent(true)}
                                    </aside>
                                </Dialog.Panel>
                            </Transition.Child>

                            <div className="w-14 flex-shrink-0" aria-hidden="true" />
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Desktop sidebar */}
                <aside
                    className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 border-r border-white/10 shadow-2xl text-white/70 transition-all duration-300 ease-in-out ${
                        isSidebarOpen ? "lg:w-64" : "lg:w-20"
                    }`}
                >
                    {sidebarContent(false)}
                </aside>

                {/* Main content */}
                <div
                    className={`flex min-h-screen flex-col transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
                        }`}
                >
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-indigo-100/10 bg-white/60 backdrop-blur-sm px-4 shadow-sm">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-indigo-700 hover:bg-indigo-50 rounded-md"
                            onClick={() => {
                                const isMobile = window.innerWidth < 1024;
                                if (isMobile) setIsMobileSidebarOpen(true);
                                else setIsSidebarOpen(!isSidebarOpen);
                            }}
                            aria-label="Toggle sidebar"
                            aria-pressed={isSidebarOpen}
                        >
                            <span className="sr-only">Toggle sidebar</span>
                            {!toggleImageError ? (
                                <img
                                    src={toggleIconPath}
                                    alt={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                                    onError={() => setToggleImageError(true)}
                                    className={`h-8 w-8 object-contain transition-transform duration-300 ease-out ${isSidebarOpen ? "rotate-180 scale-95" : "rotate-0 scale-100"
                                        } hover:scale-105`}
                                />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>

                        <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                        <div className="flex flex-1 gap-x-4 justify-between items-center">
                            <form className="relative flex flex-1" action="#" method="GET">
                                <label htmlFor="search-field" className="sr-only">
                                    Search
                                </label>
                                <MagnifyingGlassIcon
                                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                                <input
                                    id="search-field"
                                    className="block h-10 w-full border-0 bg-white/60 py-0 pl-8 pr-3 text-gray-900 placeholder:text-gray-400 rounded-md focus:ring-2 focus:ring-indigo-300 sm:text-sm"
                                    placeholder="Cari..."
                                    type="search"
                                    name="search"
                                />
                            </form>

                            {/* Mode badge */}
                            {isAbsensiMode ? (
                                <div className="hidden sm:flex items-center">
                                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-medium">
                                        Mode: Absensi
                                    </span>
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center">
                                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-medium">
                                        Mode: Full
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-x-4 lg:gap-x-6">
                                {/* ✅ Notifikasi Bell: Dropdown Interaktif */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="-m-2.5 p-2.5 text-indigo-600 hover:text-indigo-800 relative group outline-none">
                                        <span className="sr-only">Lihat Pengajuan Baru</span>
                                        <BellIcon className={`h-6 w-6 transition-transform ${unreadCount > 0 ? 'group-hover:animate-swing text-indigo-700' : ''}`} aria-hidden="true" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-20 mt-3 w-80 sm:w-96 origin-top-right rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden">
                                            {/* Header Notifikasi */}
                                            <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/50 border-b border-indigo-100">
                                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                    <BellIcon className="h-4 w-4 text-indigo-600" /> Notifikasi
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllRead}
                                                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                    >
                                                        <EnvelopeOpenIcon className="h-3 w-3" /> Lihat semua
                                                    </button>
                                                )}
                                            </div>

                                            {/* List Notifikasi */}
                                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif) => (
                                                        <div key={notif.id} className="relative group border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                                                            <div
                                                                className="flex p-4 gap-3 cursor-pointer"
                                                                onClick={() => handleNotificationClick(notif.id)}
                                                            >
                                                                {/* Icon Status */}
                                                                <div className="flex-shrink-0 mt-1">
                                                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                                                                        <DocumentTextIcon className="h-4 w-4" />
                                                                    </span>
                                                                </div>

                                                                {/* Konten */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 leading-snug">
                                                                        {notif.data?.message || "Pengajuan Surat Izin Baru"}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                                        {notif.data?.description || "Klik untuk melihat detail pengajuan."}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                                                        <CalendarDaysIcon className="h-3 w-3" />
                                                                        {notif.created_at_human || "Baru saja"}
                                                                    </p>
                                                                </div>

                                                                {/* Tombol Aksi (Tandai Baca/Lihat) */}
                                                                <div className="flex-shrink-0 self-center">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleNotificationClick(notif.id);
                                                                        }}
                                                                        className="p-1.5 rounded-full text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                                        title="Lihat Detail"
                                                                    >
                                                                        <CheckIcon className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // State Kosong (Atau jika jumlah ada tapi list belum dikirim backend)
                                                    unreadCount > 0 ? (
                                                        <div className="py-6 px-4 text-center">
                                                            <div className="mx-auto h-12 w-12 text-indigo-200 flex items-center justify-center rounded-full bg-indigo-50 mb-3 animate-pulse">
                                                                <BellIcon className="h-6 w-6" />
                                                            </div>
                                                            <p className="text-sm text-gray-700 font-medium mb-1">Terdapat <b>{unreadCount}</b> pengajuan baru</p>
                                                            <p className="text-xs text-gray-500 mb-3">Backend belum mengirim detail data, tapi jumlahnya terdeteksi.</p>
                                                            <Link
                                                                href={route("admin.surat-izin.index", { status: 'Diajukan' })}
                                                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors"
                                                            >
                                                                Lihat Semua Pengajuan
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 px-4 text-center">
                                                            <div className="mx-auto h-12 w-12 text-gray-200 flex items-center justify-center rounded-full bg-gray-50 mb-3">
                                                                <BellIcon className="h-6 w-6" />
                                                            </div>
                                                            <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi baru</p>
                                                            <p className="text-xs text-gray-400 mt-1">Semua aman terkendali!</p>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {/* Footer Dropdown */}
                                            {(notifications.length > 0 || unreadCount > 0) && (
                                                <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                                    <Link
                                                        href={route("admin.surat-izin.index")}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 block w-full py-1"
                                                    >
                                                        Lihat Semua Aktivitas &rarr;
                                                    </Link>
                                                </div>
                                            )}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                                {/* User Menu (Existing) */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                                        <span className="sr-only">Open user menu</span>
                                        <div className="h-8 w-8 rounded-full bg-indigo-700 text-white flex items-center justify-center text-sm font-bold">
                                            {currentUser?.nama_lengkap?.charAt(0) ?? "U"}
                                        </div>
                                        <div className="hidden lg:flex lg:items-center">
                                            <span
                                                className="ml-3 text-sm font-semibold leading-6 text-gray-900"
                                                aria-hidden
                                            >
                                                {currentUser?.nama_lengkap ?? "User"}
                                            </span>
                                            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden />
                                        </div>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href={route("admin.profile.edit")}
                                                        className={`${active ? "bg-gray-50" : ""
                                                            } block px-3 py-1 text-sm leading-6 text-gray-900`}
                                                    >
                                                        Profil Anda
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href={route("logout")}
                                                        method="post"
                                                        as="button"
                                                        className={`${active ? "bg-gray-50" : ""
                                                            } block px-3 py-1 text-sm leading-6 text-gray-900`}
                                                    >
                                                        Log Out
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </>
    );
}