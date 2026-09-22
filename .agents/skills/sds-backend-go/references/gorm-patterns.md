# GORM Patterns

## Setup de conexión

```go
func (p *providersProduction) GormDB() map[string]*gorm.DB {
    connections := make(map[string]*gorm.DB)
    for name, conn := range p.conf.Storage.Postgres {
        dsn := fmt.Sprintf(
            "host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
            conn.Host, conn.Port, conn.User, conn.Password,
            conn.Database, conn.SSLMode, conn.Timezone,
        )
        db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
        if err != nil { log.Fatalf("gorm open %s: %v", name, err) }

        sqlDB, _ := db.DB()
        sqlDB.SetMaxOpenConns(conn.MaxOpenConn)
        sqlDB.SetMaxIdleConns(conn.MaxIdleConn)
        sqlDB.SetConnMaxLifetime(time.Duration(conn.MaxConnLifeTime) * time.Minute)
        sqlDB.SetConnMaxIdleTime(time.Duration(conn.MaxConnIdleTime) * time.Minute)

        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()
        if err := sqlDB.PingContext(ctx); err != nil {
            log.Fatalf("ping %s: %v", name, err)
        }
        connections[name] = db
    }
    return connections
}
```

---

## Entity — gorm tags canónicos

```go
type Product struct {
    ID          uuid.UUID      `gorm:"type:uuid;primaryKey"`
    Name        string         `gorm:"not null"`
    Description string         `gorm:"type:text"`
    Price       float64        `gorm:"not null;default:0"`
    IsActive    bool           `gorm:"default:true"`
    OwnerID     uuid.UUID      `gorm:"type:uuid;not null;index"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
    if p.ID == uuid.Nil { p.ID = uuid.New() }
    return nil
}
```

### Tags frecuentes

| Tag | Uso |
|-----|-----|
| `gorm:"type:uuid;primaryKey"` | PK UUID |
| `gorm:"uniqueIndex"` | unique constraint |
| `gorm:"uniqueIndex:idx_name"` | unique compuesto |
| `gorm:"not null"` | NOT NULL |
| `gorm:"default:true"` | valor default |
| `gorm:"type:text"` | TEXT en lugar de VARCHAR |
| `gorm:"size:255"` | VARCHAR(255) |
| `gorm:"column:nombre_columna"` | nombre de columna explícito |

---

## Repository — operaciones básicas

```go
func (r *GormProductRepo) Create(ctx context.Context, p *domain.Product) error {
    return r.db.WithContext(ctx).Create(p).Error
}

func (r *GormProductRepo) GetByID(ctx context.Context, id string) (*domain.Product, error) {
    var p domain.Product
    err := r.db.WithContext(ctx).First(&p, "id = ?", id).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, domain.ErrNotFound
    }
    return &p, err
}

// Update — guarda todos los campos
func (r *GormProductRepo) Update(ctx context.Context, p *domain.Product) error {
    return r.db.WithContext(ctx).Save(p).Error
}

// Update parcial
func (r *GormProductRepo) UpdateFields(ctx context.Context, id string, fields map[string]any) error {
    return r.db.WithContext(ctx).Model(&domain.Product{}).Where("id = ?", id).Updates(fields).Error
}

// Soft Delete (requiere gorm.DeletedAt en el entity)
func (r *GormProductRepo) Delete(ctx context.Context, id string) error {
    return r.db.WithContext(ctx).Delete(&domain.Product{}, "id = ?", id).Error
}

func (r *GormProductRepo) ExistsByName(ctx context.Context, name string) (bool, error) {
    var count int64
    err := r.db.WithContext(ctx).Model(&domain.Product{}).Where("name = ?", name).Count(&count).Error
    return count > 0, err
}
```

---

## Paginación por cursor

```go
func (r *GormProductRepo) List(ctx context.Context, afterCreatedAt *time.Time, afterID *uuid.UUID, limit int, forward bool) ([]*domain.Product, error) {
    var products []*domain.Product

    if forward {
        query := r.db.WithContext(ctx).Order("created_at ASC, id ASC").Limit(limit)
        if afterCreatedAt != nil && afterID != nil {
            query = query.Where("(created_at, id) > (?, ?)", afterCreatedAt, afterID)
        }
        return products, query.Find(&products).Error
    }

    query := r.db.WithContext(ctx).Order("created_at DESC, id DESC").Limit(limit)
    if afterCreatedAt != nil && afterID != nil {
        query = query.Where("(created_at, id) < (?, ?)", afterCreatedAt, afterID)
    }
    if err := query.Find(&products).Error; err != nil {
        return nil, err
    }
    // Normalizar a ASC — application layer siempre recibe el mismo orden
    for i, j := 0, len(products)-1; i < j; i, j = i+1, j-1 {
        products[i], products[j] = products[j], products[i]
    }
    return products, nil
}
```

---

## Transacciones

```go
func (r *GormProductRepo) CreateWithStock(ctx context.Context, product *domain.Product, stock *domain.Stock) error {
    return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(product).Error; err != nil {
            return err
        }
        stock.ProductID = product.ID
        return tx.Create(stock).Error
    })
}
```

---

## Goose — convenciones

### Numeración
```
internal/migrations/
  00001_create_users_table.sql
  00002_create_products_table.sql
  00003_add_sku_to_products.sql
```

### Template de migración

```sql
-- +goose Up
CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    owner_id    UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_products_owner_id  ON products (owner_id);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products (deleted_at);

-- +goose Down
DROP TABLE IF EXISTS products;
```

### Migración de columna

```sql
-- +goose Up
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- +goose Down
ALTER TABLE products DROP COLUMN IF EXISTS sku;
```
