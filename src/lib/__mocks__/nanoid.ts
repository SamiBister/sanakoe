// Mock implementation of nanoid for Jest tests
let counter = 0;

export function nanoid(): string {
  counter++;
  return `test-id-${counter}`;
}

// Reset counter for each test
export function resetCounter(): void {
  counter = 0;
}
