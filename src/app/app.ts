import {afterNextRender, Component, ElementRef, inject, Injector, OnInit, signal, viewChild} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";


interface Training {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

type TrainingField = keyof Omit<Training, 'id'>;

@Component({
  imports: [FormsModule, NgTemplateOutlet],
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
                  @let activeField = editDraft?.id === training.id ? editDraft?.field : null;
                  <ng-template #fieldEditor>
                    @if (editDraft; as draft) {
                      <form class="w-100" (ngSubmit)="editTraining(training)">
                        <fieldset [disabled]="editSaving()">
                          <label class="visually-hidden" for="edit-training-value">{{ editLabels[draft.field] }}</label>
                          @switch (draft.field) {
                            @case ('name') {
                              <input #editInput class="form-control" [(ngModel)]="draft.value"
                                     type="text" name="value" id="edit-training-value"/>
                            }
                            @case ('description') {
                              <textarea #editInput class="form-control" [(ngModel)]="draft.value"
                                        name="value" id="edit-training-value" rows="3"></textarea>
                            }
                            @default {
                              <input #editInput class="form-control" [(ngModel)]="draft.value"
                                     type="number" name="value" id="edit-training-value"
                                     [step]="draft.field === 'price' ? '0.01' : '1'" required/>
                            }
                          }
                          @if (editError()) {
                            <p class="alert alert-danger mt-2 mb-0" role="alert">{{ editError() }}</p>
                          }
                          <div class="d-flex flex-wrap gap-2 mt-2">
                            <button class="btn btn-primary btn-sm" type="submit" [disabled]="draft.value === null">
                              {{ editSaving() ? 'Saving…' : 'Save' }}
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" type="button"
                                    (click)="editDraft = null">Cancel</button>
                          </div>
                        </fieldset>
                      </form>
                    }
                  </ng-template>
                  <li class="col">
                    <article class="card h-100 shadow-sm">
                      <div class="card-body d-flex flex-column p-4">
                        <div class="d-flex justify-content-between align-items-start gap-3">
                          @if (activeField === 'name') {
                            <ng-container [ngTemplateOutlet]="fieldEditor"></ng-container>
                          } @else {
                            <h3 class="h5 card-title text-break">
                              <button class="btn btn-link p-0 text-start" type="button" [disabled]="editSaving()"
                                      (click)="startEditing(training, 'name')">
                                {{ training.name || 'Edit name' }}
                              </button>
                            </h3>
                          }
                          @if (!activeField) {
                            <button (click)="deleteTraining(training.id)" class="border-0" type="button" aria-label="delete training"><span class="bi bi-trash"></span></button>
                          }
                        </div>
                        <div class="card-text text-break mb-4">
                          @if (activeField === 'description') {
                            <ng-container [ngTemplateOutlet]="fieldEditor"></ng-container>
                          } @else {
                            <button class="btn btn-link p-0 text-start" type="button" [disabled]="editSaving()"
                                    (click)="startEditing(training, 'description')">
                              {{ training.description || 'Edit description' }}
                            </button>
                          }
                        </div>
                        <dl class="d-flex flex-wrap gap-4 border-top pt-3 mt-auto mb-0">
                          <div>
                            <dt class="small text-body-secondary fw-normal">Price</dt>
                            <dd class="fw-semibold mb-0">
                              @if (activeField === 'price') {
                                <ng-container [ngTemplateOutlet]="fieldEditor"></ng-container>
                              } @else {
                                <button class="btn btn-link p-0" type="button" [disabled]="editSaving()"
                                        (click)="startEditing(training, 'price')">
                                  {{ training.price ?? 'Edit price' }}
                                </button>
                              }
                            </dd>
                          </div>
                          <div>
                            <dt class="small text-body-secondary fw-normal">Quantity</dt>
                            <dd class="fw-semibold mb-0">
                              @if (activeField === 'quantity') {
                                <ng-container [ngTemplateOutlet]="fieldEditor"></ng-container>
                              } @else {
                                <button class="btn btn-link p-0" type="button" [disabled]="editSaving()"
                                        (click)="startEditing(training, 'quantity')">
                                  {{ training.quantity ?? 'Edit quantity' }}
                                </button>
                              }
                            </dd>
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
  private readonly injector = inject(Injector);
  private readonly editInput = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('editInput');
  protected readonly trainings = signal<Training[] | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly saveError = signal('');
  protected readonly draftTraining = {
    name: "",
    description: "",
    price: 0,
    quantity: 0,
  }
  protected readonly editLabels: Record<TrainingField, string> = {
    name: 'Name',
    description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
  };
  protected readonly editSaving = signal(false);
  protected readonly editError = signal('');
  protected editDraft: { id: number; field: TrainingField; value: string | number | null } | null = null;

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
  startEditing(training: Training, field: TrainingField): void {
    this.editError.set('');
    this.editDraft = { id: training.id, field, value: training[field] };
    afterNextRender({
      write: () => this.editInput()?.nativeElement.focus(),
    }, { injector: this.injector });
  }

  editTraining(training: Training): void {
    const draft = this.editDraft;
    if (!draft || draft.id !== training.id || draft.value === null || this.editSaving()) {
      return;
    }

    const { id, ...values } = training;
    const changes = { [draft.field]: draft.value };
    this.editError.set('');
    this.editSaving.set(true);
    this.http.put<void>(`/api/trainings/${id}`, { ...values, ...changes }).subscribe({
      next: () => {
        this.trainings.update((items) =>
          items?.map((item) => item.id === id ? { ...item, ...changes } : item) ?? null
        );
        this.editDraft = null;
        this.editSaving.set(false);
      },
      error: () => {
        this.editError.set('Could not update training.');
        this.editSaving.set(false);
      },
    });
  }
}
