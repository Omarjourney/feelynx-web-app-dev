from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Feelynx Backend")

# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return JSONResponse(content={"status": "ok", "service": "backend", "version": "1.0"})


# Example WebSocket route
@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "WebSocket connection established"})
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"echo": data})
    except Exception:
        await websocket.close()


@app.get("/")
async def root():
    return {"message": "Feelynx Backend is running!"}
