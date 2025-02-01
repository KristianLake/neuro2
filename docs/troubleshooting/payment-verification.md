# Payment Verification Troubleshooting Guide

## Issue Overview
Payment verification attempts are failing with the error "Verification attempt 5 error" and purchases are remaining in 'pending' status.

## Database Status Check
```sql
-- View affected purchase records
SELECT id, user_id, product_id, amount, status, created_at, updated_at
FROM purchases
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Check transaction logs
SELECT * FROM course_access_history
WHERE created_at > (current_timestamp - interval '1 hour')
ORDER BY created_at DESC;

-- Verify status column constraints
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'purchases'
AND column_name = 'status';
```

## Status Values
- `pending`: Initial state when purchase is created
- `completed`: Payment successful and access granted
- `failed`: Payment failed or verification failed
- `refunded`: Purchase was refunded and access revoked

## Verification Process Timeline
1. Purchase Creation: T+0
2. Payment Processing: T+2s
3. Status Update Attempts:
   - Attempt 1: T+3s
   - Attempt 2: T+5s (with backoff)
   - Attempt 3: T+9s (with backoff)
   - Attempt 4: T+17s (with backoff)
   - Attempt 5: T+25s (with backoff)

## Identified Issues
1. Race Conditions
   - Multiple concurrent verification attempts
   - Potential deadlocks in status updates
   - Transaction isolation level concerns

2. Timeout Issues
   - Verification attempts exceeding timeouts
   - Database connection timeouts
   - Network latency impacts

3. Transaction Rollback
   - Failed updates not properly rolled back
   - Inconsistent state between tables
   - Trigger execution failures

## Diagnostic Steps
1. Check Payment Gateway Logs
   ```sql
   -- Get purchase details with timestamps
   SELECT 
     p.id,
     p.status,
     p.created_at,
     p.updated_at,
     ca.created_at as access_created_at
   FROM purchases p
   LEFT JOIN course_access ca 
     ON ca.user_id = p.user_id 
     AND ca.module_id = p.product_id
   WHERE p.id = '[PURCHASE_ID]';
   ```

2. Verify Database Connection
   ```sql
   -- Check active connections
   SELECT * FROM pg_stat_activity 
   WHERE state = 'active';
   
   -- Check connection pool status
   SELECT * FROM pg_stat_database 
   WHERE datname = current_database();
   ```

3. Review Transaction Logs
   ```sql
   -- Check recent transactions
   SELECT txid_current(), current_timestamp;
   
   -- View transaction status
   SELECT * FROM pg_stat_database 
   WHERE datname = current_database();
   ```

## Common Error Patterns
1. Verification Timeout
   ```
   Error: Transaction timeout updating purchase status
   Cause: Verification attempt exceeded 15s timeout
   Impact: Purchase remains in pending state
   ```

2. Status Mismatch
   ```
   Error: Status update verification failed
   Expected: completed/failed
   Actual: pending
   Cause: Update not committed or rolled back
   ```

3. Connection Issues
   ```
   Error: Verification attempt X error
   Cause: Database connection dropped during verification
   Impact: Unable to verify status update
   ```

## Resolution Steps
1. For Stuck Transactions:
   ```sql
   -- Manually resolve stuck purchase
   UPDATE purchases 
   SET status = 'failed',
       updated_at = now()
   WHERE id = '[PURCHASE_ID]'
   AND status = 'pending'
   AND created_at < (now() - interval '30 minutes');
   ```

2. For Missing Access:
   ```sql
   -- Verify course access
   SELECT * FROM course_access
   WHERE user_id = '[USER_ID]'
   AND module_id = '[MODULE_ID]';
   
   -- Grant missing access if needed
   SELECT manage_course_access('[USER_ID]', '[MODULE_ID]');
   ```

3. For Cleanup:
   ```sql
   -- Clean up abandoned purchases
   UPDATE purchases 
   SET status = 'failed'
   WHERE status = 'pending'
   AND created_at < (now() - interval '1 hour');
   ```

## Prevention Measures
1. Implement status update verification with retries
2. Add transaction timeouts and proper cleanup
3. Improve error handling and logging
4. Monitor database connection pool
5. Add alerting for stuck transactions

## Monitoring Queries
```sql
-- Monitor pending purchases
SELECT count(*), 
       avg(extract(epoch from (now() - created_at))) as avg_age_seconds
FROM purchases 
WHERE status = 'pending';

-- Check verification attempts
SELECT count(*), status 
FROM purchases 
WHERE created_at > (now() - interval '1 hour')
GROUP BY status;

-- Monitor access grants
SELECT count(*), 
       extract(hour from created_at) as hour
FROM course_access_history
WHERE created_at > (now() - interval '24 hours')
GROUP BY extract(hour from created_at)
ORDER BY hour;
```