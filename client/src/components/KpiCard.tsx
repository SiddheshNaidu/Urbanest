import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  accentColor: 'emerald' | 'amber' | 'gold' | 'crimson';
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  pulse?: boolean;
}

const colorMap = {
  emerald: { gradient: 'from-emerald/5', text: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/20', solid: 'bg-emerald' },
  amber:   { gradient: 'from-amber/5',   text: 'text-amber',   bg: 'bg-amber/10',   border: 'border-amber/20',   solid: 'bg-amber' },
  gold:    { gradient: 'from-gold/5',    text: 'text-gold',    bg: 'bg-gold/10',    border: 'border-gold/20',    solid: 'bg-gold' },
  crimson: { gradient: 'from-crimson/5', text: 'text-crimson', bg: 'bg-crimson/10', border: 'border-crimson/20', solid: 'bg-crimson' },
};

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, accentColor, badgeText, badgeIcon, pulse }) => {
  const styles = colorMap[accentColor];

  return (
    <div className="bg-surface border border-border-dark rounded-xl p-5 hover:border-border-dark/80 transition-colors relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative z-10">
        <p className="text-[11px] font-semibold text-muted-2 uppercase tracking-wider mb-3">{title}</p>
        <div className="flex items-end gap-3 mb-1">
          <p className="font-mono text-3xl font-medium text-white tracking-tight">{value}</p>
          
          {badgeText && (
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${styles.text} ${badgeIcon ? styles.bg : ''} ${badgeIcon ? styles.border : ''} ${badgeIcon ? 'px-2 py-0.5 rounded border' : ''} mb-1.5`}>
              {pulse && <span className={`w-1.5 h-1.5 rounded-full ${styles.solid} animate-pulse`}></span>}
              {badgeIcon} {badgeText}
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
};
