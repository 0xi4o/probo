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
	"database/sql/driver"
	"fmt"
)

func (ds DataSensitivity) MarshalText() ([]byte, error) {
	return []byte(ds.String()), nil
}

func (ds *DataSensitivity) UnmarshalText(data []byte) error {
	val := string(data)

	switch val {
	case DataSensitivityNone.String():
		*ds = DataSensitivityNone
	case DataSensitivityLow.String():
		*ds = DataSensitivityLow
	case DataSensitivityMedium.String():
		*ds = DataSensitivityMedium
	case DataSensitivityHigh.String():
		*ds = DataSensitivityHigh
	case DataSensitivityCritical.String():
		*ds = DataSensitivityCritical
	default:
		return fmt.Errorf("invalid DataSensitivity value: %q", val)
	}

	return nil
}

func (ds DataSensitivity) String() string {
	return string(ds)
}

func (ds *DataSensitivity) Scan(value any) error {
	val, ok := value.(string)
	if !ok {
		return fmt.Errorf("invalid scan source for DataSensitivity, expected string got %T", value)
	}

	return ds.UnmarshalText([]byte(val))
}

func (ds DataSensitivity) Value() (driver.Value, error) {
	return ds.String(), nil
}
