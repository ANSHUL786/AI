import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Import react-markdown

const App = () => {
  const [inputText, setInputText] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFormattedText, setShowFormattedText] = useState(false); // State for formatted text

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleModalShow = async () => {
    setModalShow(true);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/rewrite', {
        text: inputText,
      });
      setRewrittenText(response.data.rewrittenText);
    } catch (error) {
      console.error('Error fetching rewritten text:', error);
      setRewrittenText('Error generating rewritten text.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  const handleAcceptSuggestion = () => {
    setInputText(rewrittenText); // Set rewritten text into original input
    setShowFormattedText(true); // Display formatted text
    setModalShow(false); // Close the modal
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/rewrite', {
        text: inputText,
      });
      setRewrittenText(response.data.rewrittenText);
    } catch (error) {
      console.error('Error fetching rewritten text:', error);
      setRewrittenText('Error generating rewritten text.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText(''); // Clear the input text
    setRewrittenText(''); // Clear the rewritten text
    setShowFormattedText(false); // Reset formatted text display
  };

  return (
    <div className="container mt-5">
      <h2>Ansh Topic positive/negative point generator</h2>
      <br></br>
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
              placeholder="Enter text for description..."
              className="form-control"
              rows="5"
            />
            <Button variant="primary" onClick={handleModalShow} className="mt-3">
              <i className="fas fa-edit"></i> Generate with Google Gemini
            </Button>
          </>
        )}
        <Button variant="danger" onClick={handleReset} className="mt-3">
          Reset
        </Button>
      </div>

      <Modal show={modalShow} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Google Gemini Rewritten Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Original Text:</label>
            <textarea value={inputText} readOnly className="form-control" rows="5" />
          </div>
          <div className="form-group">
            <label>Rewritten Text:</label>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="markdown-container">
                <ReactMarkdown>{rewrittenText}</ReactMarkdown>
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

export default App;
