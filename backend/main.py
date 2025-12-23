from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from pipeline import pipeline


app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str

class SplitRequest(BaseModel):
    splitRatio: float

class TrainRequest(BaseModel):
    model: str

@app.post("/split")
def split_data(request: SplitRequest):
    try:
        result = pipeline.split_data_step(request.splitRatio)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/split-info")
def get_split_info():
    try:
        result = pipeline.get_split_info()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve split info.")

@app.post("/train")
def train_model(request: TrainRequest):
    try:
        # Pass only model string now, as splitting is done.
        # But previous pipeline.train_model took config dict? 
        # Check pipeline.train_model signature in previous step. 
        # It takes `model_type: str`. 
        # The previous /train implementation did: config = request.dict(); result = pipeline.train_model(config)
        # I need to fix that calling convention if pipeline.train_model expects a string.
        # Let's fix it here.
        result = pipeline.train_model(request.model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
class PreprocessRequest(BaseModel):
    preprocess: str

class SelectTargetRequest(BaseModel):
    targetColumn: str

@app.post("/select-target")
def select_target(request: SelectTargetRequest):
    try:
        result = pipeline.select_target(request.targetColumn)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/target-info")
def get_target_info():
    try:
        result = pipeline.get_target_info()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve target info.")

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 1. Validate extension
    if not file.filename.lower().endswith(('.csv', '.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported.")
    
    # 2. Read content to check size (limit 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
         raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    
    try:
        # Pass content and filename to pipeline
        result = pipeline.load_data(content, file.filename)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Generic error to avoid leaking internals, though typically we want to log the real error
        raise HTTPException(status_code=500, detail="An error occurred while processing the file.")

@app.get("/preview-data")
def get_preview_data(limit: int = 50):
    try:
        result = pipeline.get_preview(limit)
        return result
    except ValueError as e:
         # Likely "No dataset uploaded"
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve preview data.")

@app.post("/preprocess")
def preprocess_data(request: PreprocessRequest):
    try:
        result = pipeline.preprocess_data(request.preprocess)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/preview-processed")
def get_processed_preview(limit: int = 50):
    try:
        result = pipeline.get_processed_preview(limit)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve processed preview.")

@app.post("/revert-preprocess")
def revert_preprocess():
    try:
        result = pipeline.revert_preprocess()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to revert preprocessing.")



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)