import {Component, inject, signal, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";


interface Training {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  template: `
    <h1>Trainings</h1>
    <form (ngSubmit)="addTraining()" name="input">
      <input [(ngModel)]="draftTraining.name" type="text" name="name" id="name"/>
      <textarea [(ngModel)]="draftTraining.description" type="text" name="description" id="description"></textarea>
      <input [(ngModel)]="draftTraining.price" type="number" name="price" id="price" step="0.01"/>
      <input [(ngModel)]="draftTraining.quantity" type="number" name="quantity" id="quantity" step="1"/>
      <button type="submit">ajouter uen formation</button>
    </form>
    @if (errorMessage()) {
      <p role="alert">{{ errorMessage() }}</p>
    } @else if(saveError()){
      <p role="alert">{{ saveError() }}</p>
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
  protected readonly saveError = signal('');
  protected readonly draftTraining = {
    name : "",
    description : "",
    price : 0,
    quantity : 0,
  }

  ngOnInit(): void {
    this.http.get<Training[]>('/api/trainings').subscribe({
      next: (trainings) => this.trainings.set(trainings),
      error: () => this.errorMessage.set('Could not load trainings.'),
    });
  }
  addTraining(): void {
    this.http.post<Training>('/api/trainings', this.draftTraining).subscribe({
      next: (createdTraining) => {
        this.trainings.update((items) => [...(items ?? []), createdTraining]);
      },
      error: () => {
        this.saveError.set('Could not add training.');
      },
    });
  }
}
