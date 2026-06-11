import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Save, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function JadwalSettingsForm({ pengaturan, className = '' }) {
  const { data, setData, put, processing, errors } = useForm({
    jadwal_hari: pengaturan.jadwal_hari || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    jadwal_waktu: pengaturan.jadwal_waktu || []
  });

  const availableDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const toggleDay = (day) => {
    if (data.jadwal_hari.includes(day)) {
      setData('jadwal_hari', data.jadwal_hari.filter(d => d !== day));
    } else {
      // Preserve order
      const newDays = [...data.jadwal_hari, day];
      newDays.sort((a, b) => availableDays.indexOf(a) - availableDays.indexOf(b));
      setData('jadwal_hari', newDays);
    }
  };

  const addTimeSlot = () => {
    setData('jadwal_waktu', [
      ...data.jadwal_waktu,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'pelajaran',
        label: '',
        start: '',
        end: '',
        keterangan: ''
      }
    ]);
  };

  const removeTimeSlot = (index) => {
    const newSlots = [...data.jadwal_waktu];
    newSlots.splice(index, 1);
    setData('jadwal_waktu', newSlots);
  };

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...data.jadwal_waktu];
    newSlots[index][field] = value;
    
    // Auto generate label if start and end are provided
    if (field === 'start' || field === 'end') {
      const start = field === 'start' ? value : newSlots[index].start;
      const end = field === 'end' ? value : newSlots[index].end;
      if (start && end && newSlots[index].type === 'pelajaran') {
        newSlots[index].label = `${start} - ${end}`;
      }
    }
    
    setData('jadwal_waktu', newSlots);
  };

  const moveSlot = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === data.jadwal_waktu.length - 1)) return;
    const newSlots = [...data.jadwal_waktu];
    const temp = newSlots[index];
    newSlots[index] = newSlots[index + direction];
    newSlots[index + direction] = temp;
    setData('jadwal_waktu', newSlots);
  };

  const submit = (e) => {
    e.preventDefault();
    put(route('admin.pengaturan.jadwal.update'), {
      preserveScroll: true,
    });
  };

  return (
    <section className={className}>
      <header className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Pengaturan Jadwal Pelajaran</h2>
        <p className="mt-1 text-sm text-gray-600">
          Atur hari efektif dan susunan blok waktu (jam pelajaran / istirahat) yang akan digunakan pada grid jadwal.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        
        {/* HARI EFEKTIF */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <InputLabel value="Hari Aktif / Efektif" className="text-base mb-3" />
          <div className="flex flex-wrap gap-3">
            {availableDays.map(day => (
              <label 
                key={day} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  data.jadwal_hari.includes(day) 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                  checked={data.jadwal_hari.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
          {errors.jadwal_hari && <p className="text-sm text-red-600 mt-2">{errors.jadwal_hari}</p>}
        </div>

        {/* BLOK WAKTU */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <InputLabel value="Susunan Jam Pelajaran & Istirahat" className="text-base mb-0" />
            <button 
              type="button" 
              onClick={addTimeSlot}
              className="flex items-center gap-1 text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Blok
            </button>
          </div>
          
          <div className="space-y-3">
            {data.jadwal_waktu.map((slot, index) => (
              <div 
                key={slot.id || index} 
                className={`flex flex-col sm:flex-row gap-3 p-3 rounded-lg border items-start sm:items-center ${
                  slot.type === 'istirahat' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 sm:w-auto w-full justify-between">
                  <div className="flex items-center gap-1 flex-col">
                    <button type="button" onClick={() => moveSlot(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                      <ChevronUpIcon />
                    </button>
                    <button type="button" onClick={() => moveSlot(index, 1)} disabled={index === data.jadwal_waktu.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                      <ChevronDownIcon />
                    </button>
                  </div>
                  
                  <select
                    className={`text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${
                      slot.type === 'istirahat' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-800'
                    }`}
                    value={slot.type}
                    onChange={(e) => updateTimeSlot(index, 'type', e.target.value)}
                  >
                    <option value="pelajaran">Pelajaran</option>
                    <option value="istirahat">Istirahat</option>
                  </select>
                  
                  <button 
                    type="button" 
                    onClick={() => removeTimeSlot(index)}
                    className="sm:hidden text-red-500 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 flex-1 w-full">
                  <div className="w-24">
                    <input
                      type="time"
                      className="w-full text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                      required
                    />
                  </div>
                  <span className="self-center text-slate-400">-</span>
                  <div className="w-24">
                    <input
                      type="time"
                      className="w-full text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <input
                      type="text"
                      className="w-full text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      placeholder={slot.type === 'istirahat' ? "Keterangan (mis: Istirahat)" : "Label (mis: 08:00 - 09:30)"}
                      value={slot.type === 'istirahat' ? (slot.keterangan || '') : (slot.label || '')}
                      onChange={(e) => {
                        if (slot.type === 'istirahat') updateTimeSlot(index, 'keterangan', e.target.value);
                        else updateTimeSlot(index, 'label', e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => removeTimeSlot(index)}
                  className="hidden sm:block text-slate-400 hover:text-red-500 p-2"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {data.jadwal_waktu.length === 0 && (
              <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada blok waktu yang diatur.</p>
              </div>
            )}
          </div>
          {errors.jadwal_waktu && <p className="text-sm text-red-600 mt-2">{errors.jadwal_waktu}</p>}
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Jadwal
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
