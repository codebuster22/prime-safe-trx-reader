import { useEffect, useState } from "react";
import { Tab, Row, Col, ListGroup } from "react-bootstrap";
import { JsonToTable } from "react-json-to-table";

const Requests = ({ requests, title }) => {
  const [metadatas, setMetadata] = useState();

  const renderRequestItems = () => {
    return requests.map((request, index) => (
      <ListGroup.Item action href={`#link${index + 1}`} key={request.none}>
        {`${request.nonce}`}
      </ListGroup.Item>
    ));
  };

  const renderRequestPanes = () => {
    return requests.map((request, index) => (
      <Tab.Pane eventKey={`#link${index + 1}`} key={request.none}>
        <Request request={request} />
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

function hexToString(str) {
  const buf = new Buffer(str, "hex");
  return buf.toString("utf8");
}

const Request = ({ request }) => {
  const [metadata, setMetadata] = useState();
  const [isLoaded, setIsLoaded] = useState();

  const loadMetadata = async (request) => {
    if (!metadata?.version && request?.nonce) {
      const hashInBytes = request.dataDecoded.parameters[request.dataDecoded.parameters.length-1].value;
      const hash = hexToString(hashInBytes.slice(2));
      const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
      const data = await response.json();
      setMetadata(JSON.parse(data));
      if (data) {
        setIsLoaded(true);
      }
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      loadMetadata(request);
    }
  }, [isLoaded, request]);

  return <div style={{color: "#000000"}}>{isLoaded ? <JsonToTable json={metadata} /> : <></>}</div>;
};

export default Requests;
