import os
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Feelynx Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")


@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "ok", "service": "backend", "version": "1.0"})


@app.get("/livekit/active-rooms")
async def get_active_rooms():
    """Get list of active LiveKit rooms"""
    try:
        if not LIVEKIT_URL or not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
            return JSONResponse(content={"rooms": []})
        
        # Create LiveKit API client (synchronous)
        livekit_api = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        
        # List active rooms (synchronous call)
        rooms_response = livekit_api.room.list_rooms(api.ListRoomsRequest())
        
        # Format response
        active_rooms = []
        for room in rooms_response.rooms:
            active_rooms.append({
                "name": room.name,
                "sid": room.sid,
                "numParticipants": room.num_participants,
                "creationTime": room.creation_time,
            })
        
        logger.info(f"Found {len(active_rooms)} active rooms")
        return JSONResponse(content={"rooms": active_rooms})
    
    except Exception as e:
        logger.error(f"Error listing rooms: {str(e)}")
        return JSONResponse(content={"rooms": [], "error": str(e)})


@app.post("/livekit/token")
async def generate_livekit_token(request: Request):
    """Generate LiveKit access token"""
    try:
        body = await request.json()
        room_name = body.get("room", "")
        identity = body.get("identity", "user")
        
        if not LIVEKIT_URL or not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
            return JSONResponse(status_code=500, content={"error": "LiveKit not configured"})
        
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(identity).with_name(identity)
        token.with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        ))
        
        jwt_token = token.to_jwt()
        logger.info(f"Generated token for {identity} in room {room_name}")
        return JSONResponse(content={"token": jwt_token})
    
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/livekit/rooms")
async def create_livekit_room(request: Request):
    """Create or get LiveKit room"""
    try:
        body = await request.json()
        room_name = body.get("name", body.get("room", ""))
        
        if not room_name:
            return JSONResponse(status_code=400, content={"error": "Room name is required"})
        
        logger.info(f"Room requested: {room_name}")
        
        return JSONResponse(content={
            "name": room_name,
            "sid": f"RM_{room_name}",
            "emptyTimeout": 300,
            "maxParticipants": 100,
            "creationTime": 0,
            "numParticipants": 0,
        })
    
    except Exception as e:
        logger.error(f"Error creating room: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint"""
    await websocket.accept()
    await websocket.send_json({"message": "Connected"})
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"echo": data})
    except Exception:
        pass


@app.get("/")
async def root():
    return {"message": "Feelynx Backend"}


@app.post("/creators/{creator_id}/status")
async def update_creator_status(creator_id: str, request: Request):
    """Update creator live status"""
    try:
        body = await request.json()
        is_live = body.get("isLive", False)
        
        logger.info(f"Updated creator {creator_id} live status to: {is_live}")
        return JSONResponse(content={"success": True, "creatorId": creator_id, "isLive": is_live})
    
    except Exception as e:
        logger.error(f"Error updating creator status: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})
