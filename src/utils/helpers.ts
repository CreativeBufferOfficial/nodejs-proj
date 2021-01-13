export function generateDateHour() {
  const today = new Date();
  return `${today.toJSON().slice(0, 10)} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
}
