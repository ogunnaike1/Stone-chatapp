export const formatTime = (dateInput?: string | number | Date): string => {
  const date = dateInput ? new Date(dateInput) : new Date();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};