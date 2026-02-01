export const formatTime = (dateInput?: string | number | Date) => {
    const date = dateInput ? new Date(dateInput) : new Date();
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
  
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
  
    return `${minutes}:${seconds} ${ampm}`;
  };
  