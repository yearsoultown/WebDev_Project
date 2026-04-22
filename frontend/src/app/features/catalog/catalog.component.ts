import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipmentService } from '../../core/services/equipment.service';
import {
  Equipment,
  EquipmentFilters,
  Category,
} from '../../core/interfaces/equipment.interface';

const CATEGORY_LABELS: Record<string, string> = {
  cameras: 'Cameras',
  lenses: 'Lenses',
  lighting: 'Lighting',
  audio: 'Audio',
  stabilizers: 'Stabilizers',
  drones: 'Drones',
};

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
})
export class CatalogComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);
  private readonly router = inject(Router);

  equipment: Equipment[] = [];
  loading = false;
  error = '';
  filters: EquipmentFilters = {};
  availableOnly = false;
  activeCategory: string | null = null;
  categories = Object.keys(CATEGORY_LABELS);
  readonly LABELS = CATEGORY_LABELS;

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.loading = true;
    this.error = '';

    const f: EquipmentFilters = { ...this.filters };

    if (this.activeCategory) {
      f.category = this.activeCategory;
    }

    if (this.availableOnly) {
      f.is_available = true;
    }

    this.equipmentService.getAll(f).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load equipment.';
        this.loading = false;
      },
    });
  }

  setCategory(cat: string | null): void {
    this.activeCategory = cat;
    this.loadEquipment();
  }

  applyFilters(): void {
    this.loadEquipment();
  }

  clearFilters(): void {
    this.filters = {};
    this.availableOnly = false;
    this.activeCategory = null;
    this.loadEquipment();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.min_price || this.filters.max_price || this.availableOnly);
  }

  navigateTo(id: number): void {
    this.router.navigate(['/equipment', id]);
  }
}