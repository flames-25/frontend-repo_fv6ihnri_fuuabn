import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Volume2, VolumeX, Settings, Plus, Download, Trash2, Edit2, Star, X } from 'lucide-react'

export const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 12 }}
    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    className={`rounded-2xl bg-[rgba(10,16,34,0.6)] backdrop-blur-md border border-white/10 shadow-xl shadow-indigo-950/20 ${className}`}
  >
    {children}
  </motion.div>
)

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-amber-400/90 hover:bg-amber-300 text-[#0b0f1f] shadow-md hover:shadow-lg shadow-amber-900/10',
    subtle: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    danger: 'bg-red-500/90 hover:bg-red-400 text-white',
  }
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <div className="relative group">
    <input
      ref={ref}
      className={`w-full px-4 py-2.5 rounded-md bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-amber-300/50 focus:outline-none transition ${className}`}
      {...props}
    />
    <span className="pointer-events-none absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform origin-center" />
  </div>
))

export const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 w-full max-w-xl"
        >
          <Card className="p-6">
            <div className="absolute top-3 right-3">
              <Button variant="subtle" onClick={onClose} aria-label="Close"><X size={18} /></Button>
            </div>
            {children}
          </Card>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export const Crest = () => (
  <div className="flex items-center gap-3">
    <div className="h-9 w-9 rounded-full bg-amber-300 text-[#0b0f1f] grid place-items-center font-black shadow-md">NQ</div>
    <div>
      <div className="text-amber-200 tracking-[0.2em] text-xs uppercase">Nightquad</div>
      <div className="text-white/90 font-serif text-xl">College Roster</div>
    </div>
  </div>
)

export const Icon = { Search, Volume2, VolumeX, Settings, Plus, Download, Trash2, Edit2, Star }
