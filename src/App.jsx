import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Spline from '@splinetool/react-spline'
import AudioProvider, { useAudio } from './components/AudioProvider'
import { Card, Button, Input, Modal, Crest, Icon } from './components/ui'

const seed = [
  { id: '1', name: 'Avery Quinn', major: 'Computer Science', year: 'Senior', tags: ['RA', 'Night Owl'] },
  { id: '2', name: 'Blake Rivera', major: 'Biology', year: 'Junior', tags: ['Lab', 'Track'] },
  { id: '3', name: 'Casey Lin', major: 'Economics', year: 'Sophomore', tags: ['Debate', 'Finance'] },
  { id: '4', name: 'Devon Park', major: 'Psychology', year: 'Senior', tags: ['Peer Mentor'] },
  { id: '5', name: 'Emery Shah', major: 'History', year: 'Freshman', tags: ['Archives'] },
  { id: '6', name: 'Jordan West', major: 'Mathematics', year: 'Junior', tags: ['TA', 'Chess'] },
  { id: '7', name: 'Kai Morgan', major: 'Music', year: 'Sophomore', tags: ['Choir', 'Piano'] },
  { id: '8', name: 'Rowan Ellis', major: 'Art & Design', year: 'Senior', tags: ['Studio', 'Gallery'] },
]

const STORAGE_KEY = 'nightquad_roster'
const SOUND_FILE_OPTIONAL = {
  input: '', // e.g. '/audio/input.mp3'
  success: '', // e.g. '/audio/success.mp3'
  delete: '', // e.g. '/audio/delete.mp3'
}

function useLocalRoster() {
  const [list, setList] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : seed
    } catch {
      return seed
    }
  })
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [list])
  return [list, setList]
}

function Starfield() {
  // Parallax starry gradient layers
  return (
    <div className="absolute inset-0 -z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#0b0f1f] to-[#0b0f1f] opacity-100" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-screen" />
      <motion.div
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Spline scene="https://prod.spline.design/4JFCLsE5jz72cZzw/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </motion.div>
      {/* subtle stars */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
      </div>
    </div>
  )
}

function SettingsBar() {
  const { enabled, setEnabled, volume, setVolume, keypressShimmer, setKeypressShimmer } = useAudio()
  return (
    <Card className="p-3 flex items-center gap-3">
      <Button variant="subtle" onClick={() => setEnabled(!enabled)} aria-pressed={enabled} aria-label="Toggle sound">
        {enabled ? <Icon.Volume2 size={18} /> : <Icon.VolumeX size={18} />}
        <span className="sr-only">Sound</span>
      </Button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        aria-label="Volume"
        className="w-32 accent-amber-300"
      />
      <label className="text-white/70 text-sm flex items-center gap-2">
        <input type="checkbox" checked={keypressShimmer} onChange={(e) => setKeypressShimmer(e.target.checked)} />
        Keypress shimmer
      </label>
    </Card>
  )
}

function RosterApp() {
  const [list, setList] = useLocalRoster()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { playTinn, playSuccess, playDelete, playShimmer } = useAudio()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) =>
      [p.name, p.major, p.year, ...(p.tags || [])].some((v) => String(v).toLowerCase().includes(q))
    )
  }, [query, list])

  const onSave = (person) => {
    if (editing) {
      setList((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...person } : p)))
    } else {
      setList((prev) => [{ id: Date.now().toString(), ...person }, ...prev])
    }
    playSuccess()
    setOpen(false)
    setEditing(null)
  }

  const onDelete = (id) => {
    setList((prev) => prev.filter((p) => p.id !== id))
    playDelete()
  }

  return (
    <div className="relative min-h-screen text-white">
      <Starfield />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <Crest />
          <SettingsBar />
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <Icon.Search className="text-amber-200/80" size={18} />
            <Input
              placeholder="Search name, major, year, tags..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); playShimmer() }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              onBlur={() => playTinn({ freq: 880 })}
            />
            <Button onClick={() => { setEditing(null); setOpen(true) }}><Icon.Plus size={16} /> Add</Button>
            <Button variant="subtle" onClick={() => {
              const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'nightquad_roster.json'
              a.click()
              URL.revokeObjectURL(url)
              }}><Icon.Download size={16} /> Export</Button>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -4 }} className="group">
              <Card className="p-5 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-white/0 via-white/0 to-amber-300/5" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-amber-200 uppercase tracking-[0.16em] text-[12px]">{p.year}</div>
                    <div className="font-serif text-2xl">{p.name}</div>
                  </div>
                  <button className="text-amber-300/70 hover:text-amber-300" aria-label="Feature"><Icon.Star size={18} /></button>
                </div>
                <div className="text-white/80 mt-1">{p.major}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(p.tags || []).map((t, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-sm">
                      {t}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="subtle" onClick={() => { setEditing(p); setOpen(true) }}><Icon.Edit2 size={16} /> Edit</Button>
                  <Button variant="danger" onClick={() => onDelete(p.id)}><Icon.Trash2 size={16} /> Delete</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <PersonModal open={open} onClose={() => { setOpen(false); setEditing(null) }} initial={editing} onSave={onSave} />

        <footer className="mt-12 text-center text-white/50 text-sm">Default volume low. Sounds honor reduced motion settings. Replace audio via README instructions.</footer>
      </div>
    </div>
  )
}

function PersonModal({ open, onClose, initial, onSave }) {
  const { playTinn, playShimmer } = useAudio()
  const [name, setName] = useState(initial?.name || '')
  const [major, setMajor] = useState(initial?.major || '')
  const [year, setYear] = useState(initial?.year || 'Freshman')
  const [tags, setTags] = useState((initial?.tags || []).join(', '))

  useEffect(() => {
    setName(initial?.name || '')
    setMajor(initial?.major || '')
    setYear(initial?.year || 'Freshman')
    setTags((initial?.tags || []).join(', '))
  }, [initial])

  const confirm = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), major: major.trim(), year, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-amber-200 tracking-[0.2em] uppercase text-xs">Edit Profile</div>
          <div className="font-serif text-2xl">{initial ? 'Update Member' : 'Add Member'}</div>
        </div>
        <div className="grid gap-3">
          <label className="space-y-1">
            <div className="text-white/70 text-sm">Name</div>
            <Input value={name} onChange={(e) => { setName(e.target.value); playShimmer() }} onBlur={() => playTinn({ freq: 880 })} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} placeholder="e.g., Alex Kim" />
          </label>
          <label className="space-y-1">
            <div className="text-white/70 text-sm">Major</div>
            <Input value={major} onChange={(e) => { setMajor(e.target.value); playShimmer() }} onBlur={() => playTinn({ freq: 784 })} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} placeholder="e.g., Physics" />
          </label>
          <label className="space-y-1">
            <div className="text-white/70 text-sm">Year</div>
            <select className="w-full px-4 py-2.5 rounded-md bg-white/5 text-white border border-white/10" value={year} onChange={(e) => setYear(e.target.value)} onBlur={() => playTinn({ freq: 698 })}>
              {['Freshman','Sophomore','Junior','Senior'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <div className="text-white/70 text-sm">Tags (comma separated)</div>
            <Input value={tags} onChange={(e) => { setTags(e.target.value); playShimmer() }} onBlur={() => playTinn({ freq: 988 })} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} placeholder="e.g., RA, Orchestra" />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={confirm}>Save</Button>
        </div>
        <div className="text-xs text-white/50">Tip: Sounds play on blur or Enter. You can mute or adjust volume in the top-right.</div>
      </div>
    </Modal>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <RosterApp />
    </AudioProvider>
  )
}
