# sdm-assessment

SDM front-end coding exercise.

Recreation of the SD&M RMS “Machines” screen using vanilla HTML, CSS, and JavaScript.

## Tech stack

- HTML5
- CSS3 (flexbox + grid for layout, no frameworks)
- Vanilla JavaScript (ES6)

## How to run

1. Clone or download this repository.
2. Open `index.html` in any modern browser (no build step or server required).

## Implementation notes

- **Layout:** Top toolbar, navigation tabs, and two main sections:
  - “Application Information”
  - “Process Information”
- **Form grid:** Inputs are arranged in a responsive grid to match the reference layout.
- **Multi-select dropdowns:** Custom multi-select components at the top use a button + checkbox menu pattern and store values in hidden inputs for form submission.
- **Validation:**
  - Required fields are highlighted when empty on Save.
  - A status message is shown to indicate simulated validation.
- **Edge cases:**
  - Text fields accept long strings and special characters without breaking layout.
  - Large inputs are logged to the console instead of sending to a backend (per instructions).

## Limitations

- No real backend integration; Save performs a client-side validation and logs a payload to the console.
- Only the visible form fields are wired to the simulated payload; additional fields can be hooked up using the same pattern if needed.
