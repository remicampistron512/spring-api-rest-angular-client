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
    <main class="min-vh-100 bg-body-tertiary">
      <header class="bg-dark text-white">
        <div class="container py-4 py-md-5">
          <h1 class="display-5 fw-bold mb-0">Trainings</h1>
        </div>
      </header>

      <div class="container py-4 py-md-5">
        <div class="row g-4">
          <section class="col-lg-4" aria-labelledby="add-training-heading">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h2 class="h4 mb-4" id="add-training-heading">Add a training</h2>
                @if (saveError()) {
                  <p class="alert alert-danger" role="alert">{{ saveError() }}</p>
                }
                <form (ngSubmit)="addTraining()" name="input">
                  <div class="mb-3">
                    <label class="form-label" for="name">Name</label>
                    <input class="form-control" [(ngModel)]="draftTraining.name" type="text" name="name" id="name"/>
                  </div>
                  <div class="mb-3">
                    <label class="form-label" for="description">Description</label>
                    <textarea class="form-control" [(ngModel)]="draftTraining.description"
                              name="description" id="description" rows="3"></textarea>
                  </div>
                  <div class="row g-3 mb-4">
                    <div class="col-6">
                      <label class="form-label" for="price">Price</label>
                      <input class="form-control" [(ngModel)]="draftTraining.price"
                             type="number" name="price" id="price" step="0.01"/>
                    </div>
                    <div class="col-6">
                      <label class="form-label" for="quantity">Quantity</label>
                      <input class="form-control" [(ngModel)]="draftTraining.quantity"
                             type="number" name="quantity" id="quantity" step="1"/>
                    </div>
                  </div>
                  <button class="btn btn-primary w-100" type="submit">Add training</button>
                </form>
              </div>
            </div>
          </section>

          <section class="col-lg-8" aria-labelledby="catalog-heading">
            <h2 class="h4 mb-3" id="catalog-heading">Training catalog</h2>
            @if (errorMessage()) {
              <p class="alert alert-danger" role="alert">{{ errorMessage() }}</p>
            } @else if (trainings(); as items) {
              <ul class="row row-cols-1 row-cols-md-2 g-3 list-unstyled mb-0">
                @for (training of items; track training.id) {
                  <li class="col">
                    <article class="card h-100 shadow-sm">
                      <div class="card-body d-flex flex-column p-4">
                        <div class="d-flex justify-content-between align-items-start gap-3">
                          <h3 class="h5 card-title text-break">{{ training.name }}</h3>
                          <button (click)="deleteTraining(training.id)" class="border-0" type="button" aria-label="delete training"><span class="bi bi-trash"></span></button>
                        </div>
                        <p class="card-text text-body-secondary text-break mb-4">{{ training.description }}</p>
                        <dl class="d-flex flex-wrap gap-4 border-top pt-3 mt-auto mb-0">
                          <div>
                            <dt class="small text-body-secondary fw-normal">Price</dt>
                            <dd class="fw-semibold mb-0">{{ training.price }}</dd>
                          </div>
                          <div>
                            <dt class="small text-body-secondary fw-normal">Quantity</dt>
                            <dd class="fw-semibold mb-0">{{ training.quantity }}</dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  </li>
                } @empty {
                  <li class="col-12">
                    <div class="card card-body p-4 text-body-secondary">No trainings available.</div>
                  </li>
                }
              </ul>
            } @else {
              <div class="card card-body p-4">
                <div class="d-flex align-items-center gap-2 text-body-secondary" role="status">
                  <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                  <span>Loading trainings…</span>
                </div>
              </div>
            }
          </section>
        </div>
      </div>
    </main>
  `,
})

export class App implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly trainings = signal<Training[] | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly saveError = signal('');
  protected readonly draftTraining = {
    name: "",
    description: "",
    price: 0,
    quantity: 0,
  }
  protected editingId = null
  ngOnInit(): void {
    this.http.get<Training[]>('/api/trainings').subscribe({
      next: (trainings) => this.trainings.set(trainings),
      error: () => this.errorMessage.set('Could not load trainings.'),
    });
  }

  addTraining(): void {
    this.saveError.set('');
    this.http.post<Training>('/api/trainings', this.draftTraining).subscribe({
      next: (createdTraining) => {
        this.trainings.update((items) => [...(items ?? []), createdTraining]);
      },
      error: () => {
        this.saveError.set('Could not add training.');
      },
    });
  }

  deleteTraining(id: number): void {
    this.http.delete<void>(`/api/trainings/${id}`).subscribe({
      next: () => {
        this.trainings.update((items) =>
            items?.filter((training) => training.id !== id) ?? null
        );
      },
    });
  }
}
