export default function formatTwoDigitNumber(num: number): string {
  if (num < 0) {
    console.error(`Negative number received: ${num}`);
    return "00";
  }

  if (num > 99) {
    console.error(`Number has more than 2 digits: ${num}`);
    return num.toString().slice(-2);
  }

  return num.toString().padStart(2, "0");
}
