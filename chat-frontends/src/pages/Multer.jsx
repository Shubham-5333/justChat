import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardGroup from 'react-bootstrap/CardGroup';
import { toast} from 'react-toastify';
import './Multer.css'





const Multer = () => {

    const [upload, setUpload] = useState([])
    const [images, setImages] = useState([])


    const handleSubmit = async () => {
        // e.preventDefault()
        const formData = new FormData()
        if(upload.length===0){
            toast("Please upload a image")
            return;
        }

        for (let i = 0; i < upload.length; i++) {
            formData.append("image", upload[i]);
        }
        console.log("frontend", upload);
        const response = await axios.post('http://localhost:3000/api/multer', formData)
        toast(response.data.message)
        console.log(response.data.message);
        

    }

    useEffect(() => {
        
        const getImages = async () => {
            const response = await axios.get('http://localhost:3000/api/images')
            console.log("images", response.data.data);
            setImages(response.data.data)
        }
        getImages()
    }, [])

    return (
        <div style={{background:"#AAFFC7",padding:'30px'}}>
            <h1>Image Uploader</h1>
            <form onSubmit={handleSubmit}>
                <label>UPLOAD IMAGE</label><br/>
                <input type="file" name='image' onChange={(e) => { setUpload(e.target.files) }} /><br/><br/>
                <button>Submit</button>
            </form>
            <br />
            {/* <Row xs={1} md={2} className="g-4">
                {Array.from({ length: 2 }).map((_, idx) => (
                    <Col key={idx}>
                        {images.map((image, index) => (

                            <Card key={index}>
                                <Card.Img variant="top" src={`http://localhost:3000${image.images[0]}`} />
                                <Card.Body>
                                    <Card.Title>Card title</Card.Title>
                                    <Card.Text>
                                        This is a longer card with supporting text below as a natural
                                        lead-in to additional content. This content is a little bit
                                        longer.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                ))}
            </Row> */}
            <Row xs={1} sm={2} md={3} lg={5} className="g-3">
                {images.map((image,index) => (
                    <Col key={index}>
                        <Card>
                            <Card.Img
                                variant="top"
                                src={`http://localhost:3000${image.images[0]}`}
                                style={{ height: "250px", objectFit: "cover" }}
                            />
                            <Card.Body>
                                <Card.Title>Image</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

        </div>
    );
}

export default Multer;
