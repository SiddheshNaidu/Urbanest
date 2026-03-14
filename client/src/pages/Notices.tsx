import { BellRing, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_NOTICES = [
  { id: 1, title: 'Annual General Body Meeting', isUrgent: true, date: '15 Mar 2024', author: 'Secretary', content: 'The AGM for the current financial year will be held in the clubhouse. All owners are requested to attend.' },
  { id: 2, title: 'Swimming Pool Maintenance', isUrgent: false, date: '12 Mar 2024', author: 'Facility Manager', content: 'The swimming pool will be closed for routine maintenance and cleaning this weekend from 8 AM to 6 PM.' },
  { id: 3, title: 'Lift B Out of Service', isUrgent: true, date: '10 Mar 2024', author: 'Maintenance Dept', content: 'Lift B in Tower 2 is currently undergoing repairs and will be out of service until tomorrow morning.' },
];

export const Notices = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-xl text-white">Notice Board</h2>
        <button onClick={() => toast.success('Notice editor opened')} className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          Post Notice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_NOTICES.map((notice) => (
          <div key={notice.id} className="bg-surface border border-border-dark hover:border-border-dark/80 rounded-xl p-6 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notice.isUrgent ? 'bg-crimson/10 text-crimson border border-crimson/20' : 'bg-surface-2 text-white border border-border-dark'}`}>
                  {notice.isUrgent ? <BellRing size={18} /> : <CalendarDays size={18} />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1 group-hover:text-gold transition-colors">{notice.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-2">
                    <span className="text-white">{notice.author}</span>
                    <span>•</span>
                    <span>{notice.date}</span>
                    {notice.isUrgent && (
                      <>
                        <span>•</span>
                        <span className="text-crimson font-medium">URGENT</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pl-14">
              <p className="text-sm text-muted leading-relaxed">{notice.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
