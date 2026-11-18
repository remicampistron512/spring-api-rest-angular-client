import {Component, inject, signal, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";


interface Training {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Trainings</h1>

    @if (errorMessage()) {
      <p role="alert">{{ errorMessage() }}</p>
    } @else if (trainings(); as items) {
      <ul>
        @for (training of items; track training.id) {
          <li>
            <h2>{{ training.name }}</h2>
            <p>{{ training.description }}</p>
            <p>Price: {{ training.price }} · Quantity: {{ training.quantity }}</p>
          </li>
        } @empty {
          <li>No trainings available.</li>
        }
      </ul>
    } @else {
      <p>Loading trainings…</p>
    }
  `,
})

export class App implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly trainings = signal<Training[] | null>(null);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.http.get<Training[]>('/api/trainings').subscribe({
      next: (trainings) => this.trainings.set(trainings),
      error: () => this.errorMessage.set('Could not load trainings.'),
    });
  }
}
