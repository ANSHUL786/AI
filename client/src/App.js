import React, { useState } from 'react';
import HomePage from './Homepage';
import InputPage from './Inputpage';
import SupportPage from './Supportpage';
import AggregatePage from './AggregatePage';
import NoteTakerPage from './NoteTakerPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); // Manage the current page

  const handleItemClick = () => {
    setCurrentPage('input'); // Navigate to ipage
  };

  const handleSupportClick = () => {
    setCurrentPage('support'); // Navigate to SupportPage
  };

  const handleAggregateClick = () => {
    setCurrentPage('aggregate'); // Navigate to AggregatePage
  };

  const handleNoteTakerClick=()=>{
    setCurrentPage('noteTaker'); // Navigate to noteTakerPage
  }

  const handleBackToHome = () => {
    setCurrentPage('home'); // Navigate back to HomePage
  };

  return (
    <div className="container mt-5">
      {currentPage === 'home' && <HomePage onItemClick={handleItemClick} onSupportClick={handleSupportClick} onAggregateClick={handleAggregateClick} onNoteTakerClick={handleNoteTakerClick} />}
      {currentPage === 'input' && <InputPage onBackClick={handleBackToHome} />}
      {currentPage === 'support' && <SupportPage onBackClick={handleBackToHome} />}
      {currentPage === 'aggregate' && <AggregatePage onBackClick={handleBackToHome} />}
      {currentPage === 'noteTaker' && <NoteTakerPage onBackClick={handleBackToHome} />}
    </div>
  );
};

export default App;
