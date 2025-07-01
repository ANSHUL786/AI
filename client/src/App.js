import React, { useState } from 'react';
import HomePage from './Homepage';
import InputPage from './Inputpage';
import SupportPage from './Supportpage';
import AggregatePage from './AggregatePage';
import NoteTakerPage from './NoteTakerPage';
import AnalyzerPage from './AnalyzerPage';
import AskSurveyPage from './AskSurveyPage';
import SurveyAnalysisPage from './SurveyAnalysisPage';
import OpenQuestionPage from './OpenQuestionPage';


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

  const handleNoteTakerClick = () => {
    setCurrentPage('noteTaker'); // Navigate to noteTakerPage
  }

  const handleBackToHome = () => {
    setCurrentPage('home'); // Navigate back to HomePage
  };

  const handleAnalyzerClick = () => {
    setCurrentPage('analyzer'); // Navigate back to Analyzer page
  };

  const handleAskSurveyClick = () => {
    setCurrentPage('askSurvey'); // Navigate back to AskSurvey page
  };

  const handleOpenQuestionClick = () => {
    setCurrentPage('openQuestion'); // Navigate back to openQuestion page
  };

  const handleSurveyAnalysisClick = () => {
    setCurrentPage('surveyAnalysis'); // Navigate back to surveyAnalysis page
  };

  return (
    <div className="container mt-5">
      {currentPage === 'home' && <HomePage onItemClick={handleItemClick} onSupportClick={handleSupportClick} onAggregateClick={handleAggregateClick} onNoteTakerClick={handleNoteTakerClick} onAnalyzerClick={handleAnalyzerClick} onAskSurveyClick={handleAskSurveyClick} onOpenQuestionClick={handleOpenQuestionClick} onSurveyAnalysisClick={handleSurveyAnalysisClick} />}
      {currentPage === 'input' && <InputPage onBackClick={handleBackToHome} />}
      {currentPage === 'support' && <SupportPage onBackClick={handleBackToHome} />}
      {currentPage === 'aggregate' && <AggregatePage onBackClick={handleBackToHome} />}
      {currentPage === 'noteTaker' && <NoteTakerPage onBackClick={handleBackToHome} />}
      {currentPage === 'analyzer' && <AnalyzerPage onBackClick={handleBackToHome} />}
      {currentPage === 'askSurvey' && <AskSurveyPage onBackClick={handleBackToHome} />}
      {currentPage === 'openQuestion' && <OpenQuestionPage onBackClick={handleBackToHome} />}
      {currentPage === 'surveyAnalysis' && <SurveyAnalysisPage onBackClick={handleBackToHome} />}
    </div>

  );
};

export default App;
