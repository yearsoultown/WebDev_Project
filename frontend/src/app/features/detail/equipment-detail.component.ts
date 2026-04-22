import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipmentService } from '../../core/services/equipment.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Equipment } from '../../core/interfaces/equipment.interface';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipment-detail.component.html',
  styleUrls: ['./equipment-detail.component.css'],
})
export class EquipmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly equipmentService = inject(EquipmentService);
  private readonly bookingService = inject(BookingService);
  public readonly authService = inject(AuthService);

  equipment: Equipment | null = null;
  loading = false;
  error = '';
  startDate = '';
  endDate = '';
  today = new Date().toISOString().split('T')[0];
  checkingAvailability = false;
  availabilityMessage = '';
  isAvailable = false;
  booking = false;
  bookingMessage = '';
  bookingSuccess = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.equipmentService.getById(id).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Not found.';
        this.loading = false;
      },
    });
  }

  getDays(): number {
    if (!this.startDate || !this.endDate) return 0;

    return Math.max(
      0,
      Math.round(
        (new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86400000
      )
    );
  }

  getTotal(): number {
    if (!this.equipment) return 0;
    return this.getDays() * parseFloat(this.equipment.daily_rate);
  }

  checkAvailability(): void {
    if (!this.equipment || !this.startDate || !this.endDate) return;

    this.checkingAvailability = true;
    this.availabilityMessage = '';

    this.bookingService
      .checkAvailability({
        equipment_id: this.equipment.id,
        start_date: this.startDate,
        end_date: this.endDate,
      })
      .subscribe({
        next: (res) => {
          this.isAvailable = res.available;
          this.availabilityMessage = res.available
            ? 'Available for selected dates'
            : 'Not available for selected dates';
          this.checkingAvailability = false;
        },
        error: (err) => {
          this.availabilityMessage =
            err.error?.end_date?.[0] ||
            err.error?.start_date?.[0] ||
            'Check failed';
          this.isAvailable = false;
          this.checkingAvailability = false;
        },
      });
  }

  bookEquipment(): void {
    if (!this.equipment || !this.startDate || !this.endDate) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.booking = true;
    this.bookingMessage = '';

    this.bookingService
      .create({
        equipment: this.equipment.id,
        start_date: this.startDate,
        end_date: this.endDate,
      })
      .subscribe({
        next: () => {
          this.bookingSuccess = true;
          this.bookingMessage = 'Booking confirmed — view in My Bookings';
          this.booking = false;
        },
        error: (err) => {
          this.bookingSuccess = false;
          this.bookingMessage =
            err.error?.non_field_errors?.[0] ||
            err.error?.detail ||
            'Booking failed — please try again';
          this.booking = false;
        },
      });
  }
}