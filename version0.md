PROJECT SUMMARY (VERSION 0)
Build a very simple college cycle-sharing web app for one station that will later connect to ESP32 hardware via MQTT. For now, keep everything in-memory but structure the code so that hardware communication can be added where cycle status changes happen [web:70][web:72].

Core user flow:
1. Show a single station: "Main Station".
2. Show 4 cycles: "Cycle A", "Cycle B", "Cycle C", "Cycle D".
3. Each cycle has a status: AVAILABLE or IN_USE.
4. User can:
   - See all cycles and their status.
   - Book an AVAILABLE cycle → status becomes IN_USE.
   - Return an IN_USE cycle → status becomes AVAILABLE.

TECH STACK (V0)
- Frontend:
  - React (or plain React + fetch) SPA.
  - Simple UI: list of cycles, status badges, buttons for Book/Return.
- Backend:
  - Node.js + Express REST API.
  - In-memory data store for 1 station + 4 cycles (no DB for V0).
- Hardware compatibility:
  - Do NOT implement MQTT or ESP32 now.
  - But keep the status-change logic in dedicated functions so later we can call MQTT publish there (e.g., unlockCycle(), lockCycle()) [web:70][web:76].

BACKEND REQUIREMENTS
- Model:
  - Station: { id: "station1", name: "Main Station" }.
  - Cycle: { id: "A" | "B" | "C" | "D", name: "Cycle A"…, status: "AVAILABLE" | "IN_USE" }.
- Endpoints:
  - GET /api/cycles
    - Returns array of 4 cycles with current status.
  - POST /api/book
    - Body: { cycleId: "A" }
    - Only allow if current status is AVAILABLE.
    - Change status to IN_USE.
    - Return updated cycle and a fake OTP (6-digit string).
  - POST /api/return
    - Body: { cycleId: "A" }
    - Only allow if current status is IN_USE.
    - Change status to AVAILABLE.
    - Return updated cycle and some basic ride stats placeholder.
- Put the status-change logic in small helper functions like:
  - setCycleStatus(cycleId, status)
  - unlockCycle(cycleId)  // placeholder where MQTT will be added later
  - lockCycle(cycleId)    // placeholder where MQTT will be added later

FRONTEND REQUIREMENTS
- Simple React app with:
  - useEffect to GET /api/cycles on load.
  - A list showing each cycle:
    - Name: "Cycle A"
    - Status badge: green for AVAILABLE, red for IN_USE.
    - If AVAILABLE → show “Book” button → calls POST /api/book then refreshes list.
    - If IN_USE → show “Return” button → calls POST /api/return then refreshes list.
- Show OTP returned from /api/book in an alert or small info panel.
- Keep styling minimal (basic CSS or inline styles).

IMPLEMENTATION NOTES
- Keep everything in one small Express server file and one small React app file for V0.
- No database, no authentication, no routing complexity.
- Write clear, readable code with small functions so the hardware/MQTT layer can be plugged in later where Book/Return change a cycle’s status.
