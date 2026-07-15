# Squeeze.it — Client-Side Stress Relief Simulator

Squeeze.it is a high-fidelity, client-side stress relief simulator built using vanilla web technologies. The project runs completely in the browser with zero external framework dependencies, providing a fluid, reactive, and physically simulated interactive soft-body ball.

[Ler em Português](README.pt.md) | **Live Demo**: [leosdc.github.io/squeezeit](https://leosdc.github.io/squeezeit/)

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
- **Plastic Mode**: Generates high-Q bandpass filtered pulses mimicking the popping sound of bubble wrap bubbles.

---

## Advanced Behavioral Subsystems

While designed as a stress-relief simulator, the codebase contains advanced state machines that alter the physics loop based on behavioral triggers:

### 1. Undocumented Crisis Scenarios
- **Threat Evading Loop**: Under specific input conditions, the application enters an undocumented alert state. The physical simulator adds a strong repelling impulse vector driving the ball away from pointer coordinates, scaling facial panic deformities and border-check constraints.
- **Crisis Response Sequence**: If physical inputs remain stagnant during this active threat alert, the simulation triggers a complex response sequence involving localized UI communication rendering, tactical intercept assets, and cursor control confiscation overrides.
- **Operational Failure State**: Successfully evading tactical units during the chase triggers an operational failure sequence, leading to local state cleanup and a clean simulator reset.

### 2. Idle / Sleep State Machine
- **Inactivity Trigger**: In normal simulation modes, if no mouse movement or click is registered for 10 seconds, the idle loop starts.
- **Center Alignment**: The ball is attracted back to the center coordinates of the canvas, and its velocity vectors are dampened.
- **Visual Accessories**: The renderer draws a pillow asset behind the ball and a blanket asset over its lower nodes.
- **State Change**: The mood metric changes to `"Sleeping"`, eyes close into soft arcs, and a floating particle loop renders "Zzz" characters rising in ascending trajectories.
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
