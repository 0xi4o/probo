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

package page

import (
	"fmt"
)

type (
	OrderField interface {
		Column() string
	}

	BaseOrderField string
)

const (
	OrderFieldCreatedAt BaseOrderField = "CREATED_AT"
	OrderFieldUpdatedAt BaseOrderField = "UPDATED_AT"
	OrderFieldName      BaseOrderField = "NAME"
)

func (of BaseOrderField) String() string {
	return string(of)
}

func (of BaseOrderField) Column() string {
	switch of {
	case OrderFieldCreatedAt:
		return "created_at"
	case OrderFieldUpdatedAt:
		return "updated_at"
	case OrderFieldName:
		return "name"
	default:
		return ""
	}
}

func (of BaseOrderField) MarshalText() ([]byte, error) {
	return []byte(of.String()), nil
}

func (of *BaseOrderField) UnmarshalText(data []byte) error {
	val := string(data)

	switch val {
	case OrderFieldCreatedAt.String():
		*of = OrderFieldCreatedAt
	case OrderFieldUpdatedAt.String():
		*of = OrderFieldUpdatedAt
	case OrderFieldName.String():
		*of = OrderFieldName
	default:
		return fmt.Errorf("invalid BaseOrderField value: %q", val)
	}

	return nil
}
