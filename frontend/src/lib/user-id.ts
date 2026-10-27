export function formatUserId(serial: number) {
  return `JTK-${String(serial).padStart(4, "0")}`;
}
