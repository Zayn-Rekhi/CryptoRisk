package profile

import (
	"context"
	"fmt"
	"time"

	"github.com/Zayn-Rekhi/cryptorisk/graph/model"

	"go.mongodb.org/mongo-driver/v2/bson"

	"github.com/Zayn-Rekhi/cryptorisk/internal/database"
)

func GetProfilesByReferences(refs []bson.ObjectID) ([]Profile, error) {
	collection := database.Client.Database("Main").Collection("profile")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	fmt.Printf("%+v\n", refs)

	var profs []Profile

	filter := bson.M{
		"_id": bson.M{
			"$in": refs,
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &profs); err != nil {
		return nil, err
	}

	return profs, nil

}

func ToProfiles(p []Profile) ([]*model.ProfileResponse, error) {
	arr := []*model.ProfileResponse{}
	for _, prof := range p {
		arr = append(arr, &model.ProfileResponse{
			ProfileType: prof.ProfileType,
			EntityRef:   prof.EntityRef,
			Network:     prof.Network,
		})
	}
	return arr, nil
}
