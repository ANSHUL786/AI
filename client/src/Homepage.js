import React from 'react';
import { Card, Button } from 'react-bootstrap';

const HomePage = ({ onItemClick, onSupportClick,onAggregateClick,onNoteTakerClick }) => {
  return (
    <div>
      <h2 className="center-lsp">Ansh AI Tools</h2>

      <div className="row">
        <div className="col-md-4">
          <Card className="mb-4 shadow-sm" onClick={onItemClick}>
            <Card.Body>
              <Card.Title>Ansh - Summary</Card.Title>
              <Card.Text>
                Create a list of positive and negative points about a topic.
              </Card.Text>
              <Button variant="primary">Go to Creator</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="mb-4 shadow-sm" onClick={onSupportClick}>
            <Card.Body>
              <Card.Title>Ansh - Support Jam</Card.Title>
              <Card.Text>
                Submit your queries or issues for support and get help with references.
              </Card.Text>
              <Button variant="primary">Go to Support</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="mb-4 shadow-sm" onClick={onAggregateClick}>
            <Card.Body>
              <Card.Title>Ansh - Aggregator</Card.Title>
              <Card.Text>
                Submit your dataset and get aggregate insight with historical dataset.
              </Card.Text>
              <Button variant="primary">Go to Creator</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="mb-4 shadow-sm" onClick={onNoteTakerClick}>
            <Card.Body>
              <Card.Title>Ansh - AI Note Taker</Card.Title>
              <Card.Text>
                Make the summary and Transcription.
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
    </div>
  );
};

export default HomePage;
