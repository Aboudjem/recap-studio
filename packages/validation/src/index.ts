/**
 * @recap-studio/validation
 *
 * Deterministic, runs-anywhere checks that approximate what each reviewer
 * agent does. The agents add depth and judgment; this package guarantees
 * a baseline — and gives the user honest scores even when LLM agents
 * cannot run.
 */
export * from "./types.js";
export * from "./run.js";
export * from "./checks/facts.js";
export * from "./checks/beginner.js";
export * from "./checks/adhd-a11y.js";
export * from "./checks/ux.js";
export * from "./checks/performance.js";
export * from "./checks/security-privacy.js";
export * from "./checks/simplicity.js";
