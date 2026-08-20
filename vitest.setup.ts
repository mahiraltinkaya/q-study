import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest does not unmount between tests on its own; without this, queries leak
// across tests and `getBy*` starts matching elements from an earlier render.
afterEach(cleanup);
