import pandas as pd
import numpy as np
import ast
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
from sklearn.metrics.pairwise import cosine_similarity


def parse_multi(value):
    if pd.isna(value):
        return []

    try:
        parsed = ast.literal_eval(str(value))

        if isinstance(parsed, list):
            return [str(x).lower().strip() for x in parsed]

    except Exception:
        pass

    return [str(value).lower().strip()]


class PlantRecommender:

    def __init__(self, dataset_path: str = "plant_dataset_100k.csv"):

        # =========================================
        # LOAD DATASET
        # =========================================

        df = pd.read_csv(dataset_path)

        # remove unnamed columns
        df = df.loc[:, ~df.columns.str.contains("^Unnamed")]

        self.df = df

        # =========================================
        # MULTI LABEL ENCODERS
        # =========================================

        self.mlb_season = MultiLabelBinarizer()
        self.mlb_category = MultiLabelBinarizer()

        season_enc = self.mlb_season.fit_transform(
            df["suitable_season"].apply(parse_multi)
        )

        category_enc = self.mlb_category.fit_transform(
            df["category"].apply(parse_multi)
        )

        # =========================================
        # INDOOR / OUTDOOR
        # =========================================

        placement_enc = pd.get_dummies(
            df["indoor_outdoor"].astype(str).str.lower()
        )

        self.placement_options = placement_enc.columns.tolist()

        

        # =========================================
        # FINAL FEATURE MATRIX
        # =========================================

        self.X = np.hstack([
            season_enc,
            category_enc,
            placement_enc.to_numpy()
        ])

        self.scaler = StandardScaler()

        self.X_scaled = self.scaler.fit_transform(self.X)

    # =====================================================
    # USER ENCODING
    # =====================================================

    def encode_user(self, data: dict) -> np.ndarray:

        seasons = [
            s.lower().strip()
            for s in (data.get("season") or [])
        ]

        categories = [
            c.lower().strip()
            for c in (data.get("categories") or [])
        ]

        # =========================================
        # SEASON ENCODING
        # =========================================

        season_enc = self.mlb_season.transform([seasons])

        # =========================================
        # CATEGORY ENCODING
        # =========================================

        category_enc = self.mlb_category.transform([categories])

        # =========================================
        # INDOOR / OUTDOOR ENCODING
        # =========================================

        placement_vec = np.zeros((1, len(self.placement_options)))

        placement = (
            data.get("indoor_outdoor") or ""
        ).lower().strip()

        if placement in self.placement_options:

            placement_vec[
                0,
                self.placement_options.index(placement)
            ] = 1

        elif "both" in self.placement_options:

            placement_vec[
                0,
                self.placement_options.index("both")
            ] = 1



        # =========================================
        # FINAL USER VECTOR
        # =========================================

        vec = np.hstack([
            season_enc,
            category_enc,
            placement_vec,
        ])

        return self.scaler.transform(vec)

    # =====================================================
    # RECOMMEND FUNCTION
    # =====================================================

    def recommend(self, user_data: dict, top_k: int = 10):

        df = self.df.copy()

        # =========================================
        # HARD FILTER : INDOOR / OUTDOOR
        # =========================================

        placement = (
            user_data.get("indoor_outdoor") or ""
        ).lower().strip()

        if placement:

            df = df[
                (
                    df["indoor_outdoor"]
                    .str.lower()
                    == placement
                )
                |
                (
                    df["indoor_outdoor"]
                    .str.lower()
                    == "both"
                )
            ]

        # =========================================
        # HARD FILTER : SEASON
        # =========================================

        seasons = [
            s.lower().strip()
            for s in (user_data.get("season") or [])
        ]

        if seasons:

            season_set = set(seasons)

            def season_match(cell):

                vals = parse_multi(cell)

                return bool(
                    season_set.intersection(vals)
                )

            df = df[
                df["suitable_season"]
                .apply(season_match)
            ]

        # =========================================
        # HARD FILTER : CATEGORY
        # =========================================

        categories = [
            c.lower().strip()
            for c in (user_data.get("categories") or [])
        ]

        if categories:

            category_set = set(categories)

            def category_match(cell):

                vals = parse_multi(cell)

                return bool(
                    category_set.intersection(vals)
                )

            df = df[
                df["category"]
                .apply(category_match)
            ]

        # =========================================
        # NO MATCHES
        # =========================================

        if df.empty:
            return []

        # =========================================
        # USER VECTOR
        # =========================================

        user_vec = self.encode_user(user_data)

        # =========================================
        # DATASET SUBSET
        # =========================================

        subset_X_scaled = self.X_scaled[df.index]

        # =========================================
        # COSINE SIMILARITY
        # =========================================

        sims = cosine_similarity(
            user_vec,
            subset_X_scaled
        )[0]

        # =========================================
        # SORT RESULTS
        # =========================================

        df = df.copy()

        df["similarity"] = sims

        df = df.sort_values(
            "similarity",
            ascending=False
        )

        # =========================================
        # TOP RESULTS
        # =========================================

        if top_k and top_k > 0:
            df = df.head(top_k)

        # =========================================
        # PLANT ID
        # =========================================

        df["plant_id"] = df.index

        # =========================================
        # OUTPUT COLUMNS
        # =========================================

        cols = [
            "plant_id",
            "common_name",
            "category",
            "suitable_season",
            "indoor_outdoor",
        ]


        cols.append("similarity")

        # =========================================
        # RETURN RESULTS
        # =========================================

        return df[cols].to_dict(orient="records")