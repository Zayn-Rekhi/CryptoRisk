package metrics

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/Zayn-Rekhi/cryptorisk/graph/model"
)

type WalletResponse struct {
	Data         Data    `json:"data"`
	Error        bool    `json:"error"`
	ErrorMessage *string `json:"error_message"`
	ErrorCode    *string `json:"error_code"`
}

type Data struct {
	Address          string      `json:"address"`
	UpdatedAt        string      `json:"updated_at"`
	NextUpdateAt     string      `json:"next_update_at"`
	QuoteCurrency    string      `json:"quote_currency"`
	ChainID          int         `json:"chain_id"`
	ChainName        string      `json:"chain_name"`
	ChainTipHeight   int64       `json:"chain_tip_height"`
	ChainTipSignedAt string      `json:"chain_tip_signed_at"`
	Items            []Item      `json:"items"`
	Pagination       *Pagination `json:"pagination"`
}

type Item struct {
	ContractDecimals     int         `json:"contract_decimals"`
	ContractName         string      `json:"contract_name"`
	ContractTickerSymbol string      `json:"contract_ticker_symbol"`
	ContractAddress      string      `json:"contract_address"`
	SupportsERC          interface{} `json:"supports_erc"`
	LogoURL              string      `json:"logo_url"`
	Holdings             []Holding   `json:"holdings"`
}

type Holding struct {
	Timestamp string  `json:"timestamp"`
	QuoteRate float64 `json:"quote_rate"`
	Open      OHLC    `json:"open"`
	High      OHLC    `json:"high"`
	Low       OHLC    `json:"low"`
	Close     OHLC    `json:"close"`
}

type OHLC struct {
	Balance     string  `json:"balance"`
	Quote       float64 `json:"quote"`
	PrettyQuote string  `json:"pretty_quote"`
}

type Pagination struct {
	// empty because pagination is null in this response
}

type TransactionsResponse struct {
	Address          string `json:"address"`
	UpdatedAt        string `json:"updated_at"`
	QuoteCurrency    string `json:"quote_currency"`
	ChainID          int    `json:"chain_id"`
	ChainName        string `json:"chain_name"`
	ChainTipHeight   int64  `json:"chain_tip_height"`
	ChainTipSignedAt string `json:"chain_tip_signed_at"`
	CurrentPage      int    `json:"current_page"`
	Links            Links  `json:"links"`
	Items            []Tx   `json:"items"`
}

type Links struct {
	Prev string `json:"prev"`
	Next string `json:"next"`
}

type Tx struct {
	BlockSignedAt    string      `json:"block_signed_at"`
	BlockHeight      int64       `json:"block_height"`
	BlockHash        string      `json:"block_hash"`
	TxHash           string      `json:"tx_hash"`
	TxOffset         int         `json:"tx_offset"`
	Successful       bool        `json:"successful"`
	FromAddress      string      `json:"from_address"`
	MinerAddress     string      `json:"miner_address"`
	FromAddressLabel string      `json:"from_address_label"`
	ToAddress        string      `json:"to_address"`
	ToAddressLabel   string      `json:"to_address_label"`
	Value            string      `json:"value"`
	ValueQuote       float64     `json:"value_quote"`
	PrettyValueQuote string      `json:"pretty_value_quote"`
	GasMetadata      GasMetadata `json:"gas_metadata"`
	GasOffered       int64       `json:"gas_offered"`
	GasSpent         int64       `json:"gas_spent"`
	GasPrice         int64       `json:"gas_price"`
	FeesPaid         string      `json:"fees_paid"`
	GasQuote         float64     `json:"gas_quote"`
	PrettyGasQuote   string      `json:"pretty_gas_quote"`
	GasQuoteRate     float64     `json:"gas_quote_rate"`
	Explorers        []Explorer  `json:"explorers"`
	// log_events intentionally omitted
}

type GasMetadata struct {
	ContractDecimals     int      `json:"contract_decimals"`
	ContractName         string   `json:"contract_name"`
	ContractTickerSymbol string   `json:"contract_ticker_symbol"`
	ContractAddress      string   `json:"contract_address"`
	SupportsERC          []string `json:"supports_erc"`
	LogoURL              string   `json:"logo_url"`
}

type Explorer struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type Contract struct {
	ContractAddress string `json:"contractAddress"`
	ContractName    string `json:"contractName"`
	LogoURL         string `json:"logoURL"`
}

type Transaction struct {
	Tx_hash            string  `json:"tx_hash"`
	Timestamp          string  `json:"timestamp"`
	Amount             float64 `json:"float64"`
	TokenAddress       string  `json:"token_address"`
	Direction          bool    `json:"direction"`
	CounterpartyAdress string  `json:"counterparty_address"`
}

var walletKey = os.Getenv("WALLETAPIKEY")
var walletURL = "https://api.covalenthq.com/v1"

func FetchWalletBalances(a model.Profile, w int32) (*WalletResponse, error) {
	baseURL := fmt.Sprintf("%s/%s/address/%s/portfolio_v2/", walletURL, a.Network, a.EntityRef)

	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}

	q := u.Query()
	q.Add("quote-currency", "USD")
	q.Add("days", fmt.Sprintf("%d", w))

	u.RawQuery = q.Encode()

	req, _ := http.NewRequest("GET", u.String(), nil)

	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", walletKey))

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	if err != nil {
		return nil, err
	}

	var response WalletResponse
	err = json.Unmarshal(body, &response)

	return &response, nil
}
