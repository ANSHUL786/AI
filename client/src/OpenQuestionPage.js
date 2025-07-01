import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Clipboard } from 'react-bootstrap-icons';

const OpenQuestionPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // New state for file upload
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [previousResponse, setPreviousResponse] = useState('');
  const [displayText, setDisplayText] = useState('');
  const typingSpeed = 1;

  const handleChange = (e) => {
    setInputText(e.target.value);
  };


  const handleModalShow = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setModalShow(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('text2', previousResponse || 'No previous response');

      const response = await axios.post('http://localhost:5000/getOpenQuestionAnalysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("resonseeeeeeeeeeeeeeeeeeeeeeeeeee")
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
    //setSelectedFile(null); // Clear file input after submission
    setModalShow(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('text2', previousResponse || 'No previous response');

      const response = await axios.post('http://localhost:5000/getOpenQuestionAnalysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("resonseeeeeeeeeeeeeeeeeeeeeeeeeee")
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
    const textToCopy = `${response}`;
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

      <h2>Open Question</h2>
      <h4> Get open ended question analysis.</h4>

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
          placeholder="Ask your question for survey response..."
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
          <Modal.Title>Open Question</Modal.Title>
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

export default OpenQuestionPage;
