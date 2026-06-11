// resources/js/Pages/Guru/Profile/Show.jsx
import React, { useState, useRef, useEffect } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  X,
  Check,
  Trash2,
  ImageIcon,
  KeyRound,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Edit2,
  Phone,
  Copy,
  Shield,
  User,
  Sparkles,
  GraduationCap,
  Camera,
  School,
  Lock,
  BadgeCheck,
  AlertCircle,
  ArrowLeft,
  UploadCloud,
  Save,
  CalendarDays,
  MapPin,
  BookOpen,
  UserRound,
  IdCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CenterPopupNotice from '@/Components/CenterPopupNotice';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

function hasRoute(name) {
  try {
    route(name);
    return true;
  } catch {
    return false;
  }
}

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return hasRoute(name) ? route(name, params) : fallback;
  } catch {
    return fallback;
  }
}

const pickFirstError = (errors) => {
  if (!errors) return null;

  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return null;

  const value = errors[firstKey];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const resizeImageFile = (file, maxWidth = 1024, quality = 0.85) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.width / img.height;
      const targetWidth = img.width > maxWidth ? maxWidth : img.width;
      const targetHeight = Math.round(targetWidth / ratio);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);

          if (!blob) {
            reject(new Error('Gagal memproses gambar'));
            return;
          }

          resolve(new File([blob], file.name, { type: blob.type }));
        },
        mime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar'));
    };

    img.src = url;
  });

function PremiumCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={cn(
        'animate-soft-rise rounded-3xl border border-white/70 bg-white/85',
        'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FieldRow({ label, value, icon: Icon }) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:border-indigo-100 hover:bg-indigo-50/45">
      {Icon && (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </dt>

        <dd className="mt-1 text-sm font-bold leading-snug text-slate-800 break-words">
          {value || <span className="font-semibold text-slate-400">-</span>}
        </dd>
      </div>
    </div>
  );
}

function CollapsibleCard({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
  delay = 0,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PremiumCard className="overflow-hidden" delay={delay}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-600 shadow-sm">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="text-base font-black leading-tight text-slate-900 break-words">
              {title}
            </div>

            {description && (
              <div className="mt-1 text-xs font-medium leading-relaxed text-slate-500 break-words">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 sm:p-5">
          {children}
        </div>
      )}
    </PremiumCard>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  invalid,
  hint,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(
            'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 pr-11 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
            invalid || error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
          )}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          onClick={onToggle}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <div className="mt-1.5 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      {!error && hint && (
        <div className="mt-1.5 text-[11px] font-medium text-slate-400">
          {hint}
        </div>
      )}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  inputRef,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
        )}
      />

      {error && (
        <div className="mt-1.5 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}

function SelectInput({ label, value, onChange, children, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className={cn(
          'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
        )}
      >
        {children}
      </select>

      {error && (
        <div className="mt-1.5 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
      <Icon className="mx-auto h-5 w-5 text-white/90" />

      <p className="mt-2 text-xl font-black leading-none text-white">
        {value || '-'}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

export default function ProfileShow({
  auth,
  guru = {},
  sekolah = null,
  account = null,
}) {
  const { flash } = usePage().props;

  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(guru.foto_url || null);
  const [localFileInfo, setLocalFileInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [showPw3, setShowPw3] = useState(false);

  const [lastAction, setLastAction] = useState(null);
  const [pwBanner, setPwBanner] = useState(null);
  const [pwTouched, setPwTouched] = useState({
    current: false,
    password: false,
    confirm: false,
  });

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const [notice, setNotice] = useState({
    message: null,
    type: 'success',
    title: null,
  });

  const showNotice = (message, type = 'success', title = null) => {
    setNotice({ message: null, type, title });
    setTimeout(() => setNotice({ message, type, title }), 10);
  };

  useEffect(() => {
    if (flash?.success) {
      showNotice(flash.success, 'success', 'Berhasil');
    }

    if (flash?.error) {
      if (lastAction === 'password') {
        setPwBanner(flash.error);
      } else {
        showNotice(flash.error, 'error', 'Gagal');
      }
    }
  }, [flash, lastAction]);

  useEffect(() => {
    if (!guru?.foto_url) return;

    setPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return guru.foto_url;
    });

    setLocalFileInfo(null);
  }, [guru?.foto_url]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (showEdit) {
      setTimeout(() => firstInputRef.current?.focus?.(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showEdit]);

  useEffect(() => {
    if (!showEdit) return;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setShowEdit(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusables = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showEdit]);

  const profileForm = useForm({
    nama_lengkap: guru.nama_lengkap || '',
    nip: guru.nip || '',
    jenis_kelamin: guru.jenis_kelamin || 'Laki-Laki',
    tempat_lahir: guru.tempat_lahir || '',
    tanggal_lahir: guru.tanggal_lahir || '',
    agama: guru.agama || '',
    no_telepon: guru.no_telepon || '',
    alamat: guru.alamat || '',
    file_foto: null,
  });

  const accountForm = useForm({
    username: account?.username ?? auth?.user?.username ?? '',
    email: account?.email ?? auth?.user?.email ?? '',
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const canProfileRoute = hasRoute('guru.profile.update');
  const canAccountRoute = hasRoute('guru.profile.account');
  const canPasswordRoute = hasRoute('guru.profile.password');

  const fallbackGuruAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    guru.nama_lengkap || 'Guru'
  )}&background=4f46e5&color=fff&size=256`;

  const fallbackSchoolAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    sekolah?.nama_sekolah || sekolah?.nama_lengkap || 'Sekolah'
  )}&background=0ea5e9&color=fff&size=128`;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      toast.success('Nomor berhasil disalin.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin.');
    }
  };

  const openWhatsapp = (number) => {
    const normalized = number ? number.replace(/\D/g, '') : '';

    if (!normalized) {
      toast.error('Nomor belum tersedia.');
      return;
    }

    window.open(`https://wa.me/${normalized}`, '_blank', 'noopener');
  };

  const clearSelectedFile = () => {
    profileForm.setData('file_foto', null);
    setLocalFileInfo(null);
    setUploadProgress(0);

    setPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return guru.foto_url || null;
    });
  };

  const handleFileSelected = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      showNotice('Format gambar tidak didukung (JPG/PNG/WEBP).', 'error', 'Gagal');
      return;
    }

    try {
      const resized = await resizeImageFile(file, 1024, 0.85);
      const finalFile = resized || file;

      profileForm.setData('file_foto', finalFile);

      const localUrl = URL.createObjectURL(finalFile);

      setPreviewUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return localUrl;
      });

      setLocalFileInfo({
        name: finalFile.name,
        size: finalFile.size,
        type: finalFile.type,
      });
    } catch (error) {
      console.error(error);
      showNotice('Gagal memproses gambar.', 'error', 'Gagal');
    }
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) handleFileSelected(file);
  };

  const submitProfile = (event) => {
    event.preventDefault();

    if (!canProfileRoute) {
      toast.error('Route update profil belum tersedia.');
      return;
    }

    setLastAction('profile');

    profileForm.post(safeRoute('guru.profile.update'), {
      preserveScroll: true,
      forceFormData: true,

      onProgress: (evt) => {
        if (!evt) return;
        if (evt.percentage != null) {
          setUploadProgress(Math.round(evt.percentage));
        }
      },

      onSuccess: () => {
        setShowEdit(false);
        profileForm.reset('file_foto');
        setLocalFileInfo(null);
        setUploadProgress(0);
        setLastAction(null);
      },

      onError: () => {
        setLastAction(null);
      },
    });
  };

  const submitAccount = (event) => {
    event.preventDefault();

    if (!canAccountRoute) {
      toast.error('Route akun belum tersedia.');
      return;
    }

    setLastAction('account');

    accountForm.put(safeRoute('guru.profile.account'), {
      preserveScroll: true,
      onSuccess: () => setLastAction(null),
      onError: () => setLastAction(null),
    });
  };

  const passMismatch =
    (passwordForm.data.password || passwordForm.data.password_confirmation) &&
    passwordForm.data.password !== passwordForm.data.password_confirmation;

  const submitPassword = (event) => {
    event.preventDefault();

    if (!canPasswordRoute) {
      toast.error('Route password belum tersedia.');
      return;
    }

    setLastAction('password');
    setPwBanner(null);

    if (
      passwordForm.data.password &&
      passwordForm.data.password_confirmation &&
      passwordForm.data.password !== passwordForm.data.password_confirmation
    ) {
      setPwTouched((state) => ({
        ...state,
        confirm: true,
        password: true,
      }));

      setPwBanner('Konfirmasi password tidak cocok.');
      return;
    }

    passwordForm.put(safeRoute('guru.profile.password'), {
      preserveScroll: true,

      onError: (errors) => {
        setPwBanner(pickFirstError(errors) || 'Gagal mengubah password.');
      },

      onSuccess: () => {
        passwordForm.reset();
        setPwTouched({
          current: false,
          password: false,
          confirm: false,
        });
        setPwBanner(null);
        setLastAction(null);
      },
    });
  };

  const downloadVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${guru.nama_lengkap || ''}`,
      `TEL;TYPE=CELL:${guru.no_telepon || ''}`,
      'END:VCARD',
    ].join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${(guru.nama_lengkap || 'profile').replace(/\s+/g, '_')}.vcf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <GuruLayout header="Profil Saya">
      <Head title="Profil Guru" />

      <CenterPopupNotice
        message={notice.message}
        type={notice.type}
        title={notice.title}
        duration={2300}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Hero */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-[2rem] bg-white/30 blur-sm" />

                    <img
                      src={previewUrl || fallbackGuruAvatar}
                      alt={guru.nama_lengkap || 'Profil Guru'}
                      className="relative h-20 w-20 rounded-[2rem] border border-white/30 object-cover shadow-xl sm:h-24 sm:w-24"
                      onError={() => setPreviewUrl(null)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowEdit(true)}
                      className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-white text-indigo-700 shadow-lg transition hover:bg-indigo-50"
                      title="Edit foto"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Profil Guru
                    </div>

                    <h1
                      className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl"
                      style={clampStyle(2)}
                    >
                      {guru.nama_lengkap || 'Guru'}
                    </h1>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        {guru.nip ? `NIP: ${guru.nip}` : 'NIP: -'}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        WA: {guru.no_telepon || '-'}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        {account?.username || auth?.user?.username || 'Akun Guru'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-indigo-700 shadow-lg shadow-indigo-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profil
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsapp(guru.no_telepon)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(guru.no_telepon)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Tersalin' : 'Salin WA'}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatBadge label="Jenis Kelamin" value={guru.jenis_kelamin} icon={UserRound} />
                <StatBadge label="Agama" value={guru.agama} icon={Shield} />
                <StatBadge label="Status" value="Guru" icon={GraduationCap} />
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT */}
            <div className="space-y-5 lg:col-span-1">
              <PremiumCard className="overflow-hidden p-0" delay={80}>
                <div className="relative bg-gradient-to-br from-white to-indigo-50/60 p-5 text-center">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/80 blur-2xl" />

                  <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-xl ring-4 ring-indigo-50">
                    <img
                      src={previewUrl || fallbackGuruAvatar}
                      alt={guru.nama_lengkap || 'Profil Guru'}
                      className="h-full w-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  </div>

                  <h2 className="mt-4 text-lg font-black leading-tight text-slate-900 break-words">
                    {guru.nama_lengkap || 'Guru'}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {guru.nip ? `NIP. ${guru.nip}` : 'Tenaga Pendidik'}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEdit(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsapp(guru.no_telepon)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WA
                    </button>

                    <button
                      type="button"
                      onClick={downloadVCard}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                      title="Unduh vCard"
                    >
                      <Download className="h-4 w-4" />
                      vCard
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(guru.no_telepon)}
                    className="mt-4 inline-flex max-w-full items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Phone className="h-4 w-4 shrink-0" />

                    <span className="min-w-0 truncate">
                      {guru.no_telepon || '-'}
                    </span>

                    {copied ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>
                </div>
              </PremiumCard>

              <PremiumCard className="p-4" delay={120}>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 ring-4 ring-indigo-50">
                    <img
                      src={sekolah?.logo_url || sekolah?.foto_url || fallbackSchoolAvatar}
                      alt={sekolah?.nama_sekolah || sekolah?.nama_lengkap || 'Sekolah'}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = fallbackSchoolAvatar;
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black uppercase tracking-wide text-indigo-600">
                      Sekolah
                    </div>

                    <div className="mt-0.5 text-sm font-black leading-snug text-slate-900 break-words">
                      {sekolah?.nama_sekolah || sekolah?.nama_lengkap || 'Sekolah belum tersedia'}
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {sekolah?.alamat || sekolah?.alamat_lengkap || 'Data sekolah belum lengkap'}
                    </div>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard className="p-4" delay={160}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <BadgeCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900">
                      Catatan Sistem
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Data profil guru digunakan untuk identitas akademik, jadwal mengajar, jurnal, absensi, dan laporan pembelajaran.
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </div>

            {/* RIGHT */}
            <div className="space-y-5 lg:col-span-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <CollapsibleCard
                  title="Informasi Guru"
                  description="Data identitas, kelahiran, dan kontak guru."
                  icon={<Shield className="h-5 w-5" />}
                  defaultOpen
                  delay={120}
                >
                  <div className="grid grid-cols-1 gap-2">
                    <FieldRow label="Nama Lengkap" value={guru.nama_lengkap} icon={User} />
                    <FieldRow label="NIP" value={guru.nip} icon={IdCard} />
                    <FieldRow label="Jenis Kelamin" value={guru.jenis_kelamin} icon={UserRound} />
                    <FieldRow label="Agama" value={guru.agama} icon={Sparkles} />
                    <FieldRow
                      label="Tempat, Tgl Lahir"
                      value={`${guru.tempat_lahir || '-'}, ${guru.tanggal_lahir || '-'}`}
                      icon={CalendarDays}
                    />
                    <FieldRow label="No. WhatsApp" value={guru.no_telepon} icon={Phone} />
                    <FieldRow label="Alamat" value={guru.alamat} icon={MapPin} />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard
                  title="Informasi Sekolah"
                  description="Data sekolah yang terhubung dengan akun guru."
                  icon={<School className="h-5 w-5" />}
                  defaultOpen
                  delay={160}
                >
                  {sekolah ? (
                    <div className="grid grid-cols-1 gap-2">
                      <FieldRow
                        label="Nama Sekolah"
                        value={sekolah.nama_sekolah || sekolah.nama_lengkap}
                        icon={School}
                      />
                      <FieldRow
                        label="Alamat Sekolah"
                        value={sekolah.alamat || sekolah.alamat_lengkap}
                        icon={MapPin}
                      />
                      <FieldRow
                        label="Email"
                        value={sekolah.email}
                        icon={AtSign}
                      />
                      <FieldRow
                        label="Telepon"
                        value={sekolah.no_telepon || sekolah.telepon}
                        icon={Phone}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                      Data sekolah belum tersedia.
                    </div>
                  )}
                </CollapsibleCard>
              </div>

              <CollapsibleCard
                title="Manajemen Akun"
                description="Atur username, email, dan password login."
                icon={<KeyRound className="h-5 w-5" />}
                defaultOpen
                delay={200}
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Update Username/Email */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                        <AtSign className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Username / Email
                        </div>

                        <div className="text-xs font-medium text-slate-500">
                          Digunakan untuk login akun guru.
                        </div>
                      </div>
                    </div>

                    <form onSubmit={submitAccount} className="mt-4 space-y-3">
                      <TextInput
                        label="Username"
                        value={accountForm.data.username}
                        onChange={(event) => accountForm.setData('username', event.target.value)}
                        error={accountForm.errors.username}
                        placeholder="username"
                      />

                      <TextInput
                        label="Email"
                        type="email"
                        value={accountForm.data.email}
                        onChange={(event) => accountForm.setData('email', event.target.value)}
                        error={accountForm.errors.email}
                        placeholder="email@contoh.com"
                      />

                      <button
                        type="submit"
                        disabled={!canAccountRoute || accountForm.processing}
                        className={cn(
                          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300',
                          !canAccountRoute || accountForm.processing
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:brightness-105'
                        )}
                        title={!canAccountRoute ? 'Route guru.profile.account belum ada' : 'Simpan akun'}
                      >
                        {accountForm.processing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Simpan Akun
                      </button>
                    </form>
                  </div>

                  {/* Update Password */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                        <Lock className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Ubah Password
                        </div>

                        <div className="text-xs font-medium text-slate-500">
                          Pastikan password baru mudah diingat.
                        </div>
                      </div>
                    </div>

                    {pwBanner && (
                      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{pwBanner}</span>
                      </div>
                    )}

                    <form onSubmit={submitPassword} className="mt-4 space-y-3">
                      <PasswordInput
                        label="Password Lama"
                        value={passwordForm.data.current_password}
                        show={showPw1}
                        onToggle={() => setShowPw1((value) => !value)}
                        error={passwordForm.errors.current_password}
                        invalid={passwordForm.errors.current_password}
                        onChange={(event) => {
                          setPwTouched((state) => ({ ...state, current: true }));
                          setPwBanner(null);
                          passwordForm.setData('current_password', event.target.value);
                        }}
                      />

                      <PasswordInput
                        label="Password Baru"
                        value={passwordForm.data.password}
                        show={showPw2}
                        onToggle={() => setShowPw2((value) => !value)}
                        error={passwordForm.errors.password}
                        invalid={passwordForm.errors.password || (pwTouched.password && passMismatch)}
                        hint="Minimal 8 karakter atau sesuai pengaturan sistem."
                        onChange={(event) => {
                          setPwTouched((state) => ({ ...state, password: true }));
                          setPwBanner(null);
                          passwordForm.setData('password', event.target.value);
                        }}
                      />

                      <PasswordInput
                        label="Konfirmasi Password Baru"
                        value={passwordForm.data.password_confirmation}
                        show={showPw3}
                        onToggle={() => setShowPw3((value) => !value)}
                        error={
                          passwordForm.errors.password_confirmation ||
                          (!passwordForm.errors.password_confirmation && pwTouched.confirm && passMismatch
                            ? 'Konfirmasi password tidak cocok.'
                            : null)
                        }
                        invalid={passwordForm.errors.password_confirmation || (pwTouched.confirm && passMismatch)}
                        onChange={(event) => {
                          setPwTouched((state) => ({ ...state, confirm: true }));
                          setPwBanner(null);
                          passwordForm.setData('password_confirmation', event.target.value);
                        }}
                      />

                      <button
                        type="submit"
                        disabled={!canPasswordRoute || passwordForm.processing}
                        className={cn(
                          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300',
                          !canPasswordRoute || passwordForm.processing
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:-translate-y-0.5 hover:brightness-105'
                        )}
                        title={!canPasswordRoute ? 'Route guru.profile.password belum ada' : 'Ubah password'}
                        onClick={() => {
                          setPwTouched({
                            current: true,
                            password: true,
                            confirm: true,
                          });
                        }}
                      >
                        {passwordForm.processing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Ubah Password
                      </button>
                    </form>
                  </div>
                </div>
              </CollapsibleCard>
            </div>
          </div>

          <div className="pb-4 text-center">
            <Link
              href={safeRoute('guru.dashboard')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-black text-indigo-700 shadow-sm backdrop-blur-xl transition hover:bg-indigo-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Edit Profil */}
      {showEdit && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={modalRef}
            className="animate-modal-pop max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-4 text-white sm:p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                    <Camera className="h-3.5 w-3.5" />
                    Edit Profil
                  </div>

                  <h3 className="mt-2 text-lg font-black leading-tight">
                    Perbarui Data Guru
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/75">
                    Ubah informasi identitas, kontak, dan foto profil guru.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false);
                    clearSelectedFile();
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={submitProfile}
              className="custom-scrollbar max-h-[calc(92vh-96px)] overflow-y-auto p-4 sm:p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput
                  label="Nama Lengkap"
                  value={profileForm.data.nama_lengkap}
                  onChange={(event) => profileForm.setData('nama_lengkap', event.target.value)}
                  error={profileForm.errors.nama_lengkap}
                  inputRef={firstInputRef}
                />

                <TextInput
                  label="NIP"
                  value={profileForm.data.nip}
                  onChange={(event) => profileForm.setData('nip', event.target.value)}
                  error={profileForm.errors.nip}
                />

                <SelectInput
                  label="Jenis Kelamin"
                  value={profileForm.data.jenis_kelamin}
                  onChange={(event) => profileForm.setData('jenis_kelamin', event.target.value)}
                  error={profileForm.errors.jenis_kelamin}
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </SelectInput>

                <TextInput
                  label="Tempat Lahir"
                  value={profileForm.data.tempat_lahir}
                  onChange={(event) => profileForm.setData('tempat_lahir', event.target.value)}
                  error={profileForm.errors.tempat_lahir}
                />

                <TextInput
                  label="Tanggal Lahir"
                  type="date"
                  value={profileForm.data.tanggal_lahir}
                  onChange={(event) => profileForm.setData('tanggal_lahir', event.target.value)}
                  error={profileForm.errors.tanggal_lahir}
                />

                <SelectInput
                  label="Agama"
                  value={profileForm.data.agama}
                  onChange={(event) => profileForm.setData('agama', event.target.value)}
                  error={profileForm.errors.agama}
                >
                  <option value="">Pilih Agama</option>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </SelectInput>

                <TextInput
                  label="No. WhatsApp / Telepon"
                  value={profileForm.data.no_telepon}
                  onChange={(event) => profileForm.setData('no_telepon', event.target.value)}
                  error={profileForm.errors.no_telepon}
                />

                <div className="md:col-span-2">
                  <TextInput
                    label="Alamat"
                    value={profileForm.data.alamat}
                    onChange={(event) => profileForm.setData('alamat', event.target.value)}
                    error={profileForm.errors.alamat}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Foto Profil
                </label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={cn(
                    'rounded-3xl border-2 border-dashed p-4 transition-all duration-300',
                    dragActive
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50/70 hover:border-indigo-200 hover:bg-indigo-50/30'
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white text-slate-300 shadow-sm sm:mx-0">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-800 sm:justify-start">
                        <UploadCloud className="h-5 w-5 text-indigo-600" />
                        Tarik gambar ke sini atau pilih dari perangkat
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Format JPG, PNG, atau WEBP. Gambar akan diperkecil otomatis supaya upload lebih cepat.
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50">
                          <Camera className="h-4 w-4" />
                          Pilih Gambar

                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={onFileChange}
                          />
                        </label>

                        {localFileInfo && (
                          <button
                            type="button"
                            onClick={clearSelectedFile}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-rose-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </button>
                        )}
                      </div>

                      {localFileInfo && (
                        <p className="mt-2 text-xs font-medium text-slate-500 break-words">
                          {localFileInfo.name} • {formatFileSize(localFileInfo.size)}
                        </p>
                      )}

                      {profileForm.errors.file_foto && (
                        <div className="mt-2 text-xs font-semibold text-rose-600">
                          {profileForm.errors.file_foto}
                        </div>
                      )}

                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-3">
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>

                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            Mengunggah: {uploadProgress}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    setShowEdit(false);
                    clearSelectedFile();
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={profileForm.processing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {profileForm.processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
        }

        @keyframes softRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </GuruLayout>
  );
}