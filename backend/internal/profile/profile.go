package profile

import (
	"context"
	"time"

	"github.com/Zayn-Rekhi/cryptorisk/internal/database"
	"github.com/Zayn-Rekhi/cryptorisk/internal/metrics"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Profile struct {
	ID             bson.ObjectID          `json:"_id" bson:"_id"`
	ProfileType    string                 `json:"profile_type" bson:"profile_type"`
	EntityRef      string                 `json:"entity_ref" bson:"entity_ref"`
	Network        string                 `json:"network" bson:"network"`
	SnapshotTime   time.Time              `json:"snapshot_time" bson:"snapshot_time"`
	BalanceMetrics metrics.BalanceMetrics `json:"balance_metrics" bson:"balance_metrics"`
}

func (prof *Profile) ConstructProfile() {
	prof.ID = bson.NewObjectID()
	prof.SnapshotTime = time.Now()
	prof.BalanceMetrics = metrics.BalanceMetrics{}

	prof.SaveProfile()
}

func (prof *Profile) SaveProfile() error {
	collection := database.Client.Database("Main").Collection("profile")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"profile_type": prof.ProfileType,
		"entity_ref":   prof.EntityRef,
		"network":      prof.Network,
	}

	update := bson.M{
		"$setOnInsert": prof,
	}

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After).
		SetProjection(bson.M{"_id": 1})

	var result struct {
		ID bson.ObjectID `bson:"_id"`
	}

	err := collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	if err != nil {
		return err
	}

	prof.ID = result.ID
	return nil
}
