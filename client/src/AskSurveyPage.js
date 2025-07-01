import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Clipboard } from 'react-bootstrap-icons';

const AskSurveyPage = ({ onBackClick }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [previousResponse, setPreviousResponse] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handleChange = (e) => setInputText(e.target.value);
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

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

      const response = await axios.post('http://localhost:5000/askSurvey', formData, {
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
    setChatHistory((prev) => [...prev, newChatItem]);
    setPreviousResponse(responseText);
    setInputText('');
    setModalShow(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('text2', previousResponse || 'No previous response');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await axios.post('http://localhost:5000/askSurvey', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  const handleModalClose = () => setModalShow(false);

  useEffect(() => {
  if (!loading) {
    mermaid.initialize({ startOnLoad: false });
    setTimeout(() => {
      const nodes = document.querySelectorAll('.mermaid');
      nodes.forEach((el) => {
        try {
          mermaid.run({ nodes: [el] });
        } catch (e) {
          console.error('Mermaid render error:', e);
        }
      });
    }, 300); // Allow time for Markdown to fully mount
  }
}, [chatHistory, displayText, loading]);

  useEffect(() => {
    if (!loading && displayText.includes('```mermaid')) {
      mermaid.initialize({ startOnLoad: false });
      setTimeout(() => {
        const nodes = document.querySelectorAll('.mermaid');
        nodes.forEach((el) => {
          try {
            mermaid.run({ nodes: [el] });
          } catch (e) {
            console.error('Mermaid render error:', e);
          }
        });
      }, 300);
    }
  }, [displayText, loading]);

  const renderMarkdown = (text) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).trim();
          if (match?.[1] === 'mermaid') {
            return <div className="mermaid">{code}</div>;
          }
          return inline ? (
            <code className={className} {...props}>{code}</code>
          ) : (
            <pre className={className}><code {...props}>{code}</code></pre>
          );
        }
      }}
    >
      {text}
    </ReactMarkdown>
  );

  const handleCopyToClipboard = (query, response) => {
    navigator.clipboard.writeText(response)
      .then(() => alert('Chat copied to clipboard!'))
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="support-page" style={{ maxHeight: '800px', overflowY: 'auto' }}>
      <Button variant="link" onClick={onBackClick} className="back-btn">&larr; Back</Button>
      <h2>Ask Respora</h2>
      <h4>Get Insights, let your survey responses tell.</h4>

      <div className="chat-history mb-4">
        <ListGroup>
          {chatHistory.map((item, index) => (
            <ListGroup.Item key={index}>
              <strong>Query:</strong> {item.query}
              <div><strong>Response:</strong>
                <div className="markdown-container" key={`response-${index}`}>
                  {renderMarkdown(item.response)}
                </div>
                <Button variant="link" className="copy-btn" onClick={() => handleCopyToClipboard(item.query, item.response)}>
                  <Clipboard size={20} />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      <div className="d-flex flex-column align-items-start">
        <textarea value={inputText} onChange={handleChange} placeholder="Ask your question for survey response..." className="form-control" rows="5" />
        <input type="file" onChange={handleFileChange} className="mt-3" />
        {selectedFile && <p className="text-muted mt-2">Selected File: {selectedFile.name}</p>}
        <Button variant="primary" onClick={handleModalShow} className="mt-3">Submit Query</Button>
        <Button variant="danger" onClick={handleReset} className="mt-3">Reset Chat</Button>
      </div>

      <Modal show={modalShow} onHide={handleModalClose}>
        <Modal.Header closeButton><Modal.Title>Ask Respora</Modal.Title></Modal.Header>
        <Modal.Body style={{ overflow: 'auto', maxHeight: '600px' }}>
          <div className="form-group">
            <label>Your Query:</label>
            <textarea value={inputText} readOnly className="form-control" rows="3" />
          </div>
          <div className="form-group">
            <label>Response:</label>
            {loading ? <div>Loading...</div> : <div className="markdown-container">{renderMarkdown(displayText)}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>Close</Button>
          <Button variant="primary" onClick={handleAcceptSuggestion} disabled={loading}>Accept Suggestion</Button>
          <Button variant="warning" onClick={handleRegenerate} disabled={loading}>Regenerate</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AskSurveyPage;