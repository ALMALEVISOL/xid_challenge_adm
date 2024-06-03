export const getHundreds = (number) => {
  return Math.floor(number / 100) * 100;
};

export const isDayTime = (timezone) => {
  if (timezone) {
    const currentDate = new Date()
    const hoursDifference = (timezone / 3600)
    //const utcHours = currentDate.getTimezoneOffset() / 60
    if( hoursDifference === (currentDate.getTimezoneOffset() / 60) ){
      return currentDate.getHours() > 6 && currentDate.getHours() < 18; 
    }else{
      currentDate.setHours(currentDate.getHours() + (hoursDifference + currentDate.getTimezoneOffset() / 60))
      return currentDate.getHours() > 6 && currentDate.getHours() < 18; 
    }
  }
  const hours = new Date().getHours();
  return hours > 6 && hours < 18;
};
