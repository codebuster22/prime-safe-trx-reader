import { useEffect, useState } from "react";
import { Tab, Row, Col, ListGroup } from "react-bootstrap";
import { JsonToTable } from "react-json-to-table";
import {loadMetadata} from "../SafeTransactionReader";

const Requests = ({ requests, title }) => {

  const renderRequestItems = () => {
    return requests.map((request, index) => (
      <ListGroup.Item action href={`#link${index + 1}`} key={`LIST-${request.nonce}`}>
        {`${request.nonce}`}
      </ListGroup.Item>
    ));
  };

  const renderRequestPanes = () => {
    return requests.map((request, index) => (
      <Tab.Pane eventKey={`#link${index + 1}`} key={`TAB-${request.nonce}`}>
        <Request request={request} key={`TAB-REQUEST-${request.nonce}`} />
      </Tab.Pane>
    ));
  };

  useEffect(() => {});
  return (
    <>
      <h1>{title}</h1>
      <Tab.Container id="list-group-tabs-example" defaultActiveKey="#link1">
        <Row>
          <Col sm={4}>
            <ListGroup>{renderRequestItems()}</ListGroup>
          </Col>
          <Col sm={8}>
            <Tab.Content>{renderRequestPanes()}</Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </>
  );
};

const Request = ({ request }) => {
  const [metadata, setMetadata] = useState();
  const [isLoaded, setIsLoaded] = useState();


  useEffect(() => {
    if (!isLoaded && !metadata?.version) {
      loadMetadata(request, metadata, setMetadata, setIsLoaded);
    }
  }, [isLoaded, request]);

  return <div style={{color: "#000000"}}>{isLoaded ? <JsonToTable json={metadata} /> : <></>}</div>;
};

export default Requests;
