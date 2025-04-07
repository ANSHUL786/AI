import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Clipboard } from 'react-bootstrap-icons';

const NoteTakerPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // New state for file upload
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [previousResponse, setPreviousResponse] = useState('');
  const [displayText, setDisplayText] = useState('');
  const typingSpeed = 2;

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleModalShow = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setModalShow(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('text2', previousResponse || 'No previous response');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await axios.post('http://localhost:5000/noteTaker', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResponseText(response.data.responseText);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponseText('Error generating support response.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    const newChatItem = { query: inputText, response: responseText };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatItem]);
    setPreviousResponse(responseText);
    setInputText('');
    setSelectedFile(null); // Clear file input after submission
    setModalShow(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/noteTaker', {
        text: inputText,
        text2: previousResponse || 'No previous response',
      });

      setResponseText(response.data.responseText);
    } catch (error) {
      console.error('Error regenerating response:', error);
      setResponseText('Error generating support response.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setChatHistory([]);
    setInputText('');
    setResponseText('');
    setPreviousResponse('');
    setSelectedFile(null);
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  useEffect(() => {
    if (responseText && !loading) {
      setDisplayText('');
      const typeText = (text, index = 0) => {
        if (index < text.length) {
          setDisplayText((prev) => prev + text[index]);
          setTimeout(() => typeText(text, index + 1), typingSpeed);
        }
      };

      typeText(responseText);
    }
  }, [responseText, loading]);

  const handleCopyToClipboard = (query, response) => {
    const textToCopy = `Query: ${query}\nResponse: ${response}`;
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

      <h2>Ansh - AI Note Taker</h2>

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
                  <Clipboard size={20} />
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
          placeholder="Enter your query with dataset..."
          className="form-control"
          rows="5"
        />
        
        {/* File Upload Input */}
        <input type="file" onChange={handleFileChange} className="mt-3" />
        {selectedFile && <p className="text-muted mt-2">Selected File: {selectedFile.name}</p>}

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

export default NoteTakerPage;
