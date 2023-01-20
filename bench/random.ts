
export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function randomValue<T>(array: T[]): T {
  return array[randomIndex(array.length)];
}

function randomPower(count: number): number {
  let value = Math.random();
  for(let i = 1; i < count; i+=1) {
    value *= value;
  }
  return value;
}

/**
 * Generate a random index that is more likely to hit certain values,
 * while still being evenly distributed across the length of the array.
 */
export function lessRandomIndex(length: number): number {
  const randomOffset = Math.floor(Math.random() * length);
  return (Math.floor(randomPower(Math.log(length)) * length) + randomOffset) % length;
}

export function lessRandomValue<T>(array: T[]): T {
  return array[lessRandomIndex(array.length)];
}

