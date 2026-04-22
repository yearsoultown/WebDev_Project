import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/interfaces/booking.interface';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
})
export class BookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  bookings: Booking[] = [];
  loading = false;
  error = '';
  cancellingId: number | null = null;
  cancelError = '';

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;

    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings.';
        this.loading = false;
      },
    });
  }

  cancelBooking(booking: Booking): void {
    this.cancellingId = booking.id;
    this.cancelError = '';

    this.bookingService.cancel(booking.id).subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex((b) => b.id === updated.id);

        if (idx !== -1) {
          this.bookings[idx] = updated;
        }

        this.cancellingId = null;
      },
      error: (err) => {
        this.cancelError = err.error?.detail || 'Failed to cancel.';
        this.cancellingId = null;
      },
    });
  }

  statusClass(status: string): string {
    if (status === 'confirmed') return 'status status-confirmed';
    if (status === 'pending') return 'status status-pending';
    return 'status status-cancelled';
  }
}