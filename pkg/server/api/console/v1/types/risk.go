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

package types

import (
	"github.com/getprobo/probo/pkg/coredata"
	"github.com/getprobo/probo/pkg/gid"
	"github.com/getprobo/probo/pkg/page"
)

type (
	RiskOrderBy OrderBy[coredata.RiskOrderField]

	RiskConnection struct {
		TotalCount int
		Edges      []*RiskEdge
		PageInfo   PageInfo

		Resolver any
		ParentID gid.GID
		Filters  *coredata.RiskFilter
	}
)

func NewRiskConnection(
	p *page.Page[*coredata.Risk, coredata.RiskOrderField],
	parentType any,
	parentID gid.GID,
	filters *coredata.RiskFilter,
) *RiskConnection {
	var edges = make([]*RiskEdge, len(p.Data))

	for i := range edges {
		edges[i] = NewRiskEdge(p.Data[i], p.Cursor.OrderBy.Field)
	}

	return &RiskConnection{
		Edges:    edges,
		PageInfo: *NewPageInfo(p),

		Resolver: parentType,
		ParentID: parentID,
		Filters:  filters,
	}
}

func NewRiskEdge(r *coredata.Risk, orderBy coredata.RiskOrderField) *RiskEdge {
	return &RiskEdge{
		Cursor: r.CursorKey(orderBy),
		Node:   NewRisk(r),
	}
}

func NewRisk(r *coredata.Risk) *Risk {
	return &Risk{
		ID:                 r.ID,
		Name:               r.Name,
		Description:        r.Description,
		Treatment:          r.Treatment,
		InherentLikelihood: r.InherentLikelihood,
		InherentImpact:     r.InherentImpact,
		InherentRiskScore:  r.InherentRiskScore,
		ResidualLikelihood: r.ResidualLikelihood,
		ResidualImpact:     r.ResidualImpact,
		ResidualRiskScore:  r.ResidualRiskScore,
		Category:           r.Category,
		CreatedAt:          r.CreatedAt,
		UpdatedAt:          r.UpdatedAt,
		Note:               r.Note,
	}
}
