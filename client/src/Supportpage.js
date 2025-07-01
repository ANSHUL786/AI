import React, { useState,useEffect  } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Clipboard } from 'react-bootstrap-icons'; // Import clipboard icon from react-bootstrap-icons

const SupportPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // List to store query and response
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState(''); // Store the response text separately
  const [previousResponse, setPreviousResponse] = useState(''); // Store the previous response
  const [displayText, setDisplayText] = useState('');
  const typingSpeed = 5; // Adjust typing speed in milliseconds

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  // Function to submit query and show modal
  const handleModalShow = async () => {
    if (!inputText.trim()) return; // Prevent empty submissions
    setModalShow(true);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/support', {
        text: inputText,
        text2: previousResponse || 'No previous response', // Pass previous response
      });
      setResponseText(response.data.responseText); // Update response text in modal
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponseText('Error generating support response.');
    } finally {
      setLoading(false);
    }
  };

  // Accept suggestion and add to chat history
  const handleAcceptSuggestion = () => {
    const newChatItem = {
      query: inputText,
      response: responseText,
    };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatItem]); // Add to chat history
    setPreviousResponse(responseText); // Set previous response for next query
    setInputText(''); // Clear input field after accepting
    setModalShow(false); // Close the modal
  };

  // Regenerate the response
  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/support', {
        text: inputText,
        text2: previousResponse || 'No previous response',
      });
      setResponseText(response.data.responseText); // Replace with regenerated response
    } catch (error) {
      console.error('Error regenerating response:', error);
      setResponseText('Error generating support response.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the chat history
  const handleReset = () => {
    setChatHistory([]); // Clear the chat history
    setInputText(''); // Clear the input field
    setResponseText(''); // Clear the response text
    setPreviousResponse(''); // Clear the previous response
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  useEffect(() => {
    if (responseText && !loading) {
      // Clear displayText before starting typing effect
      setDisplayText('');
      
      // Function to handle typing effect
      const typeText = (text, index = 0) => {
        if (index < text.length) {
          setDisplayText(prev => prev + text[index]);
          setTimeout(() => typeText(text, index + 1), typingSpeed);
        }
      };
  
      typeText(responseText);
    }
  }, [responseText, loading]);

  // Function to copy query and response to clipboard
  const handleCopyToClipboard = (query, response) => {
    const textToCopy = ` ${response}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Chat copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="support-page" style={{ maxHeight: '800px', overflowY: 'auto' }}>
      <Button variant="link" onClick={onBackClick} className="back-btn">
        &larr; Back
      </Button>

      <h2>Ansh - Support Jam</h2>

      {/* Chat History Section */}
      <div className="chat-history mb-4">
        <ListGroup>
          {chatHistory.map((item, index) => (
            <ListGroup.Item key={index}>
              <strong>Query:</strong> {item.query}
              <div>
                <strong>Response:</strong>
                <div className="markdown-container">
                  <ReactMarkdown>{item.response}</ReactMarkdown>
                </div>
                {/* Copy to clipboard icon */}
                <Button
                  variant="link"
                  className="copy-btn"
                  onClick={() => handleCopyToClipboard(item.query, item.response)}
                >
                  <Clipboard size={20} /> {/* Clipboard Icon */}
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Input and Submission Section */}
      <div className="d-flex flex-column align-items-start">
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
        <Button variant="danger" onClick={handleReset} className="mt-3">
          Reset Chat
        </Button>
      </div>

      {/* Modal for showing the response */}
      <Modal show={modalShow} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Support Response</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto', maxHeight: '600px' }}>
          <div className="form-group">
            <label>Your Query:</label>
            <textarea value={inputText} readOnly className="form-control" rows="3" />
          </div>
          <div className="form-group">
            <label>Response:</label>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="markdown-container">
                <ReactMarkdown>{displayText}</ReactMarkdown>
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
