import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import superagent from 'superagent';
import Fabric from 'fabric';

import './app.css';
import Spinner from './spinner';
import Predictions from './predictions';
import UploadTarget from './upload-target';
import CanvasComponent from './CanvasComponent';

class App extends Component {

  state = {
    files: [],
    isProcessing: false,
    uploadError: null,
    uploadResponse: null
  }
  updateCanvas() {
      const response = this.state.uploadResponse;
      const predictions = response.probabilities;
     
      var img = new Image();
      const file = this.state.files[0];
      
      const context = this.refs.canvas.getContext('2d');
      //this.refs.canvas.width = window.innerWidth;
      //this.refs.canvas.height = window.innerHeight;
      //context.drawImage(img, 0, 0); 

      img.onload = function() {
        context.drawImage(img, 0, 0,this.refs.canvas.width,this.refs.canvas.height));
        for(var i=0;i<predictions.length;i++) {
          var boundingBox = predictions[i].boundingBox;
          var minX = boundingBox.minX;
          var minY = boundingBox.minY;
          var maxX = boundingBox.maxX - minX;
          var maxY = boundingBox.maxY - minY; 
          context.beginPath();
          context.rect(minX, minY, maxX, maxY);
          context.lineWidth = 2;
          context.strokeStyle = 'yellow';
          context.stroke();
        }      
      };      
      
      img.src = file && file.preview;
      //context.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.refs.canvas.width, this.refs.canvas.height);
      
      
  }
  render() {
    const file = this.state.files[0];
    const uploadError = this.state.uploadError;
    const isProcessing = this.state.isProcessing;
    const response = this.state.uploadResponse;
    const predictions = (response && response.probabilities) || [];

    return (
      <div>
        <div className="title">
          <h1 className="intro">
             BAT Einstein Object Detection Demo
             <div className="detail"></div>
          </h1>
        </div>
        <div className={classNames(
          "app",
          file != null ? "app-with-image" : null)}>
          {response || isProcessing ? null : <Dropzone
            accept={'image/png, image/jpeg'}
            multiple={false}
            onDrop={this.onDrop}
            style={{}}
            className={classNames(
              'dropzone','initial-dropzone',
              file != null ? 'dropzone-dropped' : null
            )}
            activeClassName="dropzone-active"
            rejectClassName="dropzone-reject">
            <UploadTarget/>
          </Dropzone>}

          
          <Dropzone
              accept={'image/png, image/jpeg'}
              multiple={false}
              onDrop={this.onDrop}
              style={{}}
              className={classNames(
                'dropzone',
                file != null ? 'dropzone-dropped' : null
              )}
              activeClassName="dropzone-active"
              rejectClassName="dropzone-reject">
          <div className="result-wrapper">
              
              <div className={classNames(
                'image-preview',
                file != null ? 'image-preview-visible' : null)}>
                
                {isProcessing || response ? <img ref="img" id="my-image"
                  alt="Upload preview"
                  src={file && file.preview}
                  style={{ display: 'block' }}/> : null}
                {!response || isProcessing ? null : 
                  <div className="prompt">Drop or tap to upload another.</div>
                }
                <div className="spinner-wrapper">
                  {isProcessing
                    ? <span><Spinner/><div className="spinner-text">Analyzing Image...</div></span>
                    : null}
                  {uploadError
                    ? uploadError
                    :null}
                </div>
              </div>
            
            <Predictions contents={predictions}/>
          </div>
          </Dropzone>
          <canvas ref="canvas" style="position:relative;"/>
        </div>

        <div className="footer">
          <a href="https://github.com/heroku/einstein-vision-node">GitHub</a>
          <a href="https://metamind.readme.io/v1/docs">API Docs</a>
        </div>
      </div>
    );
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      this.setState({
        isProcessing: true,
        files: acceptedFiles,
        uploadError: null,
        uploadResponse: null
      });

      var req = superagent.post('/file-upload');
      acceptedFiles.forEach((file)=> {
        // Backend expects 'file' reference
        req.attach('file', file, file.name);
      });
      req.end((err,res) => {
        this.setState({ isProcessing: false });
        if (err) {
          console.log('file-upload error', err);
          this.setState({ uploadError: err.message });
          return;
        }
        console.log('file-upload response', res);
        
        this.setState({ uploadResponse: JSON.parse(res.text) });
        this.updateCanvas();
      });
    }
  }
}

export default App;
