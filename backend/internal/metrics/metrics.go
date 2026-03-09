package metrics

import (
	"math"
	"sort"

	"github.com/Zayn-Rekhi/cryptorisk/graph/model"
)

// balanceVolatility, downsideVolatility, maxDrawdown, drawdownVolatility, giniCoeff
type BalanceMetrics struct {
	TotalBalance       float64 `json:"total_balance" bson:"total_balance"`
	BalanceVolatility  float64 `json:"balance_volatility" bson:"balance_volatility"`
	DownsideVolatility float64 `json:"downside_volatility" bson:"downside_volatility"`
	MaxDrawdown        float64 `json:"maxdrawdown" bson:"maxdrawdown"`
	DrawdownVolatility float64 `json:"drawdown_volatility" bson:"drawdown_volatility"`
	GiniCoefficient    float64 `json:"gini_coefficient" bson:"gini_coefficient"`
}

func ComputeBalanceMetrics(m []*model.Profile, w int32) ([]*model.ProfileResponse, error) {
	var profiles []*model.ProfileResponse

	for _, prof := range m {
		resp, err := FetchWalletBalances(*prof, w)
		if err != nil {
			return nil, err
		}

		parsed, err := ParseBalances(*resp)
		if err != nil {
			return nil, err
		}

		var profile_metrics []*model.ProfileMetrics

		for key, val := range *parsed {
			metrics, err := CalculateWalletStatistics(val)
			if err != nil {
				return nil, err
			}

			metrics.ContractAddress = &key.ContractAddress
			metrics.ContractName = &key.ContractName
			metrics.LogoURL = &key.LogoURL

			profile_metrics = append(profile_metrics, metrics)
		}

		sort.Slice(profile_metrics, func(i, j int) bool {
			return *profile_metrics[i].TotalBalance > *profile_metrics[j].TotalBalance
		})

		profiles = append(profiles, &model.ProfileResponse{
			EntityRef:   prof.EntityRef,
			ProfileType: prof.ProfileType,
			Network:     prof.Network,
			Metrics:     profile_metrics,
		})
	}

	return profiles, nil
}

func CalculateWalletStatistics(s []*Snapshot) (*model.ProfileMetrics, error) {

	n := len(s)
	if n < 2 {
		return nil, nil
	}

	var (
		gkVarSum    float64
		downsideSum float64
		drawdownSum float64
		rollingPeak = (*s[0]).Close
		minDrawdown float64
	)

	for i := 1; i < n; i++ {
		cur := *s[i]
		prev := *s[i-1]

		if cur.High > 0 && cur.Low > 0 {
			gkVarSum += 0.5 * math.Pow(math.Log(cur.High/cur.Low), 2)
		}

		if cur.Open > 0 && cur.Close > 0 {
			gkVarSum -= (2*math.Log(2) - 1) * math.Pow(math.Log(cur.Close/cur.Open), 2)
		}

		if prev.Close > 0 && cur.Close > 0 {
			ret := math.Log(cur.Close / prev.Close)
			if ret < 0 {
				downsideSum += ret * ret
			}
		}

		if cur.Close > rollingPeak {
			rollingPeak = cur.Close
		}

		if rollingPeak > 0 {
			drawdown := (cur.Close - rollingPeak) / rollingPeak
			drawdownSum += drawdown * drawdown
			minDrawdown = math.Min(minDrawdown, drawdown)
		}
	}

	// Volatilities
	var balanceVol float64
	if gkVarSum > 0 {
		balanceVol = math.Sqrt(gkVarSum / float64(n))
	}

	downsideVol := math.Sqrt(downsideSum / float64(n-1))
	drawdownVol := math.Sqrt(drawdownSum / float64(n))
	maxDrawdown := math.Abs(minDrawdown)

	// Gini coefficient
	closes := make([]float64, 0, n)
	for _, t := range s {
		closes = append(closes, (*t).Close)
	}
	sort.Float64s(closes)

	var (
		weightedSum float64
		totalSum    float64
	)

	for i, v := range closes {
		weightedSum += (2*float64(i+1) - float64(n) - 1) * v
		totalSum += v
	}

	var gini float64
	if totalSum > 0 {
		gini = weightedSum / (float64(n) * totalSum)
	}

	sanitize := func(f float64) *float64 {
		if math.IsNaN(f) || math.IsInf(f, 0) {
			return nil
		}
		return &f
	}

	return &model.ProfileMetrics{
		TotalBalance:              sanitize(totalSum),
		BalanceVolatility:         sanitize(balanceVol),
		DownsideVolatility:        sanitize(downsideVol),
		MaxDrawdown:               sanitize(maxDrawdown),
		DrawDownVolatility:        sanitize(drawdownVol),
		GiniCoefficientOfBalances: sanitize(gini),
	}, nil
}
