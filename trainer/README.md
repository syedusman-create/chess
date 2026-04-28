# Chess Trap Trainer

Single-page chess trap trainer for browsing preloaded trap data, replaying SAN move sequences, and stepping forward or backward through a line.

## How to run

Open `index.html` in a browser. No build step is required.

## What is included

- Trap browsing with `Starts` and `Winner` filters
- Trap playback with `Start Trap`, `Previous Step`, `Next Move`, and `Reset`
- `Previous Step` rewinds the current SAN line by replaying it from the start
- Manual SAN entry through `Enter Moves`

## Data format

`trainer/traps.json` is the runtime data file. Each item is loaded from the source JSON and converted into the trainer format at runtime.

Expected source fields:

- `name`
- `moves`
- `side_starts`
- `winner`

## Notes

- The trainer uses Chess.js from a CDN for SAN validation and move execution.
- Chessboard.js and piece images are also loaded from a CDN.
