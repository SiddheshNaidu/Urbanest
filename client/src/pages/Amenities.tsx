import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Amenity } from '../store/useStore';
import { 
  Dumbbell, Waves, Users, MapPin, CalendarClock, Activity, Clock, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Amenities = () => {
  const { currentUser, amenities, bookings, addBooking, updateAmenityStatus } = useStore();
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';
  const isResident = currentUser?.role === 'RESIDENT';

  const myBookings = bookings.filter(b => b.residentName === currentUser?.name);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SPORTS': return <Dumbbell className="text-emerald" />;
      case 'WELLNESS': return <Waves className="text-gold" />;
      case 'CLUBHOUSE': return <Users className="text-amber" />;
      default: return <MapPin className="text-muted" />;
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !bookingDate || !bookingTime || !currentUser) return;
    
    addBooking({
      amenityId: selectedAmenity.id,
      residentName: currentUser.name,
      flatId: currentUser.flatId || 'N/A',
      date: bookingDate,
      timeSlot: bookingTime,
      status: 'CONFIRMED'
    });
    
    toast.success(`${selectedAmenity.name} booked for ${bookingTime}`);
    setSelectedAmenity(null);
    setBookingDate('');
    setBookingTime('');
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
          {isAdmin ? "Amenities Management" : "Amenities & Facilities"}
        </h1>
        <p className="text-muted mt-2 text-sm md:text-base">
          {isAdmin ? 'Manage facility status and view all resident reservations.' : 'Browse premium facilities and book your sessions instantly.'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {isAdmin ? (
          // ADMIN VIEW
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Fast Status Toggles */}
            <div className="xl:col-span-1 space-y-6">
              <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                <Activity className="text-gold" /> Facility Status
              </h2>
              <div className="space-y-4">
                {amenities.map(amenity => (
                  <div key={amenity.id} className="bg-surface border border-border-dark p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-surface-2 rounded-xl border border-white/5">
                        {getCategoryIcon(amenity.category)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{amenity.name}</h4>
                        <span className={`text-xs font-semibold ${amenity.status === 'AVAILABLE' ? 'text-emerald' : 'text-crimson'}`}>
                          {amenity.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newStatus = amenity.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
                        updateAmenityStatus(amenity.id, newStatus);
                        toast.success(`${amenity.name} is now ${newStatus}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        amenity.status === 'AVAILABLE' 
                          ? 'bg-crimson/10 text-crimson hover:bg-crimson/20' 
                          : 'bg-emerald/10 text-emerald hover:bg-emerald/20'
                      }`}
                    >
                      {amenity.status === 'AVAILABLE' ? 'Halt' : 'Open'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Master Booking List */}
            <div className="xl:col-span-2">
              <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3 mb-6">
                <CalendarClock className="text-emerald" /> Master Bookings
              </h2>
              <div className="bg-surface border border-border-dark rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border-dark text-xs uppercase tracking-wider font-semibold text-muted">
                      <th className="p-4 pl-6">Resident</th>
                      <th className="p-4">Amenity</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const amenity = amenities.find(a => a.id === b.amenityId);
                      return (
                        <tr key={b.id} className="border-b border-border-dark/50 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-white">{b.residentName}</div>
                            <div className="text-sm text-muted">Flat: {b.flatId}</div>
                          </td>
                          <td className="p-4 text-white font-medium">{amenity?.name || 'Unknown'}</td>
                          <td className="p-4">
                            <div className="text-sm text-white">{b.date}</div>
                            <div className="text-xs text-muted flex items-center gap-1 mt-1">
                              <Clock size={12} /> {b.timeSlot}
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald/10 text-emerald">
                              <CheckCircle2 size={14} /> {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="p-12 text-center text-muted">No bookings mapped.</div>
                )}
              </div>
            </div>
          </div>
        ) : isResident ? (
          // RESIDENT VIEW
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-heading font-bold text-white mb-6">Available Facilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {amenities.map(amenity => (
                  <div key={amenity.id} className="bg-surface border border-border-dark p-6 rounded-3xl relative overflow-hidden group hover:border-gold/30 transition-all">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-4 bg-surface-2 border border-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                          {getCategoryIcon(amenity.category)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          amenity.status === 'AVAILABLE' ? 'bg-emerald/10 text-emerald' : 'bg-crimson/10 text-crimson'
                        }`}>
                          {amenity.status}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">{amenity.name}</h3>
                      <p className="text-sm text-muted mb-6 flex-grow">Max Capacity: {amenity.capacity} Persons</p>
                      
                      <button
                        onClick={() => setSelectedAmenity(amenity)}
                        disabled={amenity.status === 'MAINTENANCE'}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-gold hover:text-black transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white"
                      >
                        {amenity.status === 'MAINTENANCE' ? 'Under Maintenance' : 'Book Session'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                <CalendarClock className="text-gold" /> My Bookings
              </h2>
              
              {myBookings.length > 0 ? (
                <div className="bg-surface border border-border-dark rounded-3xl p-6 space-y-4">
                  {myBookings.map(b => {
                    const amenity = amenities.find(a => a.id === b.amenityId);
                    return (
                      <div key={b.id} className="p-4 bg-surface-2 border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white">{amenity?.name}</h4>
                          <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded-lg font-semibold border border-emerald/20">
                            {b.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1.5"><CalendarClock size={14}/> {b.date}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14}/> {b.timeSlot}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-surface border border-border-dark border-dashed rounded-3xl p-12 text-center">
                  <CalendarClock className="mx-auto text-muted mb-4" size={48} opacity={0.5} />
                  <p className="text-muted">No upcoming bookings.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-muted">Access Restricted.</div>
        )}
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedAmenity && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-dark/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border-dark rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
              
              <h3 className="text-2xl font-bold text-white mb-2">Book {selectedAmenity.name}</h3>
              <p className="text-muted text-sm mb-6">Select your preferred date and time slot below.</p>
              
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-2 mb-2">Time Slot</label>
                  <select 
                    required
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
                  >
                    <option value="" disabled>Select a block</option>
                    {[
                      "06:00 AM - 07:00 AM",
                      "07:00 AM - 08:00 AM",
                      "08:00 AM - 09:00 AM",
                      "17:00 PM - 18:00 PM",
                      "18:00 PM - 19:00 PM",
                      "19:00 PM - 20:00 PM"
                    ].map(slot => {
                      const isBooked = bookingDate && selectedAmenity ? bookings.some(b => 
                        b.amenityId === selectedAmenity.id && 
                        b.date === bookingDate && 
                        b.timeSlot === slot &&
                        b.status === 'CONFIRMED'
                      ) : false;

                      return (
                        <option key={slot} value={slot} disabled={isBooked}>
                          {slot} {isBooked ? '(Unavailable)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedAmenity(null)}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all transform hover:scale-[1.02]"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
