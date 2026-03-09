package metrics

import (
	"fmt"
	"time"
)

type Snapshot struct {
	Time  time.Time `json:"time"`
	Open  float64   `json:"open"`
	High  float64   `json:"high"`
	Low   float64   `json:"low"`
	Close float64   `json:"close"`
}

func ParseBalances(r WalletResponse) (*map[Contract]([]*Snapshot), error) {
	mp := make(map[Contract]([]*Snapshot))

	for _, item := range r.Data.Items {
		items := []*Snapshot{}

		for _, snapshot := range item.Holdings {
			ss, err := time.Parse(time.RFC3339, snapshot.Timestamp)
			if err != nil {
				fmt.Println("Error parsing time:", err)
				return nil, nil
			}

			items = append(items, &Snapshot{
				Time:  ss,
				Open:  snapshot.Open.Quote,
				Close: snapshot.Close.Quote,
				High:  snapshot.High.Quote,
				Low:   snapshot.Low.Quote,
			})
		}

		key := Contract{item.ContractName, item.ContractAddress, item.LogoURL}
		mp[key] = items
	}

	return &mp, nil
}
