import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const SupportPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFormattedText, setShowFormattedText] = useState(false);

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleModalShow = async () => {
    setModalShow(true);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/support', {
        text: inputText,
      });
      setResponseText(response.data.responseText);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponseText('Error generating support response.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResponseText('');
    setShowFormattedText(false);
  };


  const handleModalClose = () => {
    setModalShow(false);
  };

  const handleAcceptSuggestion = () => {
    setInputText(responseText);
    setShowFormattedText(true);
    setModalShow(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/rewrite', {
        text: inputText,
      });
      setResponseText(response.data.rewrittenText);
    } catch (error) {
      console.error('Error fetching rewritten text:', error);
      setResponseText('Error generating rewritten text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <Button variant="link" onClick={onBackClick} className="back-btn">
        &larr; Back
      </Button>

      <h2>Ansh - Support Jam</h2>
      <div className="d-flex flex-column align-items-start">
        {showFormattedText ? (
          <div className="formatted-text-container">
            <ReactMarkdown>{inputText}</ReactMarkdown>
          </div>
        ) : (
          <>
            <textarea
              value={inputText}
              onChange={handleChange}
              placeholder="Enter your query or issue..."
              className="form-control"
              rows="5"
            />
            <Button variant="primary" onClick={handleModalShow} className="mt-3">
              <i className="fas fa-edit"></i> Submit Query
            </Button>
          </>
        )}
        <Button variant="danger" onClick={handleReset} className="mt-3">
          Reset
        </Button>
      </div>
      <Modal show={modalShow} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Support Response</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Your Query:</label>
            <textarea value={inputText} readOnly className="form-control" rows="5" />
          </div>
          <div className="form-group">
            <label>Response:</label>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="markdown-container">
                <ReactMarkdown>{responseText}</ReactMarkdown>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAcceptSuggestion} disabled={loading}>
            Accept Suggestion
          </Button>
          <Button variant="warning" onClick={handleRegenerate} disabled={loading}>
            Regenerate
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    
  );
};

export default SupportPage;
