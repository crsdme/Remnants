import React, { useState } from 'react';
import { Calendar } from 'antd';

const App = () => {
  // Initialize state for the current date
  const [currentDate, setCurrentDate] = useState();

  // Handler function to update the current date
  const onPanelChange = (value) => {
    setCurrentDate(value);
  };

  return (
    <div>
      {/* Render the Calendar component */}
      {/* <Calendar 
        value={currentDate} // Set the value prop to control the displayed date
        onChange={onPanelChange} // Handle date change events
        onPanelChange={onPanelChange} // Handle panel change events (like switching month)
      /> */}
    </div>
  );
};

export default App;
