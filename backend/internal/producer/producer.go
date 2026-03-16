package producer

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"

	"github.com/Zayn-Rekhi/cryptorisk/graph/model"
	"github.com/segmentio/kafka-go"
)

const (
	defaultBrokers = "localhost:9092"
	defaultTopic   = "metrics-requests"
)

// MetricsRequest is the message payload for metrics-requests topic.
type MetricsRequest struct {
	JobID    string          `json:"jobId"`
	UserID   string          `json:"userId"`
	Profiles []*model.Profile `json:"profiles"`
	Window   int32           `json:"window"`
}

// Producer wraps a Kafka writer for metrics requests.
type Producer struct {
	writer *kafka.Writer
	topic  string
}

// New creates a Kafka producer for the metrics-requests topic.
// Uses KAFKA_BROKERS (default: localhost:9092) and KAFKA_TOPIC_METRICS_REQUESTS (default: metrics-requests).
func New() *Producer {
	brokers := os.Getenv("KAFKA_BROKERS")
	if brokers == "" {
		brokers = defaultBrokers
	}

	topic := os.Getenv("KAFKA_TOPIC_METRICS_REQUESTS")
	if topic == "" {
		topic = defaultTopic
	}

	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}

	return &Producer{
		writer: writer,
		topic:  topic,
	}
}

// Produce sends a metrics request to Kafka.
func (p *Producer) Produce(ctx context.Context, req MetricsRequest) error {
	value, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("marshal metrics request: %w", err)
	}

	err = p.writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(req.JobID),
		Value: value,
	})
	if err != nil {
		slog.Error("producer: failed to write message", "jobId", req.JobID, "error", err)
		return fmt.Errorf("write message: %w", err)
	}

	slog.Info("producer: metrics request sent", "jobId", req.JobID, "topic", p.topic)
	return nil
}

// Close closes the producer.
func (p *Producer) Close() error {
	if p.writer == nil {
		return nil
	}
	return p.writer.Close()
}
