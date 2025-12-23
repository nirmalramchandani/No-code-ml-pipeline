import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import io

class PipelineManager:
    def __init__(self):
        self.reset()

    def reset(self):
        self.df = None
        self.dataset_name = None
        self.target_col = None
        self.X = None
        self.y = None
        self.X_processed = None
        self.split_data = None
        self.df_processed = None  # FIX: Ensure processed data is cleared

    def load_data(self, content: bytes, filename: str):
        self.reset() # Reset state on new upload
        try:
            if filename.lower().endswith(".csv"):
                # FIX: skipinitialspace handles CSVs with spaces after commas (e.g., " 5.1")
                df = pd.read_csv(io.BytesIO(content), skipinitialspace=True)
            elif filename.lower().endswith((".xls", ".xlsx")):
                df = pd.read_excel(io.BytesIO(content))
            else:
                raise ValueError("Unsupported file format. Please upload a CSV or Excel file.")

            if df.empty:
                raise ValueError("The uploaded file is empty.")

            # FIX: Force conversion of object columns to numeric
            # This handles cases where data might be read as strings
            for col in df.columns:
                if df[col].dtype == 'object':
                    try:
                        # 'coerce' will turn non-parseable strings into NaN, ensuring the column becomes numeric
                        df[col] = pd.to_numeric(df[col], errors='coerce')
                    except (ValueError, TypeError):
                        pass

            self.df = df
            self.dataset_name = filename
            
            return {
                "message": "File uploaded successfully",
                "filename": filename
            }

        except Exception as e:
            raise e

    def get_preview(self, limit: int = 50):
        if self.df is None:
            raise ValueError("No dataset uploaded.")
        
        preview_df = self.df.head(limit)
        # Replace NaN with None for JSON compatibility
        preview_df = preview_df.where(pd.notnull(preview_df), None)
        
        return {
            "columns": self.df.columns.tolist(),
            "rows": preview_df.to_dict(orient="records"),
            "totalRows": len(self.df),
            "totalColumns": len(self.df.columns)
        }

    def select_target(self, target_col: str):
        if self.df is None:
            raise ValueError("No dataset uploaded.")

        if target_col not in self.df.columns:
            raise ValueError("Selected target column does not exist.")

        # STRICT Validation: Not entirely null
        if self.df[target_col].dropna().empty:
            raise ValueError("Target column cannot be entirely null.")

        # STRICT Validation: At least 2 unique values
        unique_vals = self.df[target_col].nunique()
        if unique_vals < 2:
            raise ValueError("Target column must have at least two unique values.")

        self.target_col = target_col
        self.y = self.df[target_col]
        
        return {
            "targetColumn": target_col,
            "uniqueValues": int(unique_vals),
            "rows": len(self.df),
            "message": "Target column selected successfully"
        }

    def get_target_info(self):
        if self.df is None:
            raise ValueError("No dataset uploaded.")
            
        if self.target_col is None:
            raise ValueError("No target column selected.")
            
        return {
            "targetColumn": self.target_col,
            "uniqueValues": int(self.df[self.target_col].nunique()),
            "rows": len(self.df)
        }

    def preprocess_data(self, strategy: str):
        if self.df is None:
            raise ValueError("No dataset uploaded.")

        if strategy not in {"standardization", "normalization"}:
            raise ValueError("Invalid preprocessing strategy.")

        # Identify numeric columns automatically
        feature_cols = [
            c for c in self.df.columns
            if pd.api.types.is_numeric_dtype(self.df[c])
            and (self.target_col is None or c != self.target_col)
        ]

        if not feature_cols:
            raise ValueError("No numeric feature columns found (target is excluded).")
        
        X = self.df[feature_cols]
        
        # Fill NaNs before scaling to prevent errors
        X = X.fillna(X.mean())

        scaler = StandardScaler() if strategy == "standardization" else MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
        
        self.df_processed = self.df.copy()
        self.df_processed[feature_cols] = X_scaled
        
        self.X_processed = X_scaled

        return {
            "strategy": strategy,
            "featuresUsed": feature_cols,
            "rows": len(self.df_processed)
        }

    def get_processed_preview(self, limit: int = 50):
        if self.df_processed is None:
            raise ValueError("Data has not been processed yet.")
            
        preview_df = self.df_processed.head(limit)
        preview_df = preview_df.where(pd.notnull(preview_df), None)
        
        return {
            "columns": self.df_processed.columns.tolist(),
            "rows": preview_df.to_dict(orient="records"),
            "totalRows": len(self.df_processed),
            "totalColumns": len(self.df_processed.columns)
        }

    def revert_preprocess(self):
        self.df_processed = None
        self.X_processed = None
        return {"message": "Preprocessing reverted. Back to original dataset."}

    def split_data_step(self, split_ratio: float):
        if self.df is None:
             raise ValueError("No dataset uploaded.")

        if self.target_col is None:
            raise ValueError("Target column must be selected before splitting.")

        if not 0.5 <= split_ratio <= 0.9:
            raise ValueError("Split ratio must be between 0.5 and 0.9.")

        # Determine source dataframe: Processed (if available) > Original
        if self.df_processed is not None:
             source_df = self.df_processed
        else:
             source_df = self.df

        # Separate Features (X) and Target (y)
        feature_cols = [
            c for c in source_df.columns
            if pd.api.types.is_numeric_dtype(source_df[c])
            and c != self.target_col
        ]

        if not feature_cols:
             raise ValueError("No numeric features found to split.")

        X = source_df[feature_cols]
        # Handle NaNs in features if using raw data
        X = X.fillna(X.mean())
        
        y = self.df[self.target_col]
        
        if len(X) != len(y):
             raise ValueError("Feature and target row counts mismatch.")

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=1 - split_ratio,
            random_state=42
        )

        self.X = X
        self.y = y
        self.split_data = (X_train, X_test, y_train, y_test)
        self.split_ratio = split_ratio

        return {
            "splitRatio": split_ratio,
            "trainRows": len(X_train),
            "testRows": len(X_test),
            "totalRows": len(X),
            "message": "Dataset split successfully"
        }

    def get_split_info(self):
        if self.split_data is None:
             raise ValueError("Data has not been split yet.")
        
        X_train, X_test, _, _ = self.split_data
        
        return {
            "splitRatio": self.split_ratio,
            "trainRows": len(X_train),
            "testRows": len(X_test)
        }

    def train_model(self, model_type: str):
        if self.split_data is None:
            raise ValueError("Data must be split before training.")

        if model_type not in {"logistic_regression", "decision_tree"}:
            raise ValueError("Invalid model type.")

        X_train, X_test, y_train, y_test = self.split_data

        model = (
            DecisionTreeClassifier(random_state=42)
            if model_type == "decision_tree"
            else LogisticRegression(max_iter=1000, random_state=42)
        )   

        model.fit(X_train, y_train)

        train_acc = accuracy_score(y_train, model.predict(X_train))
        test_acc = accuracy_score(y_test, model.predict(X_test))

        return {
            "model": model_type,
            "accuracy": test_acc,
            "trainAccuracy": train_acc,
            "status": "Model trained successfully"
        }

pipeline = PipelineManager()