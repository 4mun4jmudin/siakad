import re

f = open('f:/sistem/siakad/resources/js/Pages/Guru/Profile/Show.jsx','r',encoding='utf-8')
c = f.read()
f.close()

# Replace display fields
display_replace = """
                  <FieldRow label="Nama Lengkap" value={guru.nama_lengkap} icon={User} />
                  <FieldRow label="NIP" value={guru.nip} icon={BadgeCheck} />
                  <FieldRow label="Jenis Kelamin" value={guru.jenis_kelamin} icon={User} />
                  <FieldRow label="Agama" value={guru.agama} icon={Sparkles} />
                  <FieldRow label="Tempat, Tgl Lahir" value={`${guru.tempat_lahir || '-'}, ${guru.tanggal_lahir || '-'}`} icon={School} />
                  <FieldRow label="No. WhatsApp" value={guru.no_telepon} icon={Phone} />
                  <FieldRow label="Alamat" value={guru.alamat} icon={School} />
"""

c = re.sub(r'<FieldRow label="Nama Lengkap".*?<FieldRow label="Pendidikan Terakhir" value={guru.pendidikan_terakhir} icon={GraduationCap} />', display_replace.strip(), c, flags=re.DOTALL)

# Update form fields
form_replace = """
                      <TextInput
                        label="Nama Lengkap"
                        value={profileForm.data.nama_lengkap}
                        onChange={(e) => profileForm.setData('nama_lengkap', e.target.value)}
                        error={profileForm.errors.nama_lengkap}
                      />
                      <TextInput
                        label="NIP"
                        value={profileForm.data.nip}
                        onChange={(e) => profileForm.setData('nip', e.target.value)}
                        error={profileForm.errors.nip}
                      />
                      <TextInput
                        label="No. WhatsApp"
                        value={profileForm.data.no_telepon}
                        onChange={(e) => profileForm.setData('no_telepon', e.target.value)}
                        error={profileForm.errors.no_telepon}
                      />
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Jenis Kelamin
                        </label>
                        <select
                          value={profileForm.data.jenis_kelamin}
                          onChange={(e) => profileForm.setData('jenis_kelamin', e.target.value)}
                          className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="Laki-Laki">Laki-Laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                      <TextInput
                        label="Agama"
                        value={profileForm.data.agama}
                        onChange={(e) => profileForm.setData('agama', e.target.value)}
                        error={profileForm.errors.agama}
                      />
                      <TextInput
                        label="Tempat Lahir"
                        value={profileForm.data.tempat_lahir}
                        onChange={(e) => profileForm.setData('tempat_lahir', e.target.value)}
                        error={profileForm.errors.tempat_lahir}
                      />
                      <TextInput
                        label="Tanggal Lahir"
                        type="date"
                        value={profileForm.data.tanggal_lahir}
                        onChange={(e) => profileForm.setData('tanggal_lahir', e.target.value)}
                        error={profileForm.errors.tanggal_lahir}
                      />
                      <div className="sm:col-span-2">
                        <TextInput
                          label="Alamat"
                          value={profileForm.data.alamat}
                          onChange={(e) => profileForm.setData('alamat', e.target.value)}
                          error={profileForm.errors.alamat}
                        />
                      </div>
"""

c = re.sub(r'<TextInput\s+label="Nama Lengkap".*?<TextInput\s+label="Pendidikan Terakhir".*?/>', form_replace.strip(), c, flags=re.DOTALL)

# Also fix the no_telepon_wa references
c = c.replace('guru.no_telepon_wa', 'guru.no_telepon')

f = open('f:/sistem/siakad/resources/js/Pages/Guru/Profile/Show.jsx','w',encoding='utf-8')
f.write(c)
f.close()
