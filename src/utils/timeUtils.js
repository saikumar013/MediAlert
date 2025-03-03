export const TimeUtils = {
  parseTime: (date) => {
    try {
      // Handle case where date is undefined or null
      if (!date) {
        date = new Date();
      }
      
      // Handle string dates
      if (typeof date === 'string') {
        date = new Date(date);
      }

      // Ensure we have a valid date object
      if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
      }

      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Format as HH:MM with leading zeros
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error parsing time:', error);
      // Return current time as fallback
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
  },

  formatTime: (timeString) => {
    try {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return '';
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  },

  isValidTime: (timeString) => {
    try {
      if (!timeString) return false;
      
      const [hours, minutes] = timeString.split(':').map(Number);
      return !isNaN(hours) && !isNaN(minutes) && 
             hours >= 0 && hours < 24 && 
             minutes >= 0 && minutes < 60;
    } catch (error) {
      console.error('Error validating time:', error);
      return false;
    }
  },

  getCurrentTime: () => {
    const now = new Date();
    return TimeUtils.parseTime(now);
  },

  compareTime: (time1, time2) => {
    try {
      const [hours1, minutes1] = time1.split(':').map(Number);
      const [hours2, minutes2] = time2.split(':').map(Number);
      
      if (hours1 === hours2) {
        return minutes1 - minutes2;
      }
      return hours1 - hours2;
    } catch (error) {
      console.error('Error comparing times:', error);
      return 0;
    }
  },

  isTimeAfter: (time1, time2) => {
    const [hours1, minutes1] = time1.split(':');
    const [hours2, minutes2] = time2.split(':');
    return hours1 > hours2 || (hours1 === hours2 && minutes1 > minutes2);
  }
}; 