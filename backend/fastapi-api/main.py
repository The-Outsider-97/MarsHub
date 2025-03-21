from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from horizons_spk import get_ephemeris

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/planet-positions")
def planet_positions(date: str = Query(...)):
    """
    API endpoint to return heliocentric positions of Earth and Mars for a given date.
    """
    earth_pos = get_ephemeris("399", date)
    mars_pos = get_ephemeris("499", date)

    if not earth_pos or not mars_pos:
        return {"error": "Failed to retrieve ephemeris data"}

    return {
        "earth": earth_pos,
        "mars": mars_pos
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



async def app(scope, receive, send):
    assert scope['type'] == 'http'

    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'text/plain'],
        ],
    })
    await send({
        'type': 'http.response.body',
        'body': b'Hello, world!',
    })

@app.get("/api/conjunctions")
def read_conjunctions():
    with open("data/conjunctions_1900_2200.json", "r") as f:
        data = json.load(f)
    return data
