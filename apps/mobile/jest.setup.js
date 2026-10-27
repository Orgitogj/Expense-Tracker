jest.mock("@/lib/firebase", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));
