-- Standard FX lot size for majors (price × lots × 100000 = P&L in quote currency).
UPDATE "symbols"
SET "contract_size" = '100000', "updated_at" = now()
WHERE "ticker" IN ('EURUSD', 'GBPUSD')
  AND ("contract_size" IS NULL OR "contract_size"::numeric = 0 OR "contract_size"::numeric = 1)
  AND "deleted_at" IS NULL;
