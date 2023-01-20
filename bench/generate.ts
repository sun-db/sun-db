import { faker } from "@faker-js/faker";

function generateUser() {
  return {
    id: faker.datatype.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.past().toISOString(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    age: faker.datatype.number()
  };
}

export function generateUsers(length: number) {
  return Array.from({ length }, () => generateUser());
}
