# Testing Guide

## Filosofía

- Tests de use cases con mocks de interfaces (rápidos, sin DB)
- Tests de handlers via `httptest` (integración ligera)
- Tests de repositorios con DB real (fieles a producción)
- Table-driven tests para cubrir múltiples casos

---

## Mocks de interfaces del domain

```go
// Mock manual — sin frameworks
type mockProductRepo struct {
    createFn  func(ctx context.Context, p *domain.Product) error
    getByIDFn func(ctx context.Context, id string) (*domain.Product, error)
}

func (m *mockProductRepo) Create(ctx context.Context, p *domain.Product) error {
    return m.createFn(ctx, p)
}
func (m *mockProductRepo) GetByID(ctx context.Context, id string) (*domain.Product, error) {
    return m.getByIDFn(ctx, id)
}
```

---

## Test de use case — tabla de casos

```go
func TestCreateProductUseCase_Execute(t *testing.T) {
    tests := []struct {
        name      string
        req       CreateProductRequest
        setupMock func(*mockProductRepo)
        wantErr   error
        wantName  string
    }{
        {
            name: "creates product successfully",
            req:  CreateProductRequest{Name: "Widget", Price: 9.99},
            setupMock: func(m *mockProductRepo) {
                m.createFn = func(_ context.Context, _ *domain.Product) error { return nil }
            },
            wantName: "Widget",
        },
        {
            name: "repo error propagates",
            req:  CreateProductRequest{Name: "Widget", Price: 9.99},
            setupMock: func(m *mockProductRepo) {
                m.createFn = func(_ context.Context, _ *domain.Product) error {
                    return errors.New("db down")
                }
            },
            wantErr: errors.New("db down"),
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := &mockProductRepo{}
            tt.setupMock(repo)

            uc := NewCreateProductUseCase(repo)
            got, err := uc.Execute(context.Background(), tt.req)

            if tt.wantErr != nil {
                if err == nil || err.Error() != tt.wantErr.Error() {
                    t.Fatalf("expected error %v, got %v", tt.wantErr, err)
                }
                return
            }
            if err != nil { t.Fatalf("unexpected error: %v", err) }
            if got.Name != tt.wantName {
                t.Errorf("name: got %q, want %q", got.Name, tt.wantName)
            }
        })
    }
}
```

---

## Test de handler — httptest

```go
func TestProductHandler_Create(t *testing.T) {
    tests := []struct {
        name       string
        body       string
        setupUC    func(*mockCreateUC)
        wantStatus int
        wantCode   string
    }{
        {
            name: "201 on success",
            body: `{"name":"Widget","price":9.99}`,
            setupUC: func(m *mockCreateUC) {
                m.executeFn = func(_ context.Context, req CreateProductRequest) (*domain.ProductResponse, error) {
                    return &domain.ProductResponse{Name: req.Name}, nil
                }
            },
            wantStatus: http.StatusCreated,
        },
        {
            name:       "400 on invalid json",
            body:       `{invalid}`,
            setupUC:    func(m *mockCreateUC) {},
            wantStatus: http.StatusBadRequest,
            wantCode:   apierrors.CodeInvalidBody,
        },
        {
            name: "409 on duplicate",
            body: `{"name":"Widget","price":9.99}`,
            setupUC: func(m *mockCreateUC) {
                m.executeFn = func(_ context.Context, _ CreateProductRequest) (*domain.ProductResponse, error) {
                    return nil, ErrAlreadyExists
                }
            },
            wantStatus: http.StatusConflict,
            wantCode:   apierrors.CodeConflict,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            uc := &mockCreateUC{}
            tt.setupUC(uc)
            h := NewProductHandler(uc)

            req := httptest.NewRequest(http.MethodPost, "/products", strings.NewReader(tt.body))
            req.Header.Set("Content-Type", "application/json")
            w := httptest.NewRecorder()
            h.Create(w, req)

            res := w.Result()
            if res.StatusCode != tt.wantStatus {
                t.Errorf("status: got %d, want %d", res.StatusCode, tt.wantStatus)
            }
            if tt.wantCode != "" {
                var body map[string]any
                json.NewDecoder(res.Body).Decode(&body)
                if body["error"] != tt.wantCode {
                    t.Errorf("code: got %v, want %s", body["error"], tt.wantCode)
                }
            }
        })
    }
}
```

---

## Test de repositorio — DB real

```go
func setupTestDB(t *testing.T) *gorm.DB {
    t.Helper()
    dsn := os.Getenv("TEST_DATABASE_URL")
    if dsn == "" { t.Skip("TEST_DATABASE_URL not set") }

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil { t.Fatalf("open db: %v", err) }

    sqlDB, _ := db.DB()
    if err := migrations.Run(sqlDB); err != nil { t.Fatalf("migrate: %v", err) }

    t.Cleanup(func() {
        db.Exec("DELETE FROM products WHERE name LIKE 'test_%'")
    })
    return db
}
```

---

## Convenciones

- Prefijo `test_` en datos de test para facilitar cleanup
- `t.Skip()` si no hay DB disponible — no fallar en CI sin DB
- Mocks manuales con funciones — sin `testify/mock`
- Un archivo `*_test.go` por archivo de producción
- Tabla de casos cuando hay 3+ variantes del mismo comportamiento
