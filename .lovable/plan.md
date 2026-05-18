# Angela orbits the user flow

Instead of staying in the centre, Angela travels along the orbit circle from station to station as the user clicks Next. She always snaps to the station that is currently "live" (in_progress / review), with a smooth tween between positions.

## Behaviour

- One target angle per click, derived from the current `FlowState`.
- Angela tweens (spring) from her current angle to the new target along the circle — she follows the orbit path, she does not cut across the middle.
- Pose:
  - `walking` while transitioning (during the tween)
  - `standing` once she settles at a station
  - `leaving` only in the Act 3 exit-ready state (she steps off the circle outward)
- The travelling dot on the orbit stays (ambient flow), but Angela becomes the foreground "where are we now" indicator.

## Angle mapping (Act 2 stations already exist)

Existing stations: Watch 0°, Review 120°, Investigate 240°.

We extend the same circle conceptually for Acts 1 and 3 by adding virtual "home" angles so Angela has somewhere meaningful to be before/after the loop:

- Act 1 (establish):
  - Pre-start / idle → 270° (left of circle, "arriving")
  - Onboarding active → 300°
  - KYC active → 330°
  - CRR active / complete → 360° (top), arrives at the loop entry
- Act 2 (ongoing): use existing station angles based on `loopStationStatus`:
  - TM in_progress/alert → Watch 0°
  - kycCase touched → Review 120°
  - amlCase touched → Investigate 240°
  - Pick the highest-severity active station; alert beats in_progress beats done.
- Act 3 (exit):
  - On hold → stay at last alert station
  - Ready → 270° again but rendered slightly outside the radius (she walks out)

A single helper `personaAngle(state): number` in `productCopy.ts` centralises this.

## Pose helper

Update `personaPose(state)` to also accept a "transitioning" hint, or compute pose locally in `Act2Loop` based on whether the angle just changed:

- Maintain a `prevAngle` ref; if `target !== prev`, render `walking` for the duration of the tween, then settle to `standing`.
- Exit-ready overrides to `leaving`.

## Implementation sketch

In `Act2Loop.tsx`:

```ts
const targetAngle = personaAngle(state);
const [displayAngle, setDisplayAngle] = useState(targetAngle);
// framer-motion: useMotionValue + animate() along the shortest arc
// position = (center + R*cos(rad), center + R*sin(rad))
```

- Use `framer-motion`'s `animate(motionValue, target, { type: "spring", stiffness: 120, damping: 18 })` on the angle, then derive x/y in a `useTransform`.
- Shortest-arc logic: if `|target - current| > 180`, add/subtract 360 so she never spins the long way round.
- Replace the centre Angela `<div>` with a motion div positioned via the transformed x/y; remove the `translate(-50%, -55%)` centring offset and instead offset by half her width/height.

## Files to change

- `src/lib/aml/productCopy.ts` — add `personaAngle(state): number`; keep `personaPose` but allow caller to override with "walking" during transitions.
- `src/components/aml/journey/Act2Loop.tsx` — drive Angela's position from `personaAngle`; tween along the arc; toggle pose between walking/standing/leaving based on transition + exit state.
- `src/components/aml/persona/AngelaFigure.tsx` — no structural change; ensure `walking` pose looks good while moving (already does).

No reducer / scenario / right-column-vs-left-column changes. Story card on the left continues to update from `currentAct` unchanged.

## Out of scope

- Re-routing existing scenario steps to add new angles. The mapping is purely derived from current node states.
- Adding new stations on the circle (we keep Watch / Review / Investigate; Act 1 & 3 use angles between them without rendering extra labels).
- Architecture / dev view.
