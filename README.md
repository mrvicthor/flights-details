# Flight Details

A TypeScript project for modeling flight and airspace details, including unit tests with Jest.

## Project Structure

```
flight-details/
├── jest.config.js
├── package.json
├── tsconfig.json
├── src/
│   ├── airspace.ts
│   ├── flight.ts
│   └── test/
│       ├── airspace.test.ts
│       └── flight.test.ts
```

## Features

- Flight and airspace modeling in TypeScript
- Unit tests for core logic using Jest

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd flight-details
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running Tests

To run all unit tests:

```sh
npm test
```

### Building and Running the Project

To build the TypeScript files and run the main logic:

```sh
npm run build
npm start
```

This will compile the TypeScript code and execute the output in `dist/flight.js` using Node.js.

You can modify `src/flight.ts` to change the main logic or output.

## Project Files

- `src/flight.ts`: Flight model and logic
- `src/airspace.ts`: Airspace model and logic
- `src/test/flight.test.ts`: Jest tests for flight
- `src/test/airspace.test.ts`: Jest tests for airspace

## Configuration

- `jest.config.js`: Jest configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project metadata and scripts

## License

MIT
