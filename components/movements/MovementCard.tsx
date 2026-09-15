'use client'
// components/movements/MovementCard.tsx
// Tarjeta para vista móvil de un movimiento

import { Edit2, Trash2, MoreVertical, Tag as TagIcon } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { useState } from 'react'

interface MovementCardProps {
  movement: Movement
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}

export function MovementCard({ movement, onEdit, onDelete }: MovementCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isIncome = movement.type === 'ingreso'

  return (
    <div className="card p-4 relative group">
      <div className="flex items-start gap-3">
        {/* Icon / Color */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5"
          style={{ 
            background: movement.category?.color ? `color-mix(in srgb, ${movement.category.color} 15%, transparent)` : 'var(--surface-elevated)',
            color: movement.category?.color || 'var(--foreground-muted)'
          }}
        >
          {movement.category?.name?.substring(0, 2).toUpperCase() ?? (isIncome ? 'IN' : 'GA')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-8">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
            {movement.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
            <span>{movement.category?.name ?? (isIncome ? 'Ingreso' : 'Sin categoría')}</span>
            <span>•</span>
            <span>{formatDate(movement.date)}</span>
            {movement.account?.name && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px]">{movement.account.name}</span>
              </>
            )}
          </div>
          
          {/* Tags (if any) */}
          {movement.tags && movement.tags.length > 0 && (
             <div className="flex flex-wrap gap-1 mt-2">
               {movement.tags.map(tag => (
                 <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border flex items-center gap-1">
                   <TagIcon size={8} /> {tag.name}
                 </span>
               ))}
             </div>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span 
            className="font-bold whitespace-nowrap text-base"
            style={{ color: isIncome ? 'var(--positive)' : 'var(--foreground)' }}
          >
            {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
          </span>
        </div>
      </div>

      {/* Menu Button (Absolute top right) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-2">
           <button 
             onClick={() => setMenuOpen(!menuOpen)}
             className="p-1 rounded text-foreground-subtle hover:bg-surface-elevated transition-colors"
             aria-label="Opciones"
           >
             <MoreVertical size={16} />
           </button>

           {/* Dropdown Simple */}
           {menuOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
               <div 
                 className="absolute right-0 top-8 z-50 rounded-lg shadow-modal py-1 w-32 slide-up"
                 style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
               >
                 {onEdit && (
                   <button
                     onClick={() => { setMenuOpen(false); onEdit(movement); }}
                     className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-subtle"
                     style={{ color: 'var(--foreground)' }}
                   >
                     <Edit2 size={14} /> Editar
                   </button>
                 )}
                 {onDelete && (
                   <button
                     onClick={() => { setMenuOpen(false); onDelete(movement); }}
                     className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-negative-light"
                     style={{ color: 'var(--negative)' }}
                   >
                     <Trash2 size={14} /> Eliminar
                   </button>
                 )}
               </div>
             </>
           )}
        </div>
      )}
    </div>
  )
}
