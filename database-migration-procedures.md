# ERP Database Migration, Backup & Recovery Procedures

## 🚨 CRITICAL PRODUCTION REQUIREMENTS

### Prerequisites
- Database: Supabase PostgreSQL
- Tools: Supabase CLI (`supabase --version`)
- Environment: Access to production and staging supabases
- Permissions: Database admin access

---

## 1. DATABASE MIGRATION PROCEDURES

### Legacy Data Migration Process

#### Pre-Migration Checklist
```bash
# 1. Create backup of legacy database
pg_dump -h legacy-db-host -U legacy-user -d legacy-db > legacy_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Create staging environment
supabase link --project-ref your-staging-project
supabase db reset

# 3. Validate migration scripts
supabase db diff --file migration_validation.sql
```

#### ERP-Specific Data Migration Steps

##### Step 1: Customer/Contact Data Migration
```sql
-- Migrate customer data with validation
INSERT INTO public.customers (
    id,
    name,
    email,
    phone,
    address,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    legacy_name,
    legacy_email,
    CASE
        WHEN legacy_phone ~ '^[0-9+\-\s]+$' THEN legacy_phone
        ELSE NULL
    END as phone,
    legacy_address,
    NOW(),
    NOW()
FROM legacy_customers
WHERE legacy_name IS NOT NULL AND char_length(trim(legacy_name)) > 0
ON CONFLICT DO NOTHING;
```

##### Step 2: Inventory Data Migration
```sql
-- Migrate inventory with data cleansing
INSERT INTO public.inventory_items (
    item_id,
    name,
    category,
    stock,
    price,
    cost_price,
    status,
    created_at,
    updated_at
)
SELECT
    legacy_item_code,
    CASE
        WHEN char_length(trim(legacy_name)) > 200 THEN left(trim(legacy_name), 200)
        ELSE trim(legacy_name)
    END,
    CASE
        WHEN legacy_category IN ('Electronics', 'Furniture', 'Accessories') THEN legacy_category
        ELSE 'Electronics' -- Default category
    END,
    GREATEST(0, COALESCE(legacy_stock, 0)), -- Ensure non-negative stock
    GREATEST(0, COALESCE(legacy_price, 0)), -- Ensure non-negative price
    GREATEST(0, COALESCE(legacy_cost, 0)), -- Ensure non-negative cost
    CASE
        WHEN COALESCE(legacy_stock, 0) <= 0 THEN 'Out of Stock'
        WHEN COALESCE(legacy_stock, 0) < 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END,
    NOW(),
    NOW()
FROM legacy_inventory
WHERE legacy_name IS NOT NULL
  AND legacy_item_code IS NOT NULL
ON CONFLICT (item_id) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    updated_at = NOW();
```

##### Step 3: Sales Invoice Migration
```sql
-- Migrate sales invoices with complex item structure
INSERT INTO public.sales_invoices (
    invoice_id,
    customer_name,
    customer_phone,
    total_amount,
    status,
    date,
    items,
    created_at,
    updated_at
)
SELECT
    legacy_invoice_number,
    COALESCE(legacy_customer_name, 'Unknown Customer'),
    legacy_customer_phone,
    GREATEST(0, COALESCE(legacy_total, 0)),
    CASE
        WHEN legacy_status = 'paid' THEN 'Paid'
        WHEN legacy_status = 'overdue' THEN 'Overdue'
        WHEN legacy_status = 'cancelled' THEN 'Cancelled'
        ELSE 'Pending'
    END,
    COALESCE(legacy_date, NOW()::date),
    CASE
        WHEN legacy_items_data IS NOT NULL THEN
            json_build_array(
                json_build_object(
                    'id', gen_random_uuid(),
                    'name', 'Migrated Item',
                    'quantity', 1,
                    'price', legacy_total,
                    'total', legacy_total
                )
            )
        ELSE NULL
    END,
    NOW(),
    NOW()
FROM legacy_invoices
WHERE legacy_invoice_number IS NOT NULL
ON CONFLICT (invoice_id) DO NOTHING;
```

#### Post-Migration Validation
```sql
-- Validate data integrity
SELECT
    'Customers' as table_name,
    COUNT(*) as record_count,
    SUM(CASE WHEN name IS NULL OR char_length(trim(name)) = 0 THEN 1 ELSE 0 END) as invalid_names,
    SUM(CASE WHEN email IS NOT NULL AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 1 ELSE 0 END) as invalid_emails
FROM public.customers

UNION ALL

SELECT
    'Invoices' as table_name,
    COUNT(*) as record_count,
    SUM(CASE WHEN total_amount < 0 THEN 1 ELSE 0 END) as negative_amounts,
    SUM(CASE WHEN status NOT IN ('Paid', 'Pending', 'Overdue', 'Cancelled') THEN 1 ELSE 0 END) as invalid_status
FROM public.sales_invoices

UNION ALL

SELECT
    'Inventory' as table_name,
    COUNT(*) as record_count,
    SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END) as negative_stock,
    SUM(CASE WHEN price < 0 THEN 1 ELSE 0 END) as negative_prices
FROM public.inventory_items;
```

---

## 2. DATABASE BACKUP PROCEDURES

### Automated Daily Backups (Recommended)

#### Supabase Built-in Backups
```bash
# Enable automatic backups (Supabase Pro plan)
# Configure via Supabase Dashboard:
# - Daily backups: 7 day retention
# - Point-in-time recovery: 7 days
# - Backup encryption: AES-256
```

#### Manual Backup Script
```bash
#!/bin/bash
# backup.sh - Comprehensive ERP Database Backup

BACKUP_DIR="./backups/$(date +%Y%m%d)"
BACKUP_FILE="$BACKUP_DIR/erp_backup_$(date +%Y%m%d_%H%M%S).sql"

mkdir -p "$BACKUP_DIR"

echo "Starting ERP database backup..."

# Use Supabase CLI for authenticated backup
supabase db dump --db-url "$(supabase db url)" --file "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"

# Upload to secure storage (S3, etc.)
# aws s3 cp "${BACKUP_FILE}.gz" "s3://erp-backups/$(basename "${BACKUP_FILE}.gz")"

# Verify backup integrity
echo "Verifying backup integrity..."
gunzip -c "${BACKUP_FILE}.gz" | head -10 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backup successful: ${BACKUP_FILE}.gz"
    echo "📊 Backup size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
else
    echo "❌ Backup verification failed!"
    exit 1
fi

# Cleanup old backups (keep last 30 days)
find ./backups -name "*.gz" -mtime +30 -delete

echo "Backup process completed."
```

### Backup Verification
```sql
-- Verify backup contains expected data
SELECT
    schemaname,
    tablename,
    estimated_row_count
FROM pg_stat_user_tables
ORDER BY estimated_row_count DESC;

-- Check for any corrupted data
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

---

## 3. DATABASE RECOVERY PROCEDURES

### Emergency Recovery Protocol

#### Critical Incident Response
```bash
#!/bin/bash
# emergency-recovery.sh - Execute immediately upon data loss detection

echo "🚨 INITIATING EMERGENCY DATABASE RECOVERY 🚨"

# 1. Stop application traffic
kubectl scale deployment erp-app --replicas=0

# 2. Isolate database
supabase db pause

# 3. Identify latest good backup
LATEST_BACKUP=$(find ./backups -name "*.sql.gz" -mtime -7 | sort | tail -1)
echo "Using backup: $LATEST_BACKUP"

# 4. Restore from backup
echo "Restoring database..."
gunzip -c "$LATEST_BACKUP" | supabase db push

# 5. Verify restoration
echo "Verifying database integrity..."
psql "$(supabase db url)" -c "
    SELECT
        schemaname,
        tablename,
        estimated_row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY estimated_row_count DESC;
"

# 6. Re-enable database
supabase db resume

# 7. Gradual rollout of application
kubectl scale deployment erp-app --replicas=1
kubectl scale deployment erp-app --replicas=3

echo "✅ Database recovery completed. Monitor application health."
```

### Point-in-Time Recovery (Advanced)
```sql
-- Use Supabase's point-in-time recovery for precise rollback
-- Access via Supabase Dashboard > Database > Backups > Point-in-time recovery

-- For manual PITR (if supported):
SELECT pg_create_restore_point('pre_incident_state');

-- Roll back to specific point (requires database restart)
-- RESTORE POINT 'pre_incident_state';
```

---

## 4. MONITORING & ALERTING

### Database Health Monitoring
```sql
-- Create monitoring function
CREATE OR REPLACE FUNCTION public.get_database_health()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    status TEXT,
    threshold NUMERIC
) LANGUAGE sql AS $$
    -- Connection count
    SELECT 'active_connections'::text, count(*)::numeric, 'ok'::text, 50::numeric
    FROM pg_stat_activity
    WHERE state = 'active'

    UNION ALL

    -- Database size
    SELECT 'database_size_mb'::text, pg_database_size(current_database())::numeric / (1024*1024), 'ok'::text, 10000::numeric

    UNION ALL

    -- Cache hit ratio
    SELECT 'cache_hit_ratio'::text,
           (sum(blks_hit)::numeric / GREATEST(sum(blks_hit + blks_read), 1)) * 100,
           CASE WHEN (sum(blks_hit)::numeric / GREATEST(sum(blks_hit + blks_read), 1)) > 0.95 THEN 'ok' ELSE 'warning' END,
           95::numeric
    FROM pg_stat_database

    UNION ALL

    -- Long-running queries
    SELECT 'long_running_queries'::text, count(*)::numeric,
           CASE WHEN count(*) > 5 THEN 'critical' WHEN count(*) > 2 THEN 'warning' ELSE 'ok' END,
           2::numeric
    FROM pg_stat_activity
    WHERE state = 'active' AND now() - query_start > interval '5 minutes';
$$;
```

### Automated Alerting
```sql
-- Create alert function
CREATE OR REPLACE FUNCTION public.check_database_alerts()
RETURNS TABLE(alert_type TEXT, alert_message TEXT, severity TEXT)
LANGUAGE sql AS $$
    -- Check for excessive connections
    SELECT 'connections'::text,
           format('High connection count: %s (threshold: 50)', count(*)::text),
           'warning'::text
    FROM pg_stat_activity
    WHERE state = 'active'
    GROUP BY 1
    HAVING count(*) > 50

    UNION ALL

    -- Check for large tables growth
    SELECT 'table_growth'::text,
           format('Table %s grew significantly (>10MB)', schemaname || '.' || tablename),
           'info'::text
    FROM pg_stat_user_tables t
    JOIN pg_class c ON t.relid = c.oid
    WHERE pg_total_relation_size(c.oid) > 10 * 1024 * 1024; -- 10MB
$$;

-- Schedule monitoring (requires pg_cron or external scheduler)
-- SELECT cron.schedule('db-health-check', '*/15 * * * *', 'SELECT * FROM public.check_database_alerts();');
```

---

## 5. MAINTENANCE PROCEDURES

### Regular Maintenance Tasks
```bash
# Weekly vacuum analyze
supabase db psql -c "VACUUM ANALYZE;"

# Monitor index usage
supabase db psql -c "
    SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    ORDER BY idx_tup_read DESC;
"

# Reindex if necessary
supabase db psql -c "REINDEX TABLE CONCURRENTLY public.sales_invoices;"
supabase db psql -c "REINDEX TABLE CONCURRENTLY public.inventory_items;"
```

### Performance Optimization
```sql
-- Add missing indexes based on query analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_date
    ON public.sales_invoices (date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_category
    ON public.inventory_items (category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email
    ON public.customers (email) WHERE email IS NOT NULL;
```

---

## 📞 CONTACT & ESCALATION

**Database Emergency Contacts:**
- Primary DBA: [dba@company.com]
- Secondary DBA: [dba2@company.com]
- On-call Engineer: [oncall@company.com]

**Supabase Support:**
- Enterprise Support: contact@supabase.com
- Emergency Hotline: [Emergency phone number]

**Escalation Procedure:**
1. Alert on-call DBA immediately
2. Escalate to management if downtime > 1 hour
3. Customer notification protocol for outages > 4 hours

---

*This document must be reviewed and updated monthly. Last update: $(date)*
