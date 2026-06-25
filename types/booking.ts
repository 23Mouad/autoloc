export interface Booking {
  id: string;
  carId: string;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
}
