
export const BUSINESS_HOURS = {
  open: 9, // 9 AM
  close: 18, // 6 PM
  timezone: 'GMT'
};

export const isShopOpen = () => {
  const now = new Date();
  
  // For simplicity, we'll use local time or assume GMT if specified.
  // The user prompt says "current local time is: 2026-05-01T22:01:21Z" which is 10 PM.
  // So it should be closed most of the time we test.
  
  const hours = now.getHours();
  return hours >= BUSINESS_HOURS.open && hours < BUSINESS_HOURS.close;
};

export const getShopClosedMessage = () => {
  return "Thank you for reaching out to DEL SNEAKERS! Our digital division is currently offline for maintenance and inventory synchronization. Our active hours are 9:00 AM - 6:00 PM GMT. We will respond to your transmission as soon as our systems are back online.";
};
