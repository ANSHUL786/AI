import React, { useState } from 'react';
import { Button, Modal, Card } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFormattedText, setShowFormattedText] = useState(false); // State to show formatted text after accepting
  const [showInputPage, setShowInputPage] = useState(false); // State to toggle between list and input page

  // Handle input text change
  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  // Show the modal and generate rewritten text
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

  // Close the modal
  const handleModalClose = () => {
    setModalShow(false);
  };

  // Accept the suggestion and apply it to the input field
  const handleAcceptSuggestion = () => {
    setInputText(rewrittenText); // Set the rewritten text in the original input field
    setShowFormattedText(true); // Show formatted text after accepting
    setModalShow(false); // Close modal
  };

  // Regenerate the text using Google Gemini
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

  // Reset the input and rewritten text fields
  const handleReset = () => {
    setInputText(''); // Clear the input text
    setRewrittenText(''); // Clear the rewritten text
    setShowFormattedText(false); // Reset the formatted text view
  };

  // Handle clicking the first item in the list
  const handleItemClick = () => {
    setShowInputPage(true); // Show the input page
  };

  // Handle going back to the homepage
  const handleBackToHome = () => {
    setShowInputPage(false); // Show the homepage with the list
  };

  return (
    <div className="container mt-5"> 
      {!showInputPage ? (
        // Show the list of items as cards when showInputPage is false
        <div className="row">
          <div className="col-md-4">
            <Card className="mb-4 shadow-sm" onClick={handleItemClick}>
              <Card.Body>
                <Card.Title>Ansh - Topic Positive Negative Point Creator</Card.Title>
                <Card.Text>
                  Create a list of positive and negative points about a topic.
                </Card.Text>
                <Button variant="primary">Go to Creator</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title>Coming Soon...</Card.Title>
                <Card.Text>
                  New exciting features are coming soon. Stay tuned!
                </Card.Text>
                <Button variant="secondary" disabled>
                  Coming Soon
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      ) : (
        // Show the input area page when showInputPage is true
        <div className="input-page">
          {/* Back Button to go back to the homepage */}
          <Button variant="link" onClick={handleBackToHome} className="back-btn">
            &larr; Back
          </Button>

          <h2>Ansh - Topic Positive Negative Point Creator</h2>
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
      )}
    </div>
  );
};

export default App;
