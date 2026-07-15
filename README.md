# Squeeze.it — Client-Side Stress Relief Simulator

Squeeze.it is a high-fidelity, client-side stress relief simulator built using vanilla web technologies. The project runs completely in the browser with zero external framework dependencies, providing a fluid, reactive, and physically simulated interactive soft-body ball.

---

## Technical Architecture

### 1. Physical Simulation Engine
The application employs a custom soft-body physics engine based on Verlet integration:
- **Discretization**: The boundary of the ball is modeled as a closed ring of 24 interconnected node points (masses).
- **Spring-Mass-Damper Constraints**: Internal restoring forces are calculated at each frame using Hooke's Law ($F = -k \cdot x$) combined with damping factors to simulate elastic rubber and viscous slime behaviors.
- **Pointer Deformation**: User inputs (clicks, drags, and touch events) calculate radial deformation vectors. Nodes adjacent to the pointer are repelled, creating a realistic squash-and-stretch effect. On pointer release, stored potential energy is converted back to kinetic energy, triggering a dampening spring oscillation.

### 2. Procedural Audio Synthesizer
Audio effects are generated dynamically via the **Web Audio API** to avoid latency and overhead associated with static audio files:
- **Compress (Press)**: An oscillator node sweeps from high to low frequencies (frequency modulation) combined with a gain node envelope to produce a squish sound.
- **Release**: A rapid, short noise envelope combined with a low-pass filter simulates the rubber returning to its resting state.
- **Plástico Mode**: Generates high-Q bandpass filtered pulses mimicking the popping sound of bubble wrap bubbles.

---

## Advanced Behavioral Subsystems

While designed as a stress-relief simulator, the codebase contains advanced state machines that alter the physics loop based on behavioral triggers:

### 1. Threat Avoidance & Proximity Stress (Knife Mode)
- **Trigger**: Activated by registering 5 sequential click events on the main header.
- **Pathology**: The cursor changes to a blade vector, and the ball enters a high-alert panic state.
- **Vector Evading**: The physics loop calculates the distance between the ball and the pointer. A strong repelling impulse is added to the ball's velocity vector, driving it away from the cursor.
- **Facial Deformation**: The panic factor (ranging from 0.0 to 1.0) dynamically scales the eyes and pupil sizes, simulating fear. If cornered near the canvas boundaries, the ball enters a high-frequency shaking loop and covers its face.

### 2. Thread Contention & Emergency Dispatch (The 190 Event)
- **Communication Flow**: If the cursor (threat) remains stationary for 3 seconds, the ball stops fleeing, spawns a cellular phone interface, and initiates a synchronous 10-step chat dialogue with the local emergency dispatch (190). Text boxes are dynamically sized at runtime using canvas context text measurement APIs (`measureText`).
- **Tactical Interception**: Upon dialogue termination, a vehicle asset (190px width) enters the viewport, and two tactical officers (35px radius) deploy. They chase the threat using gravitational acceleration physics.
- **User Input Confiscation**: Upon collision with the cursor, the tactical officer captures pointer coordinates. The browser cursor style is set to `none`, completely neutralizing user control. The cursor is towed back to the vehicle, and the simulation resets.
- **Mission Failure State**: If the user manages to evade the officers and stab the ball during the active chase:
  - The chase loop is immediately aborted to prevent state concurrency bugs.
  - The officers halt their vectors, walk toward each other, align their pupils, and output a dialogue bubble: *"É, a gente tentou..."*.
  - They return to the vehicle, which reverses out of the screen before triggering the simulation reset.

### 3. Idle / Sleep State Machine
- **Inactivity Trigger**: In normal simulation modes, if no mouse movement or click is registered for 10 seconds, the idle loop starts.
- **Center Alignment**: The ball is attracted back to the center coordinates of the canvas, and its velocity vectors are dampened.
- **Visual Accessories**: The renderer draws a pillow asset behind the ball and a blanket asset over its lower nodes.
- **State Change**: The mood metric changes to `"Dormindo"`, eyes close into soft arcs, and a floating particle loop renders "Zzz" characters rising in ascending trajectories.
- **Interrupt Handler**: Any physical input instantly wakes the ball, launching pillow feather particles and restoring the standard loop.

---

## Directory Structure

```
.
├── index.html        # Semantic HTML markup and DOM structures
├── styles.css        # Responsive layouts, theme definitions, and viewport adaptivity
├── app.js            # Core physics, audio, dialogue engines, and render loops
├── LICENSE           # MIT License
└── SECURITY.md       # Security guidelines
```

---

## Installation & Running

Since the simulator is built strictly with vanilla web technologies:
1. Clone this repository:
   ```bash
   git clone https://github.com/Leosdc/squeezeit.git
   ```
2. Open `index.html` in any modern web browser.
3. To host the project, simply serve the root directory using any static web server (e.g., GitHub Pages, Nginx, or local python http server: `python -m http.server 8000`).

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
