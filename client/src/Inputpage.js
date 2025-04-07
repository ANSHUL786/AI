import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Clipboard } from 'react-bootstrap-icons'; // Import clipboard icon from react-bootstrap-icons


const InputPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFormattedText, setShowFormattedText] = useState(false);

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
    setInputText(rewrittenText);
    setShowFormattedText(true);
    setModalShow(false);
  };

  // Function to copy query and response to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Chat copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
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
    setInputText('');
    setRewrittenText('');
    setShowFormattedText(false);
  };

  return (
    <div className="input-page" style={{ maxHeight: '800px', overflowY: 'auto' }}>
      <Button variant="link" onClick={onBackClick} className="back-btn">
        &larr; Back
      </Button>

      <h2>Ansh - Summary JSON Generator</h2>
      <div className="d-flex flex-column align-items-start">
        {showFormattedText ? (
          <div className="formatted-text-container" style={{ maxHeight: '800px', overflowY: 'auto' }}>
            <ReactMarkdown>{inputText}</ReactMarkdown>
             {/* Copy to clipboard icon */}
             <Button
                  variant="link"
                  className="copy-btn"
                  onClick={() => handleCopyToClipboard(inputText)}
                >
                  <Clipboard size={20} /> {/* Clipboard Icon */}
                </Button>
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
        <Modal.Body style={{ overflow: 'auto', maxHeight: '600px' }}>
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

export default InputPage;
