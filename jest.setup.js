// Jest setup file
import "@testing-library/jest-dom";

// Mock nanoid to avoid ES module issues
jest.mock("nanoid", () => {
  let counter = 0;
  return {
    nanoid: () => {
      counter++;
      return `test-id-${counter}`;
    },
  };
});
