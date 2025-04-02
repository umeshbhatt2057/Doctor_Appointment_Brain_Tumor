import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {

  const currency = '$'

  const calculateAge = (dob) => {
    const today = new Date();
    const birtDate = new Date(dob);

    let age = today.getFullYear() - birtDate.getFullYear();

    // Adjust age if the birthday hasn't occurred yet this year
    if (
        today.getMonth() < birtDate.getMonth() || 
        (today.getMonth() === birtDate.getMonth() && today.getDate() < birtDate.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : null; // Ensure age is never negative
};


  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + ' ' + months[Number(dateArray[1])] + ' ' + dateArray[2]
  }


  const value = {
    calculateAge,
    slotDateFormat,
    currency
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider