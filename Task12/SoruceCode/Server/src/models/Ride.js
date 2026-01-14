// In-memory storage for rides (simulating database)
let rides = [];
let rideIdCounter = 1;

class Ride {
  constructor(data) {
    this.id = rideIdCounter++;
    this.driverName = data.driverName;
    this.driverPhone = data.driverPhone;
    this.origin = data.origin; // { address, lat, lon }
    this.destination = data.destination; // { address, lat, lon }
    this.departureTime = data.departureTime;
    this.departureDate = data.departureDate;
    this.totalSeats = data.totalSeats;
    this.availableSeats = data.totalSeats;
    this.pricePerSeat = data.pricePerSeat || 0;
    this.vehicleInfo = data.vehicleInfo || '';
    this.notes = data.notes || '';
    this.status = 'active'; // active, completed, cancelled
    this.bookings = [];
    this.createdAt = new Date().toISOString();
  }

  static findAll() {
    return rides.filter(r => r.status === 'active');
  }

  static findById(id) {
    return rides.find(r => r.id === parseInt(id));
  }

  static create(data) {
    const ride = new Ride(data);
    rides.push(ride);
    return ride;
  }

  static search(query) {
    let results = rides.filter(r => r.status === 'active' && r.availableSeats > 0);

    if (query.origin) {
      results = results.filter(r => 
        r.origin.address.toLowerCase().includes(query.origin.toLowerCase())
      );
    }

    if (query.destination) {
      results = results.filter(r => 
        r.destination.address.toLowerCase().includes(query.destination.toLowerCase())
      );
    }

    if (query.date) {
      results = results.filter(r => r.departureDate === query.date);
    }

    if (query.seats) {
      results = results.filter(r => r.availableSeats >= parseInt(query.seats));
    }

    return results;
  }

  static update(id, data) {
    const index = rides.findIndex(r => r.id === parseInt(id));
    if (index === -1) return null;
    
    rides[index] = { ...rides[index], ...data };
    return rides[index];
  }

  static delete(id) {
    const index = rides.findIndex(r => r.id === parseInt(id));
    if (index === -1) return false;
    
    rides[index].status = 'cancelled';
    return true;
  }

  static getHistory() {
    return rides;
  }

  static bookSeat(rideId, bookingData) {
    const ride = this.findById(rideId);
    if (!ride) return { success: false, error: 'Ride not found' };
    if (ride.availableSeats < bookingData.seatsRequested) {
      return { success: false, error: 'Not enough seats available' };
    }

    const booking = {
      id: Date.now(),
      passengerName: bookingData.passengerName,
      passengerPhone: bookingData.passengerPhone,
      passengerEmail: bookingData.passengerEmail,
      seatsBooked: bookingData.seatsRequested,
      pickupPoint: bookingData.pickupPoint || ride.origin.address,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };

    ride.bookings.push(booking);
    ride.availableSeats -= bookingData.seatsRequested;

    return { success: true, booking, ride };
  }

  static cancelBooking(rideId, bookingId) {
    const ride = this.findById(rideId);
    if (!ride) return { success: false, error: 'Ride not found' };

    const bookingIndex = ride.bookings.findIndex(b => b.id === parseInt(bookingId));
    if (bookingIndex === -1) return { success: false, error: 'Booking not found' };

    const booking = ride.bookings[bookingIndex];
    ride.availableSeats += booking.seatsBooked;
    booking.status = 'cancelled';

    return { success: true, booking, ride };
  }
}

// Add some sample rides
Ride.create({
  driverName: 'Ahmed Khan',
  driverPhone: '+92 300 1234567',
  origin: { address: 'FAST-NUCES Karachi', lat: 24.8607, lon: 67.0011 },
  destination: { address: 'Clifton, Karachi', lat: 24.8138, lon: 67.0300 },
  departureTime: '08:30',
  departureDate: '2026-01-16',
  totalSeats: 3,
  pricePerSeat: 150,
  vehicleInfo: 'Toyota Corolla - White - ABC-123',
  notes: 'AC available, music allowed'
});

Ride.create({
  driverName: 'Sara Ali',
  driverPhone: '+92 321 9876543',
  origin: { address: 'Gulshan-e-Iqbal, Karachi', lat: 24.9260, lon: 67.0928 },
  destination: { address: 'FAST-NUCES Karachi', lat: 24.8607, lon: 67.0011 },
  departureTime: '07:45',
  departureDate: '2026-01-16',
  totalSeats: 2,
  pricePerSeat: 100,
  vehicleInfo: 'Honda City - Silver - XYZ-789',
  notes: 'Female passengers preferred'
});

Ride.create({
  driverName: 'Usman Malik',
  driverPhone: '+92 333 5551234',
  origin: { address: 'DHA Phase 6, Karachi', lat: 24.7935, lon: 67.0536 },
  destination: { address: 'FAST-NUCES Karachi', lat: 24.8607, lon: 67.0011 },
  departureTime: '08:00',
  departureDate: '2026-01-17',
  totalSeats: 4,
  pricePerSeat: 200,
  vehicleInfo: 'Suzuki Cultus - Blue - DEF-456',
  notes: 'Punctual departure'
});

module.exports = Ride;
