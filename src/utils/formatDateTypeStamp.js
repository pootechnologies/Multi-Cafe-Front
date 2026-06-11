export const formatDateTypeStamp = (isoString) => {
    const date = new Date(isoString);
  
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
  
    return date.toLocaleString('en-GB', options); // Day/Month/Year format
  }