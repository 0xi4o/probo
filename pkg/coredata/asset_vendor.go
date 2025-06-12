// Copyright (c) 2025 Probo Inc <hello@getprobo.com>.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
// OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.

package coredata

import (
	"context"
	"fmt"
	"time"

	"github.com/getprobo/probo/pkg/gid"
	"github.com/jackc/pgx/v5"
	"go.gearno.de/kit/pg"
)

type (
	AssetVendor struct {
		AssetID   gid.GID      `db:"asset_id"`
		VendorID  gid.GID      `db:"vendor_id"`
		TenantID  gid.TenantID `db:"tenant_id"`
		CreatedAt time.Time    `db:"created_at"`
	}

	AssetVendors []*AssetVendor
)

func (av AssetVendors) Merge(
	ctx context.Context,
	conn pg.Conn,
	scope Scoper,
	assetID gid.GID,
	vendorIDs []gid.GID,
) error {
	q := `
WITH vendor_ids AS (
	SELECT
		unnest(@vendor_ids::text[]) AS vendor_id,
		@tenant_id AS tenant_id,
		@asset_id AS asset_id,
		@created_at::timestamptz AS created_at
)
MERGE INTO asset_vendors AS tgt
USING vendor_ids AS src
ON tgt.tenant_id = src.tenant_id
	AND tgt.asset_id = src.asset_id
	AND tgt.vendor_id = src.vendor_id
WHEN NOT MATCHED
	THEN INSERT (tenant_id, asset_id, vendor_id, created_at)
		VALUES (src.tenant_id, src.asset_id, src.vendor_id, src.created_at)
	WHEN NOT MATCHED BY SOURCE
		AND tgt.tenant_id = @tenant_id AND tgt.asset_id = @asset_id
		THEN DELETE
	`

	args := pgx.StrictNamedArgs{
		"tenant_id":  scope.GetTenantID(),
		"asset_id":   assetID,
		"created_at": time.Now(),
		"vendor_ids": vendorIDs,
	}

	_, err := conn.Exec(ctx, q, args)
	if err != nil {
		return fmt.Errorf("cannot merge asset vendors: %w", err)
	}

	return nil
}

func (av AssetVendors) Insert(
	ctx context.Context,
	conn pg.Conn,
	scope Scoper,
	assetID gid.GID,
	vendorIDs []gid.GID,
) error {
	q := `
WITH vendor_ids AS (
	SELECT unnest(@vendor_ids::text[]) AS vendor_id
)
INSERT INTO asset_vendors (tenant_id, asset_id, vendor_id, created_at)
SELECT
	@tenant_id AS tenant_id,
	@asset_id AS asset_id,
	vendor_id,
	@created_at AS created_at
FROM vendor_ids
`

	args := pgx.StrictNamedArgs{
		"tenant_id":  scope.GetTenantID(),
		"asset_id":   assetID,
		"created_at": time.Now(),
		"vendor_ids": vendorIDs,
	}

	_, err := conn.Exec(ctx, q, args)
	if err != nil {
		return fmt.Errorf("cannot insert asset vendors: %w", err)
	}

	return nil
}
